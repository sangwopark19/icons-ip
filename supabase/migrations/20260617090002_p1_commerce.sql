-- ============================================================================
-- ICONS · P1 — 굿즈 커머스 (DRAFT)
-- 장바구니 · 주문 · 결제(토스페이먼츠) · 환불 · 재고
-- 근거: docs/ARCHITECTURE.md §5.4,§7,§9  ·  docs/PRD.md §5.3
-- ============================================================================

create type order_status   as enum ('pending', 'paid', 'shipping', 'done', 'canceled');
create type payment_status as enum ('pending', 'paid', 'canceled', 'failed', 'refunded');
create type payment_purpose as enum ('order', 'ticket', 'wallet');  -- P2/P3에서 공용

-- 굿즈 실재고(표시용 stock 컬럼과 별개로 수량 차감 대상)
alter table public.goods add column stock_qty integer not null default 0 check (stock_qty >= 0);

-- ---------------------------------------------------------------------------
-- 장바구니
-- ---------------------------------------------------------------------------
create table public.cart_items (
  user_id    uuid not null references public.profiles (id) on delete cascade,
  good_id    text not null references public.goods (id) on delete cascade,
  qty        integer not null check (qty > 0),
  created_at timestamptz not null default now(),
  primary key (user_id, good_id)
);

