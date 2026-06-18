-- ============================================================================
-- ICONS · P0 — 기반 (DRAFT)
-- 인증/프로필 · 카탈로그(공개 읽기) · IP 팔로우 · 커뮤니티 · 검색 · 운영 골격
-- 근거: docs/ARCHITECTURE.md §5,§6  ·  docs/PRD.md §9(P0)
-- 적용: supabase db push (또는 supabase migration up)
-- ============================================================================

create schema if not exists extensions;
create extension if not exists pgcrypto with schema extensions;   -- gen_random_uuid()
create extension if not exists pg_trgm with schema extensions;    -- 검색(ILIKE/유사도)

-- ---------------------------------------------------------------------------
-- 공통 enum
-- ---------------------------------------------------------------------------
create type user_role     as enum ('user', 'staff', 'admin');
create type rarity         as enum ('N', 'R', 'SR', 'SSR', 'HOLO');  -- 순서=등급 오름차순(max() 활용)
create type post_status    as enum ('visible', 'hidden');
create type report_status  as enum ('open', 'reviewing', 'resolved', 'dismissed');
create type report_target  as enum ('post', 'comment', 'user');

-- ---------------------------------------------------------------------------
-- 공통 트리거 함수
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = public, pg_temp as $$
begin
  new.updated_at = now();
  return new;
end; $$;

-- auth.users 생성 시 최소 프로필 행 생성(나머지는 온보딩에서 채움)
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end; $$;

-- ---------------------------------------------------------------------------
-- 신원 · 사용자
-- ---------------------------------------------------------------------------
create table public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  email        text,
  nickname     text unique,
  birth_date   date,                          -- 자가신고(연령)
  avatar_path  text,                           -- storage 경로
  role         user_role not null default 'user',
  consents     jsonb not null default '{}',    -- 약관/마케팅 동의
  onboarded_at timestamptz,                    -- 온보딩 완료 시각(미완료=null)
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create trigger trg_profiles_updated before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- 역할 검사(RLS에서 재귀를 피하려 SECURITY DEFINER로 RLS 우회)
create or replace function public.is_staff()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role in ('staff', 'admin')
  );
$$;

-- 커뮤니티에서 작성자의 안전 컬럼만 공개로 노출(이메일/생년월일 비노출).
-- security_definer view는 RLS를 우회하므로 공개 안전 테이블로 동기화한다.
create table public.public_profiles (
  id          uuid primary key references public.profiles (id) on delete cascade,
  nickname    text,
  avatar_path text,
  updated_at  timestamptz not null default now()
);

create or replace function public.sync_public_profile()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.public_profiles (id, nickname, avatar_path, updated_at)
  values (new.id, new.nickname, new.avatar_path, now())
  on conflict (id) do update set
    nickname = excluded.nickname,
    avatar_path = excluded.avatar_path,
    updated_at = excluded.updated_at;
  return new;
end; $$;

create trigger trg_profiles_public_sync after insert or update of nickname, avatar_path on public.profiles
  for each row execute function public.sync_public_profile();

-- ---------------------------------------------------------------------------
-- 카탈로그 (공개 읽기 / staff 쓰기)
-- ---------------------------------------------------------------------------
create table public.verticals (
  key   text primary key,        -- blgl, rofan, global, vtuber, streamer
  label text not null,
  color text not null            -- 네온 액센트 hex
);

