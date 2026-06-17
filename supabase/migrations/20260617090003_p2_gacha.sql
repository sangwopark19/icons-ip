-- ============================================================================
-- ICONS · P2 — 가챠 & 수집형 카드 (DRAFT)
-- 지갑(충전금) · 카드풀 · 확률 공시 · 천장 · 뽑기 · 바인더
-- 근거: docs/ARCHITECTURE.md §5.3,§7,§15  ·  docs/PRD.md §5.4  ·  docs/adr/0001-paid-digital-gacha.md
-- ============================================================================

create type wallet_reason as enum ('charge', 'pull', 'refund');

-- ---------------------------------------------------------------------------
-- 지갑(충전금) · 장부
-- ---------------------------------------------------------------------------
create table public.wallets (
  user_id    uuid primary key references public.profiles (id) on delete cascade,
  balance    bigint not null default 0 check (balance >= 0),  -- 충전금 잔액
  updated_at timestamptz not null default now()
);
create trigger trg_wallets_updated before update on public.wallets
  for each row execute function public.set_updated_at();

create table public.wallet_ledger (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles (id) on delete cascade,
  delta      bigint not null,                 -- +충전 / -뽑기 / +환불
  reason     wallet_reason not null,
  ref_id     uuid,                            -- payment_id / pool_id ...
  created_at timestamptz not null default now()
);
create index wallet_ledger_user_idx on public.wallet_ledger (user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- 카드풀 · 확률 공시 · 천장
-- ---------------------------------------------------------------------------
create table public.card_pools (
  id              uuid primary key default gen_random_uuid(),
  ip_id           text not null references public.ips (id),
  name            text not null,
  cost_per_pull   bigint not null check (cost_per_pull > 0),  -- 충전금
  pity_threshold  integer not null default 90 check (pity_threshold > 0),  -- 천장(보장) 횟수
  active_from     timestamptz not null default now(),
  active_to       timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create trigger trg_pools_updated before update on public.card_pools
  for each row execute function public.set_updated_at();

-- 등급별 확률(공시 원천). 합=1.0 이어야 함.
create table public.pool_odds (
  pool_id     uuid not null references public.card_pools (id) on delete cascade,
  rarity      rarity not null,
  probability numeric(6,5) not null check (probability >= 0 and probability <= 1),
  primary key (pool_id, rarity)
);

create or replace function public.assert_pool_odds_total()
returns trigger language plpgsql set search_path = public, pg_temp as $$
declare
  v_pool_ids uuid[];
  v_pool     uuid;
  v_total    numeric;
begin
  if tg_op = 'INSERT' then
    v_pool_ids := array[new.pool_id];
  elsif tg_op = 'DELETE' then
    v_pool_ids := array[old.pool_id];
  else
    v_pool_ids := array[old.pool_id, new.pool_id];
  end if;

  for v_pool in select distinct pool_id from unnest(v_pool_ids) as changed(pool_id) loop
    if v_pool is null then continue; end if;
    if not exists (select 1 from public.card_pools where id = v_pool) then continue; end if;

    select coalesce(sum(probability), 0) into v_total
      from public.pool_odds where pool_id = v_pool;
    if v_total <> 1 then raise exception 'pool odds must sum to 1'; end if;
  end loop;

  return null;
end; $$;

create constraint trigger pool_odds_total_chk
  after insert or update or delete on public.pool_odds
  deferrable initially deferred
  for each row execute function public.assert_pool_odds_total();

-- P0 cards에 풀 연결
alter table public.cards add column pool_id uuid references public.card_pools (id);
create index cards_pool_idx on public.cards (pool_id);

-- 사용자×풀 천장 카운터
create table public.gacha_pity (
  user_id uuid not null references public.profiles (id) on delete cascade,
  pool_id uuid not null references public.card_pools (id) on delete cascade,
  pity    integer not null default 0,
  primary key (user_id, pool_id)
);

-- ---------------------------------------------------------------------------
-- 뽑기 이력 · 바인더(보유)
-- ---------------------------------------------------------------------------
create table public.pulls (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles (id) on delete cascade,
  pool_id     uuid not null references public.card_pools (id),
  cost        bigint not null,
  count       integer not null,
  created_at  timestamptz not null default now()
);
create index pulls_user_idx on public.pulls (user_id, created_at desc);

create table public.pull_results (
  id      uuid primary key default gen_random_uuid(),
  pull_id uuid not null references public.pulls (id) on delete cascade,
  card_id text not null references public.cards (id),
  rarity  rarity not null
);

create table public.user_cards (
  user_id     uuid not null references public.profiles (id) on delete cascade,
  card_id     text not null references public.cards (id) on delete cascade,
  qty         integer not null default 1 check (qty > 0),
  acquired_at timestamptz not null default now(),
  primary key (user_id, card_id)
);

-- ============================================================================
-- RPC
-- ============================================================================

-- 등급 추첨: pool_odds 가중 RNG
create or replace function public.roll_rarity(p_pool_id uuid)
returns rarity
language plpgsql volatile security definer set search_path = public, pg_temp as $$
declare v_r numeric := random(); v_acc numeric := 0; v_total numeric; rec record;
begin
  select coalesce(sum(probability), 0) into v_total
    from pool_odds where pool_id = p_pool_id;
  if v_total <> 1 then raise exception 'pool odds must sum to 1'; end if;

  for rec in select rarity, probability from pool_odds where pool_id = p_pool_id order by rarity loop
    v_acc := v_acc + rec.probability;
    if v_r < v_acc then return rec.rarity; end if;
  end loop;
  raise exception 'failed to roll rarity';
end; $$;

-- 충전 시작: pending 결제 행 생성(클라이언트가 토스로 결제). 멱등 키 사용.
create or replace function public.charge_wallet_init(p_amount bigint, p_idempotency_key text)
returns uuid
language plpgsql security definer set search_path = public, pg_temp as $$
declare v_user uuid := auth.uid(); v_pay uuid;
begin
  if v_user is null then raise exception 'auth required'; end if;
  if p_amount <= 0 then raise exception 'invalid amount'; end if;
  insert into payments (user_id, purpose, ref_id, amount, status, idempotency_key)
  values (v_user, 'wallet', null, p_amount, 'pending', p_idempotency_key)
  returning id into v_pay;
  return v_pay;
end; $$;

-- 충전 확정(웹훅): 멱등. 지갑 적립 + 장부.
create or replace function public.confirm_wallet_charge(
  p_idempotency_key text, p_payment_key text, p_amount bigint, p_raw jsonb
)
returns void
language plpgsql security definer set search_path = public, pg_temp as $$
declare v_user uuid; v_status payment_status; v_pay uuid;
begin
  select id, user_id, status into v_pay, v_user, v_status
    from payments where idempotency_key = p_idempotency_key for update;
  if v_pay is null then raise exception 'payment not found'; end if;
  if v_status = 'paid' then return; end if;            -- 멱등
  if p_amount <> (select amount from payments where id = v_pay) then raise exception 'amount mismatch'; end if;

  update payments set status = 'paid', payment_key = p_payment_key, raw = p_raw where id = v_pay;

  insert into wallets (user_id, balance) values (v_user, p_amount)
    on conflict (user_id) do update set balance = wallets.balance + excluded.balance;
  insert into wallet_ledger (user_id, delta, reason, ref_id) values (v_user, p_amount, 'charge', v_pay);
end; $$;

-- 가챠 뽑기: 지갑 차감 + RNG + 천장 + 적립 (1 트랜잭션). 확률/천장은 서버에서만 결정.
create or replace function public.pull_gacha(p_pool_id uuid, p_count integer)
returns table (card_id text, rarity rarity, is_new boolean)
language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_user   uuid := auth.uid();
  v_cost   bigint;
  v_thr    integer;
  v_total  bigint;
  v_bal    bigint;
  v_pity   integer;
  v_pull   uuid;
  v_rarity rarity;
  v_card   text;
  v_new    boolean;
begin
  if v_user is null then raise exception 'auth required'; end if;
  if p_count not in (1, 10) then raise exception 'invalid count'; end if;

  select cost_per_pull, pity_threshold into v_cost, v_thr
    from card_pools
    where id = p_pool_id and now() >= active_from and (active_to is null or now() < active_to);
  if v_cost is null then raise exception 'pool not active'; end if;
  v_total := v_cost * p_count;

  -- 지갑 잠금/차감
  insert into wallets (user_id, balance) values (v_user, 0) on conflict (user_id) do nothing;
  select balance into v_bal from wallets where user_id = v_user for update;
  if v_bal < v_total then raise exception 'insufficient balance'; end if;
  update wallets set balance = balance - v_total where user_id = v_user;
  insert into wallet_ledger (user_id, delta, reason, ref_id) values (v_user, -v_total, 'pull', p_pool_id);

  -- 천장 카운터 잠금
  insert into gacha_pity (user_id, pool_id, pity) values (v_user, p_pool_id, 0) on conflict do nothing;
  select pity into v_pity from gacha_pity where user_id = v_user and pool_id = p_pool_id for update;

  insert into pulls (user_id, pool_id, cost, count) values (v_user, p_pool_id, v_total, p_count)
    returning id into v_pull;

  for i in 1..p_count loop
    v_pity := v_pity + 1;
    if v_pity >= v_thr then
      v_rarity := 'HOLO';        -- 천장: 최고 등급 보장
      v_pity := 0;
    else
      v_rarity := roll_rarity(p_pool_id);
      if v_rarity in ('SSR', 'HOLO') then v_pity := 0; end if;
    end if;

    select c.id into v_card from cards c
      where c.pool_id = p_pool_id and c.rarity = v_rarity
      order by random() limit 1;
    if v_card is null then raise exception 'pool has no card of rarity %', v_rarity; end if;

    v_new := not exists (
      select 1 from user_cards uc where uc.user_id = v_user and uc.card_id = v_card
    );
    insert into user_cards as uc (user_id, card_id, qty) values (v_user, v_card, 1)
      on conflict on constraint user_cards_pkey do update set qty = uc.qty + 1;
    insert into pull_results (pull_id, card_id, rarity) values (v_pull, v_card, v_rarity);

    card_id := v_card; rarity := v_rarity; is_new := v_new;
    return next;
  end loop;

  update gacha_pity set pity = v_pity where user_id = v_user and pool_id = p_pool_id;
end; $$;

-- ============================================================================
-- RLS · 권한
-- ============================================================================
alter table public.wallets       enable row level security;
alter table public.wallet_ledger enable row level security;
alter table public.card_pools    enable row level security;
alter table public.pool_odds     enable row level security;
alter table public.gacha_pity    enable row level security;
alter table public.pulls         enable row level security;
alter table public.pull_results  enable row level security;
alter table public.user_cards    enable row level security;

create policy wallet_self_read on public.wallets for select using (auth.uid() = user_id);
create policy ledger_self_read on public.wallet_ledger for select using (auth.uid() = user_id);

-- 카드풀/확률은 공개 읽기(확률 공시 의무), staff 쓰기
create policy pools_read  on public.card_pools for select using (true);
create policy pools_write on public.card_pools for all using (public.is_staff()) with check (public.is_staff());
create policy odds_read   on public.pool_odds for select using (true);
create policy odds_write  on public.pool_odds for all using (public.is_staff()) with check (public.is_staff());

create policy pity_self    on public.gacha_pity for select using (auth.uid() = user_id);
create policy pulls_self    on public.pulls for select using (auth.uid() = user_id);
create policy pull_res_self on public.pull_results for select
  using (exists (select 1 from pulls p where p.id = pull_id and p.user_id = auth.uid()));
create policy user_cards_self on public.user_cards for select using (auth.uid() = user_id);
-- 지갑/뽑기 쓰기는 전부 RPC로만(직접 쓰기 정책 없음)

revoke all on function public.pull_gacha(uuid, integer) from public;
grant execute on function public.pull_gacha(uuid, integer) to authenticated;
revoke all on function public.charge_wallet_init(bigint, text) from public;
grant execute on function public.charge_wallet_init(bigint, text) to authenticated;
revoke all on function public.confirm_wallet_charge(text, text, bigint, jsonb) from public;
grant execute on function public.confirm_wallet_charge(text, text, bigint, jsonb) to service_role;
revoke all on function public.roll_rarity(uuid) from public;  -- 내부 전용
revoke all on function public.assert_pool_odds_total() from public;