-- ---------------------------------------------------------------------------
-- 주문
-- ---------------------------------------------------------------------------
create table public.orders (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles (id) on delete restrict,
  status     order_status not null default 'pending',
  total      bigint not null check (total >= 0),  -- KRW
  address    jsonb,
  expires_at timestamptz,                          -- pending 선점 만료(미결제 정리)
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_orders_updated before update on public.orders
  for each row execute function public.set_updated_at();
create index orders_user_idx on public.orders (user_id, created_at desc);

create table public.order_items (
  id         uuid primary key default gen_random_uuid(),
  order_id   uuid not null references public.orders (id) on delete cascade,
  good_id    text not null references public.goods (id),
  qty        integer not null check (qty > 0),
  unit_price integer not null check (unit_price >= 0)
);
create index order_items_order_idx on public.order_items (order_id);

-- ---------------------------------------------------------------------------
-- 결제 (P1~P3 공용) · 환불
-- ---------------------------------------------------------------------------
create table public.payments (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.profiles (id),
  purpose         payment_purpose not null,
  ref_id          uuid,                       -- order_id / ticket_order_id / null(wallet)
  amount          bigint not null check (amount >= 0),
  status          payment_status not null default 'pending',
  payment_key     text,                        -- 토스 paymentKey
  idempotency_key text not null unique,        -- 웹훅 멱등 키
  raw             jsonb,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create trigger trg_payments_updated before update on public.payments
  for each row execute function public.set_updated_at();
create index payments_ref_idx on public.payments (purpose, ref_id);

create table public.refunds (
  id         uuid primary key default gen_random_uuid(),
  payment_id uuid not null references public.payments (id),
  amount     bigint not null check (amount >= 0),
  reason     text,
  status     text not null default 'requested' check (status in ('requested','done','failed')),
  created_at timestamptz not null default now()
);

-- ============================================================================
-- RPC
-- ============================================================================

-- 주문 생성: 장바구니 → 재고 선점(원자적) → pending 주문. 결제 확정 전 선점 모델.
-- (PRD §5.3 "결제 확정 시 차감"을 초과판매 방지를 위해 '주문 시 선점'으로 강화 — 미결제 시 expires_at로 복원)
create or replace function public.place_order(p_address jsonb)
returns uuid
language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_user  uuid := auth.uid();
  v_order uuid;
  v_total bigint := 0;
  r record;
begin
  if v_user is null then raise exception 'auth required'; end if;
  if not exists (select 1 from cart_items where user_id = v_user) then
    raise exception 'cart empty';
  end if;

  insert into orders (user_id, status, total, address, expires_at)
  values (v_user, 'pending', 0, p_address, now() + interval '15 minutes')
  returning id into v_order;

  -- 카트 항목을 결정적 순서로 잠가 데드락 회피
  for r in
    select c.good_id, c.qty, g.price
    from cart_items c
    join goods g on g.id = c.good_id
    where c.user_id = v_user
    order by c.good_id
    for update of g
  loop
    if (select stock_qty from goods where id = r.good_id) < r.qty then
      raise exception 'out of stock: %', r.good_id;
    end if;
    update goods set stock_qty = stock_qty - r.qty where id = r.good_id;
    insert into order_items (order_id, good_id, qty, unit_price)
    values (v_order, r.good_id, r.qty, r.price);
    v_total := v_total + r.price * r.qty;
  end loop;

  update orders set total = v_total where id = v_order;
  delete from cart_items where user_id = v_user;
  return v_order;  -- 클라이언트는 이 주문으로 토스 결제 시작
end; $$;

-- 결제 확정(웹훅): 멱등. 주문을 paid로.
create or replace function public.confirm_order_payment(
  p_idempotency_key text, p_order_id uuid, p_payment_key text, p_amount bigint, p_raw jsonb
)
returns void
language plpgsql security definer set search_path = public, pg_temp as $$
declare v_user uuid; v_total bigint; v_status order_status; v_expires_at timestamptz;
begin
  -- 멱등: 이미 처리된 키면 무시
  if exists (select 1 from payments where idempotency_key = p_idempotency_key and status = 'paid') then
    return;
  end if;

  select user_id, total, status, expires_at into v_user, v_total, v_status, v_expires_at
    from orders where id = p_order_id for update;
  if v_user is null then raise exception 'order not found'; end if;
  if v_status <> 'pending' then raise exception 'order not payable'; end if;
  if v_expires_at is not null and now() >= v_expires_at then raise exception 'order expired'; end if;
  if p_amount <> v_total then raise exception 'amount mismatch'; end if;

  insert into payments (user_id, purpose, ref_id, amount, status, payment_key, idempotency_key, raw)
  values (v_user, 'order', p_order_id, p_amount, 'paid', p_payment_key, p_idempotency_key, p_raw)
  on conflict (idempotency_key) do update set status = 'paid', payment_key = excluded.payment_key, raw = excluded.raw;

  if v_status = 'pending' then
    update orders set status = 'paid', expires_at = null where id = p_order_id;
  end if;
end; $$;

-- 주문 취소/환불: 재고 복원 + refunds 기록 (토스 취소는 앱/웹훅에서 호출)
create or replace function public.cancel_order(p_order_id uuid, p_reason text)
returns void
language plpgsql security definer set search_path = public, pg_temp as $$
declare v_user uuid; v_status order_status; v_pay uuid; v_amt bigint; r record;
begin
  select user_id, status into v_user, v_status from orders where id = p_order_id for update;
  if v_user is null then raise exception 'order not found'; end if;
  if auth.uid() <> v_user and not is_staff() then raise exception 'forbidden'; end if;
  if v_status = 'canceled' then return; end if;

  for r in select good_id, qty from order_items where order_id = p_order_id loop
    update goods set stock_qty = stock_qty + r.qty where id = r.good_id;
  end loop;

  update orders set status = 'canceled' where id = p_order_id;

  select id, amount into v_pay, v_amt from payments
    where purpose = 'order' and ref_id = p_order_id and status = 'paid' limit 1;
  if v_pay is not null then
    insert into refunds (payment_id, amount, reason) values (v_pay, v_amt, p_reason);
    update payments set status = 'refunded' where id = v_pay;
  end if;
end; $$;

-- ============================================================================
-- RLS · 권한
-- ============================================================================
alter table public.cart_items  enable row level security;
alter table public.orders      enable row level security;
alter table public.order_items enable row level security;
alter table public.payments    enable row level security;
alter table public.refunds     enable row level security;

create policy cart_self on public.cart_items for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy orders_self_read on public.orders for select
  using (auth.uid() = user_id or public.is_staff());
-- 주문 생성/수정은 RPC(SECURITY DEFINER)로만. 직접 insert/update 정책 없음.

create policy order_items_read on public.order_items for select
  using (exists (select 1 from orders o where o.id = order_id
                 and (o.user_id = auth.uid() or public.is_staff())));

create policy payments_self_read on public.payments for select
  using (auth.uid() = user_id or public.is_staff());
create policy refunds_staff_read on public.refunds for select using (public.is_staff());

-- 사용자 시작 RPC는 authenticated에만, 웹훅 확정 RPC는 service_role에만
revoke all on function public.place_order(jsonb) from public;
grant execute on function public.place_order(jsonb) to authenticated;

revoke all on function public.confirm_order_payment(text, uuid, text, bigint, jsonb) from public;
grant execute on function public.confirm_order_payment(text, uuid, text, bigint, jsonb) to service_role;

revoke all on function public.cancel_order(uuid, text) from public;
grant execute on function public.cancel_order(uuid, text) to authenticated, service_role;