create table public.ips (
  id          text primary key,  -- 슬러그(hwasan, lumen ...)
  title       text not null,
  sub         text,
  vertical_key text not null references public.verticals (key),
  tagline     text,
  synopsis    text,
  glyph       text,              -- 플레이스홀더 글리프
  bg          text,              -- 그라디언트 폴백
  image_path  text,              -- 실제 아트워크(storage)
  featured    boolean not null default false,
  fans_count  integer not null default 0,   -- 캐시(앱/트리거 유지)
  goods_count integer not null default 0,
  cards_count integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create trigger trg_ips_updated before update on public.ips
  for each row execute function public.set_updated_at();

create table public.goods (
  id         text primary key,
  ip_id      text not null references public.ips (id),
  name       text not null,
  type       text not null,                          -- 아크릴 스탠드, 포토카드 ...
  price      integer not null check (price >= 0),    -- KRW
  badge      text,                                   -- 한정/신상/예약 ...
  stock      text not null default 'ok' check (stock in ('low','ok','soldout')), -- 표시용(P1에서 stock_qty 추가)
  bg         text,
  image_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_goods_updated before update on public.goods
  for each row execute function public.set_updated_at();
create index goods_ip_idx on public.goods (ip_id);

create table public.events (
  id         text primary key,
  ip_id      text references public.ips (id),       -- null=합동/플랫폼 이벤트
  title      text not null,
  mode       text not null check (mode in ('온라인','오프라인')),
  status     text not null check (status in ('예매중','예정','진행중','종료')),
  starts_at  timestamptz,
  ends_at    timestamptz,
  location   text,
  accent     text,
  bg         text,
  image_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_events_updated before update on public.events
  for each row execute function public.set_updated_at();
create index events_ip_idx on public.events (ip_id);

-- 카드(전시용). 가챠 풀 연결(pool_id)·소유(user_cards)는 P2에서 추가.
create table public.cards (
  id         text primary key,
  ip_id      text not null references public.ips (id),
  name       text not null,
  no         text,                 -- '001/120'
  rarity     rarity not null,
  bg         text,
  image_path text,
  created_at timestamptz not null default now()
);
create index cards_ip_idx on public.cards (ip_id);

-- ---------------------------------------------------------------------------
-- IP 팔로우
-- ---------------------------------------------------------------------------
create table public.ip_follows (
  user_id    uuid not null references public.profiles (id) on delete cascade,
  ip_id      text not null references public.ips (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, ip_id)
);

-- ---------------------------------------------------------------------------
-- 커뮤니티
-- ---------------------------------------------------------------------------
create table public.posts (
  id         uuid primary key default extensions.gen_random_uuid(),
  user_id    uuid not null references public.profiles (id) on delete cascade,
  ip_id      text references public.ips (id),
  text       text not null,
  image_path text,
  tag        text,
  status     post_status not null default 'visible',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_posts_updated before update on public.posts
  for each row execute function public.set_updated_at();
create index posts_created_idx on public.posts (created_at desc);
create index posts_ip_idx on public.posts (ip_id);

create table public.comments (
  id         uuid primary key default extensions.gen_random_uuid(),
  post_id    uuid not null references public.posts (id) on delete cascade,
  user_id    uuid not null references public.profiles (id) on delete cascade,
  text       text not null,
  created_at timestamptz not null default now()
);
create index comments_post_idx on public.comments (post_id);

create table public.likes (
  post_id    uuid not null references public.posts (id) on delete cascade,
  user_id    uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create table public.reports (
  id          uuid primary key default extensions.gen_random_uuid(),
  target_type report_target not null,
  target_id   text not null,
  reporter_id uuid not null references public.profiles (id) on delete cascade,
  reason      text,
  status      report_status not null default 'open',
  created_at  timestamptz not null default now()
);

create table public.blocks (
  user_id         uuid not null references public.profiles (id) on delete cascade,
  blocked_user_id uuid not null references public.profiles (id) on delete cascade,
  created_at      timestamptz not null default now(),
  primary key (user_id, blocked_user_id)
);

-- ---------------------------------------------------------------------------
-- 운영 감사 로그 (RPC/서비스 롤만 기록)
-- ---------------------------------------------------------------------------
create table public.audit_log (
  id         uuid primary key default extensions.gen_random_uuid(),
  actor_id   uuid references public.profiles (id),
  action     text not null,
  target     text,
  diff       jsonb,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 검색 인덱스 (pg_trgm)
-- ---------------------------------------------------------------------------
create index ips_title_trgm   on public.ips   using gin (title gin_trgm_ops);
create index goods_name_trgm  on public.goods using gin (name gin_trgm_ops);
create index cards_name_trgm  on public.cards using gin (name gin_trgm_ops);
create index posts_text_trgm  on public.posts using gin (text gin_trgm_ops);

-- ---------------------------------------------------------------------------
-- 참조 데이터: 5개 버티컬 (mock 아님)
-- ---------------------------------------------------------------------------
insert into public.verticals (key, label, color) values
  ('blgl',     'BL/GL',        '#FF4D9D'),
  ('rofan',    '로맨스판타지',  '#8B5CFF'),
  ('global',   '글로벌 IP',     '#2DE2FF'),
  ('vtuber',   '버튜버',        '#38F0C0'),
  ('streamer', '스트리머',      '#FFB23D')
on conflict (key) do nothing;

-- ---------------------------------------------------------------------------
-- 스토리지 버킷
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public) values
  ('public-media', 'public-media', true),    -- 굿즈/카드/IP/이벤트 아트워크
  ('user-uploads', 'user-uploads', false)    -- 커뮤니티/프로필 업로드
on conflict (id) do nothing;

-- ============================================================================
-- RLS
-- ============================================================================
alter table public.profiles   enable row level security;
alter table public.public_profiles enable row level security;
alter table public.ips        enable row level security;
alter table public.verticals  enable row level security;
alter table public.goods      enable row level security;
alter table public.events     enable row level security;
alter table public.cards      enable row level security;
alter table public.ip_follows enable row level security;
alter table public.posts      enable row level security;
alter table public.comments   enable row level security;
alter table public.likes      enable row level security;
alter table public.reports    enable row level security;
alter table public.blocks     enable row level security;
alter table public.audit_log  enable row level security;

-- profiles: 본인 읽기/수정 + staff 읽기. role은 self-service 업데이트에서 제외.
create policy profiles_read on public.profiles for select
  using ((select auth.uid()) = id or (select public.is_staff()));
create policy profiles_self_update on public.profiles for update using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

revoke update on public.profiles from public, anon, authenticated;
grant update (nickname, birth_date, avatar_path, consents, onboarded_at) on public.profiles to authenticated;

create policy public_profiles_read on public.public_profiles for select using (true);

-- 카탈로그: 공개 읽기 / staff 전체 쓰기
create policy verticals_read  on public.verticals for select using (true);
create policy verticals_insert on public.verticals for insert with check ((select public.is_staff()));
create policy verticals_update on public.verticals for update using ((select public.is_staff())) with check ((select public.is_staff()));
create policy verticals_delete on public.verticals for delete using ((select public.is_staff()));
create policy ips_read   on public.ips   for select using (true);
create policy ips_insert on public.ips   for insert with check ((select public.is_staff()));
create policy ips_update on public.ips   for update using ((select public.is_staff())) with check ((select public.is_staff()));
create policy ips_delete on public.ips   for delete using ((select public.is_staff()));
create policy goods_read on public.goods for select using (true);
create policy goods_insert on public.goods for insert with check ((select public.is_staff()));
create policy goods_update on public.goods for update using ((select public.is_staff())) with check ((select public.is_staff()));
create policy goods_delete on public.goods for delete using ((select public.is_staff()));
create policy events_read on public.events for select using (true);
create policy events_insert on public.events for insert with check ((select public.is_staff()));
create policy events_update on public.events for update using ((select public.is_staff())) with check ((select public.is_staff()));
create policy events_delete on public.events for delete using ((select public.is_staff()));
create policy cards_read  on public.cards for select using (true);
create policy cards_insert on public.cards for insert with check ((select public.is_staff()));
create policy cards_update on public.cards for update using ((select public.is_staff())) with check ((select public.is_staff()));
create policy cards_delete on public.cards for delete using ((select public.is_staff()));

-- IP 팔로우: 공개 읽기(팔로워 수), 본인만 쓰기
create policy follows_read on public.ip_follows for select using (true);
create policy follows_insert on public.ip_follows for insert
  with check ((select auth.uid()) = user_id);
create policy follows_delete on public.ip_follows for delete
  using ((select auth.uid()) = user_id);

-- 커뮤니티
create policy posts_read on public.posts for select
  using (status = 'visible' or (select auth.uid()) = user_id or (select public.is_staff()));
create policy posts_insert on public.posts for insert with check ((select auth.uid()) = user_id);
create policy posts_update on public.posts for update
  using ((select auth.uid()) = user_id or (select public.is_staff()))
  with check ((select auth.uid()) = user_id or (select public.is_staff()));
create policy posts_delete on public.posts for delete
  using ((select auth.uid()) = user_id or (select public.is_staff()));

create policy comments_read   on public.comments for select using (true);
create policy comments_insert on public.comments for insert with check ((select auth.uid()) = user_id);
create policy comments_delete on public.comments for delete
  using ((select auth.uid()) = user_id or (select public.is_staff()));

create policy likes_read  on public.likes for select using (true);
create policy likes_insert on public.likes for insert
  with check ((select auth.uid()) = user_id);
create policy likes_delete on public.likes for delete
  using ((select auth.uid()) = user_id);

create policy reports_insert on public.reports for insert with check ((select auth.uid()) = reporter_id);
create policy reports_read   on public.reports for select
  using ((select auth.uid()) = reporter_id or (select public.is_staff()));
create policy reports_update on public.reports for update
  using ((select public.is_staff())) with check ((select public.is_staff()));

create policy blocks_self on public.blocks for all
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- audit_log: staff 읽기만(쓰기는 RPC/서비스 롤 = RLS 우회)
create policy audit_staff_read on public.audit_log for select using ((select public.is_staff()));

-- Data API grants: Supabase 신규 프로젝트는 SQL로 만든 public 테이블을 자동 노출하지 않는다.
grant usage on schema public to anon, authenticated;

grant select on public.public_profiles to anon, authenticated;
grant select on public.verticals, public.ips, public.goods, public.events, public.cards,
  public.ip_follows, public.posts, public.comments, public.likes to anon, authenticated;

grant select on public.profiles, public.reports, public.blocks, public.audit_log to authenticated;
grant insert, update, delete on public.verticals, public.ips, public.goods, public.events, public.cards to authenticated;
grant insert, update, delete on public.ip_follows, public.posts, public.comments, public.likes,
  public.reports, public.blocks to authenticated;

revoke all on function public.set_updated_at() from public;
revoke all on function public.handle_new_user() from public;
revoke all on function public.sync_public_profile() from public;

-- 스토리지 RLS: user-uploads는 본인 폴더(<uid>/...)만
create policy user_uploads_read   on storage.objects for select
  using (bucket_id = 'user-uploads' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy user_uploads_write  on storage.objects for insert
  with check (bucket_id = 'user-uploads' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy user_uploads_delete on storage.objects for delete
  using (bucket_id = 'user-uploads' and (storage.foldername(name))[1] = (select auth.uid())::text);
-- public-media는 공개 버킷이라 읽기 공개, 쓰기는 staff(대시보드/서비스 롤)로 운영
