-- ============================================================================
-- ICONS · P3 — 팝업/티케팅 (DRAFT)
-- 티켓 회차/재고 · 예매(원자적 재고 차감) · 결제 · 전자티켓(QR) · 검표 · 환불
-- 근거: docs/ARCHITECTURE.md §5.5,§7,§9  ·  docs/PRD.md §5.5
-- ============================================================================

create type ticket_order_status as enum ('pending', 'paid', 'canceled');
create type ticket_status       as enum ('valid', 'used', 'refunded');

-- ---------------------------------------------------------------------------
-- 회차/종류 · 예매 · 티켓 · 검표
-- ---------------------------------------------------------------------------
create table public.ticket_types (
  id          uuid primary key default extensions.gen_random_uuid(),
  event_id    text not null references public.events (id) on delete cascade,
  name        text not null,                       -- 회차/종류명
  price       integer not null check (price >= 0),  -- KRW
  capacity    integer not null check (capacity >= 0),
  sold        integer not null default 0 check (sold >= 0),
  per_user_limit integer not null default 4,
  sales_open_at  timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  check (sold <= capacity)
);
create trigger trg_ticket_types_updated before update on public.ticket_types
  for each row execute function public.set_updated_at();
create index ticket_types_event_idx on public.ticket_types (event_id);

