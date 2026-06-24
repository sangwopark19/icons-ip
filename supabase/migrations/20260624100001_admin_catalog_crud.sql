-- Admin catalog writes go through audited RPCs instead of direct table writes.

drop function if exists public.admin_upsert_ip(text, text, text, text, text, text, text, text, text, boolean, integer);
drop function if exists public.admin_upsert_good(text, text, text, text, integer, text, text, integer, text, text);

create or replace function public.admin_upsert_ip(
  target_id text,
  target_title text,
  target_sub text,
  target_vertical_key text,
  target_tagline text,
  target_synopsis text,
  target_glyph text,
  target_bg text,
  target_image_path text,
  target_featured boolean
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  actor_id uuid := auth.uid();
begin
  if actor_id is null then
    raise exception 'auth_required' using errcode = '28000';
  end if;

  if not public.is_staff() then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  insert into public.ips (
    id,
    title,
    sub,
    vertical_key,
    tagline,
    synopsis,
    glyph,
    bg,
    image_path,
    featured
  )
  values (
    target_id,
    target_title,
    target_sub,
    target_vertical_key,
    target_tagline,
    target_synopsis,
    target_glyph,
    target_bg,
    target_image_path,
    target_featured
  )
  on conflict (id) do update set
    title = excluded.title,
    sub = excluded.sub,
    vertical_key = excluded.vertical_key,
    tagline = excluded.tagline,
    synopsis = excluded.synopsis,
    glyph = excluded.glyph,
    bg = excluded.bg,
    image_path = excluded.image_path,
    featured = excluded.featured,
    updated_at = now();

  insert into public.audit_log (actor_id, action, target, diff)
  values (
    actor_id,
    'catalog.ip.upsert',
    'ips:' || target_id,
    jsonb_build_object(
      'id', target_id,
      'title', target_title,
      'vertical_key', target_vertical_key
    )
  );
end;
$$;

create or replace function public.admin_upsert_good(
  target_id text,
  target_ip_id text,
  target_name text,
  target_type text,
  target_price integer,
  target_badge text,
  target_stock text,
  target_bg text,
  target_image_path text
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  actor_id uuid := auth.uid();
  previous_ip_id text;
begin
  if actor_id is null then
    raise exception 'auth_required' using errcode = '28000';
  end if;

  if not public.is_staff() then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  select ip_id into previous_ip_id from public.goods where id = target_id;

  insert into public.goods (
    id,
    ip_id,
    name,
    type,
    price,
    badge,
    stock,
    bg,
    image_path
  )
  values (
    target_id,
    target_ip_id,
    target_name,
    target_type,
    target_price,
    target_badge,
    target_stock,
    target_bg,
    target_image_path
  )
  on conflict (id) do update set
    ip_id = excluded.ip_id,
    name = excluded.name,
    type = excluded.type,
    price = excluded.price,
    badge = excluded.badge,
    stock = excluded.stock,
    bg = excluded.bg,
    image_path = excluded.image_path,
    updated_at = now();

  update public.ips
  set goods_count = (
      select count(*)::integer from public.goods where goods.ip_id = ips.id
    ),
    updated_at = now()
  where id in (target_ip_id, previous_ip_id);

  insert into public.audit_log (actor_id, action, target, diff)
  values (
    actor_id,
    'catalog.good.upsert',
    'goods:' || target_id,
    jsonb_build_object(
      'id', target_id,
      'ip_id', target_ip_id,
      'name', target_name,
      'price', target_price
    )
  );
end;
$$;

create or replace function public.admin_upsert_card(
  target_id text,
  target_ip_id text,
  target_name text,
  target_no text,
  target_rarity rarity,
  target_bg text,
  target_image_path text
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  actor_id uuid := auth.uid();
  previous_ip_id text;
begin
  if actor_id is null then
    raise exception 'auth_required' using errcode = '28000';
  end if;

  if not public.is_staff() then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  select ip_id into previous_ip_id from public.cards where id = target_id;

  insert into public.cards (
    id,
    ip_id,
    name,
    no,
    rarity,
    bg,
    image_path
  )
  values (
    target_id,
    target_ip_id,
    target_name,
    target_no,
    target_rarity,
    target_bg,
    target_image_path
  )
  on conflict (id) do update set
    ip_id = excluded.ip_id,
    name = excluded.name,
    no = excluded.no,
    rarity = excluded.rarity,
    bg = excluded.bg,
    image_path = excluded.image_path;

  update public.ips
  set cards_count = (
      select count(*)::integer from public.cards where cards.ip_id = ips.id
    ),
    updated_at = now()
  where id in (target_ip_id, previous_ip_id);

  insert into public.audit_log (actor_id, action, target, diff)
  values (
    actor_id,
    'catalog.card.upsert',
    'cards:' || target_id,
    jsonb_build_object(
      'id', target_id,
      'ip_id', target_ip_id,
      'name', target_name,
      'rarity', target_rarity
    )
  );
end;
$$;

create or replace function public.admin_upsert_event(
  target_id text,
  target_ip_id text,
  target_title text,
  target_mode text,
  target_status text,
  target_starts_at timestamptz,
  target_ends_at timestamptz,
  target_location text,
  target_accent text,
  target_bg text,
  target_image_path text
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  actor_id uuid := auth.uid();
begin
  if actor_id is null then
    raise exception 'auth_required' using errcode = '28000';
  end if;

  if not public.is_staff() then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  insert into public.events (
    id,
    ip_id,
    title,
    mode,
    status,
    starts_at,
    ends_at,
    location,
    accent,
    bg,
    image_path
  )
  values (
    target_id,
    target_ip_id,
    target_title,
    target_mode,
    target_status,
    target_starts_at,
    target_ends_at,
    target_location,
    target_accent,
    target_bg,
    target_image_path
  )
  on conflict (id) do update set
    ip_id = excluded.ip_id,
    title = excluded.title,
    mode = excluded.mode,
    status = excluded.status,
    starts_at = excluded.starts_at,
    ends_at = excluded.ends_at,
    location = excluded.location,
    accent = excluded.accent,
    bg = excluded.bg,
    image_path = excluded.image_path,
    updated_at = now();

  insert into public.audit_log (actor_id, action, target, diff)
  values (
    actor_id,
    'catalog.event.upsert',
    'events:' || target_id,
    jsonb_build_object(
      'id', target_id,
      'ip_id', target_ip_id,
      'title', target_title,
      'status', target_status
    )
  );
end;
$$;

revoke all on function public.admin_upsert_ip(text, text, text, text, text, text, text, text, text, boolean) from public;
revoke all on function public.admin_upsert_good(text, text, text, text, integer, text, text, text, text) from public;
revoke all on function public.admin_upsert_card(text, text, text, text, rarity, text, text) from public;
revoke all on function public.admin_upsert_event(text, text, text, text, text, timestamptz, timestamptz, text, text, text, text) from public;

grant execute on function public.admin_upsert_ip(text, text, text, text, text, text, text, text, text, boolean) to authenticated;
grant execute on function public.admin_upsert_good(text, text, text, text, integer, text, text, text, text) to authenticated;
grant execute on function public.admin_upsert_card(text, text, text, text, rarity, text, text) to authenticated;
grant execute on function public.admin_upsert_event(text, text, text, text, text, timestamptz, timestamptz, text, text, text, text) to authenticated;

revoke insert, update, delete on public.ips, public.goods, public.events, public.cards from authenticated;