create table public.ticket_orders (
  id         uuid primary key default extensions.gen_random_uuid(),
  user_id    uuid not null references public.profiles (id) on delete restrict,
  event_id   text not null references public.events (id),
  status     ticket_order_status not null default 'pending',
  total      bigint not null default 0,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_ticket_orders_updated before update on public.ticket_orders
  for each row execute function public.set_updated_at();
create index ticket_orders_user_idx on public.ticket_orders (user_id, created_at desc);

create table public.tickets (
  id              uuid primary key default extensions.gen_random_uuid(),
  ticket_order_id uuid not null references public.ticket_orders (id) on delete cascade,
  ticket_type_id  uuid not null references public.ticket_types (id),
  qr_token        text unique,                      -- 결제 확정 시 발급
  status          ticket_status not null default 'valid',
  created_at      timestamptz not null default now()
);
create index tickets_order_idx on public.tickets (ticket_order_id);

create table public.check_ins (
  ticket_id  uuid primary key references public.tickets (id) on delete cascade,
  checked_at timestamptz not null default now(),
  by_staff   uuid references public.profiles (id)
);

-- ============================================================================
-- RPC
-- ============================================================================

-- 예매: 재고 원자적 차감(FOR UPDATE) + pending 예매. 결제 확정 시 QR 발급.
create or replace function public.reserve_tickets(p_ticket_type_id uuid, p_qty integer)
returns uuid
language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_user  uuid := (select auth.uid());
  v_cap   integer; v_sold integer; v_price integer; v_limit integer; v_open timestamptz;
  v_event text; v_order uuid; v_already integer;
begin
  if v_user is null then raise exception 'auth required'; end if;
  if p_qty < 1 then raise exception 'invalid qty'; end if;

  select capacity, sold, price, per_user_limit, sales_open_at, event_id
    into v_cap, v_sold, v_price, v_limit, v_open, v_event
    from ticket_types where id = p_ticket_type_id for update;
  if v_cap is null then raise exception 'ticket type not found'; end if;
  if v_open is not null and now() < v_open then raise exception 'sales not open'; end if;
  if v_sold + p_qty > v_cap then raise exception 'sold out'; end if;

  -- 1인 한도(확정+선점 합산)
  select coalesce(sum(t.cnt),0) into v_already from (
    select count(*) cnt from tickets tk
      join ticket_orders o on o.id = tk.ticket_order_id
      where tk.ticket_type_id = p_ticket_type_id and o.user_id = v_user and o.status <> 'canceled'
  ) t;
  if v_already + p_qty > v_limit then raise exception 'per-user limit exceeded'; end if;

  update ticket_types set sold = sold + p_qty where id = p_ticket_type_id;

  insert into ticket_orders (user_id, event_id, status, total, expires_at)
  values (v_user, v_event, 'pending', v_price::bigint * p_qty, now() + interval '10 minutes')
  returning id into v_order;

  -- 좌석 자리 확보용 placeholder 티켓(QR은 결제 확정 시 발급)
  insert into tickets (ticket_order_id, ticket_type_id)
  select v_order, p_ticket_type_id from generate_series(1, p_qty);

  return v_order;
end; $$;

-- 결제 확정(웹훅): 멱등. QR 발급 + 예매 paid.
create or replace function public.confirm_ticket_payment(
  p_idempotency_key text, p_ticket_order_id uuid, p_payment_key text, p_amount bigint, p_raw jsonb
)
returns void
language plpgsql security definer set search_path = public, pg_temp as $$
declare v_user uuid; v_total bigint; v_status ticket_order_status; v_expires_at timestamptz;
        v_existing record;
begin
  select id, purpose, ref_id, amount, status into v_existing
    from payments where idempotency_key = p_idempotency_key for update;
  if v_existing.id is not null then
    if v_existing.purpose <> 'ticket' or v_existing.ref_id is distinct from p_ticket_order_id then
      raise exception 'idempotency conflict';
    end if;
    if v_existing.status in ('paid', 'refunded') then return; end if;
    if v_existing.status <> 'pending' then raise exception 'payment not payable'; end if;
  end if;

  select user_id, total, status, expires_at into v_user, v_total, v_status, v_expires_at
    from ticket_orders where id = p_ticket_order_id for update;
  if v_user is null then raise exception 'ticket order not found'; end if;
  if v_status <> 'pending' then raise exception 'ticket order not payable'; end if;
  if v_expires_at is not null and now() >= v_expires_at then raise exception 'ticket order expired'; end if;
  if p_amount <> v_total then raise exception 'amount mismatch'; end if;
  if v_existing.id is not null and v_existing.amount <> p_amount then raise exception 'amount mismatch'; end if;

  insert into payments (user_id, purpose, ref_id, amount, status, payment_key, idempotency_key, raw)
  values (v_user, 'ticket', p_ticket_order_id, p_amount, 'paid', p_payment_key, p_idempotency_key, p_raw)
  on conflict (idempotency_key) do update set status = 'paid', payment_key = excluded.payment_key, raw = excluded.raw;

  if v_status = 'pending' then
    update ticket_orders set status = 'paid', expires_at = null where id = p_ticket_order_id;
    update tickets set qr_token = encode(extensions.gen_random_bytes(16), 'hex')
      where ticket_order_id = p_ticket_order_id and qr_token is null;
  end if;
end; $$;

-- 검표: QR 1회 사용 보장
create or replace function public.check_in_ticket(p_qr_token text)
returns ticket_status
language plpgsql security definer set search_path = public, pg_temp as $$
declare v_id uuid; v_status ticket_status;
begin
  if not is_staff() then raise exception 'forbidden'; end if;
  select id, status into v_id, v_status from tickets where qr_token = p_qr_token for update;
  if v_id is null then raise exception 'invalid ticket'; end if;
  if v_status <> 'valid' then return v_status; end if;   -- 이미 사용/환불
  update tickets set status = 'used' where id = v_id;
  insert into check_ins (ticket_id, by_staff) values (v_id, (select auth.uid()))
    on conflict (ticket_id) do nothing;
  return 'used'::ticket_status;
end; $$;

-- 예매 취소/환불: 재고 복원 + 티켓 무효 + refunds
create or replace function public.refund_ticket_order(p_ticket_order_id uuid, p_reason text)
returns void
language plpgsql security definer set search_path = public, pg_temp as $$
declare v_user uuid; v_status ticket_order_status; v_pay uuid; v_amt bigint; r record;
begin
  select user_id, status into v_user, v_status from ticket_orders where id = p_ticket_order_id for update;
  if v_user is null then raise exception 'ticket order not found'; end if;
  if (select auth.uid()) <> v_user and not is_staff() then raise exception 'forbidden'; end if;
  if v_status = 'canceled' then return; end if;

  -- 미사용 티켓만 환불 가능
  if exists (select 1 from tickets where ticket_order_id = p_ticket_order_id and status = 'used') then
    raise exception 'used ticket cannot be refunded';
  end if;

  for r in
    select ticket_type_id, count(*) cnt from tickets
    where ticket_order_id = p_ticket_order_id group by ticket_type_id
  loop
    update ticket_types set sold = sold - r.cnt where id = r.ticket_type_id;
  end loop;

  update tickets set status = 'refunded' where ticket_order_id = p_ticket_order_id;
  update ticket_orders set status = 'canceled' where id = p_ticket_order_id;

  select id, amount into v_pay, v_amt from payments
    where purpose = 'ticket' and ref_id = p_ticket_order_id and status = 'paid' limit 1;
  if v_pay is not null then
    insert into refunds (payment_id, amount, reason) values (v_pay, v_amt, p_reason);
    update payments set status = 'refunded' where id = v_pay;
  end if;
end; $$;

-- ============================================================================
-- RLS · 권한
-- ============================================================================
alter table public.ticket_types  enable row level security;
alter table public.ticket_orders enable row level security;
alter table public.tickets       enable row level security;
alter table public.check_ins     enable row level security;

create policy ticket_types_read  on public.ticket_types for select using (true);
create policy ticket_types_insert on public.ticket_types for insert with check ((select public.is_staff()));
create policy ticket_types_update on public.ticket_types for update
  using ((select public.is_staff())) with check ((select public.is_staff()));
create policy ticket_types_delete on public.ticket_types for delete using ((select public.is_staff()));

create policy ticket_orders_self on public.ticket_orders for select
  using ((select auth.uid()) = user_id or (select public.is_staff()));

create policy tickets_self on public.tickets for select
  using (exists (select 1 from ticket_orders o where o.id = ticket_order_id
                 and (o.user_id = (select auth.uid()) or (select public.is_staff()))));

create policy check_ins_staff on public.check_ins for select using ((select public.is_staff()));

grant select on public.ticket_types to anon, authenticated;
grant insert, update, delete on public.ticket_types to authenticated;
grant select on public.ticket_orders, public.tickets, public.check_ins to authenticated;

revoke all on function public.reserve_tickets(uuid, integer) from public;
grant execute on function public.reserve_tickets(uuid, integer) to authenticated;
revoke all on function public.confirm_ticket_payment(text, uuid, text, bigint, jsonb) from public;
grant execute on function public.confirm_ticket_payment(text, uuid, text, bigint, jsonb) to service_role;
revoke all on function public.check_in_ticket(text) from public;
grant execute on function public.check_in_ticket(text) to authenticated;  -- is_staff() 내부 검사
revoke all on function public.refund_ticket_order(uuid, text) from public;
grant execute on function public.refund_ticket_order(uuid, text) to authenticated, service_role;
