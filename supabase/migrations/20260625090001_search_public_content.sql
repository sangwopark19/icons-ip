-- Public grouped search over catalog and visible community content.

drop function if exists public.search_public_content(text, integer);

create or replace function public.search_public_content(
  search_query text,
  per_group_limit integer default 6
)
returns table (
  kind text,
  id text,
  label text,
  subtitle text,
  ip_id text,
  ip_title text,
  image_path text,
  bg text,
  accent text,
  score real
)
language sql
stable
security definer
set search_path = public, extensions, pg_temp
as $$
  with params as (
    select
      nullif(btrim(search_query), '') as q,
      greatest(1, least(coalesce(per_group_limit, 6), 20)) as result_limit,
      auth.uid() as actor_id
  ),
  visible_posts as (
    select
      posts.id,
      posts.user_id,
      posts.ip_id,
      posts.text,
      posts.tag,
      posts.image_path,
      ips.title as ip_title,
      verticals.color as accent
    from public.posts
    left join public.ips on ips.id = posts.ip_id
    left join public.verticals on verticals.key = ips.vertical_key
    cross join params
    where params.q is not null
      and posts.status = 'visible'
      and not exists (
        select 1
        from public.blocks
        where blocks.user_id = params.actor_id
          and blocks.blocked_user_id = posts.user_id
      )
  ),
  all_matches as (
    select
      'ip'::text as kind,
      ips.id::text as id,
      ips.title as label,
      concat_ws(' · ', verticals.label, ips.sub) as subtitle,
      ips.id::text as ip_id,
      ips.title as ip_title,
      ips.image_path,
      ips.bg,
      verticals.color as accent,
      greatest(
        extensions.similarity(ips.title, params.q),
        case when ips.title ilike '%' || params.q || '%' then 1 else 0 end,
        case when coalesce(ips.sub, '') ilike '%' || params.q || '%' then 0.7 else 0 end,
        case when coalesce(ips.tagline, '') ilike '%' || params.q || '%' then 0.6 else 0 end,
        case when coalesce(ips.synopsis, '') ilike '%' || params.q || '%' then 0.4 else 0 end
      )::real as score,
      params.result_limit
    from params
    join public.ips on params.q is not null
    join public.verticals on verticals.key = ips.vertical_key
    where ips.title ilike '%' || params.q || '%'
      or coalesce(ips.sub, '') ilike '%' || params.q || '%'
      or coalesce(ips.tagline, '') ilike '%' || params.q || '%'
      or coalesce(ips.synopsis, '') ilike '%' || params.q || '%'
      or extensions.similarity(ips.title, params.q) > 0.15

    union all

    select
      'good'::text as kind,
      goods.id::text as id,
      goods.name as label,
      concat_ws(' · ', ips.title, goods.type) as subtitle,
      goods.ip_id::text,
      ips.title as ip_title,
      goods.image_path,
      goods.bg,
      verticals.color as accent,
      greatest(
        extensions.similarity(goods.name, params.q),
        case when goods.name ilike '%' || params.q || '%' then 1 else 0 end,
        case when goods.type ilike '%' || params.q || '%' then 0.7 else 0 end,
        case when coalesce(goods.badge, '') ilike '%' || params.q || '%' then 0.4 else 0 end,
        case when ips.title ilike '%' || params.q || '%' then 0.35 else 0 end
      )::real as score,
      params.result_limit
    from params
    join public.goods on params.q is not null
    join public.ips on ips.id = goods.ip_id
    join public.verticals on verticals.key = ips.vertical_key
    where goods.name ilike '%' || params.q || '%'
      or goods.type ilike '%' || params.q || '%'
      or coalesce(goods.badge, '') ilike '%' || params.q || '%'
      or ips.title ilike '%' || params.q || '%'
      or extensions.similarity(goods.name, params.q) > 0.15

    union all

    select
      'card'::text as kind,
      cards.id::text as id,
      cards.name as label,
      concat_ws(' · ', ips.title, cards.rarity::text, cards.no) as subtitle,
      cards.ip_id::text,
      ips.title as ip_title,
      cards.image_path,
      cards.bg,
      verticals.color as accent,
      greatest(
        extensions.similarity(cards.name, params.q),
        case when cards.name ilike '%' || params.q || '%' then 1 else 0 end,
        case when coalesce(cards.no, '') ilike '%' || params.q || '%' then 0.5 else 0 end,
        case when cards.rarity::text ilike '%' || params.q || '%' then 0.5 else 0 end,
        case when ips.title ilike '%' || params.q || '%' then 0.35 else 0 end
      )::real as score,
      params.result_limit
    from params
    join public.cards on params.q is not null
    join public.ips on ips.id = cards.ip_id
    join public.verticals on verticals.key = ips.vertical_key
    where cards.name ilike '%' || params.q || '%'
      or coalesce(cards.no, '') ilike '%' || params.q || '%'
      or cards.rarity::text ilike '%' || params.q || '%'
      or ips.title ilike '%' || params.q || '%'
      or extensions.similarity(cards.name, params.q) > 0.15

    union all

    select
      'post'::text as kind,
      visible_posts.id::text as id,
      visible_posts.text as label,
      concat_ws(' · ', visible_posts.ip_title, case when visible_posts.tag is null then null else '#' || visible_posts.tag end) as subtitle,
      visible_posts.ip_id::text,
      visible_posts.ip_title,
      null::text as image_path,
      null::text as bg,
      visible_posts.accent,
      greatest(
        extensions.similarity(visible_posts.text, params.q),
        case when visible_posts.text ilike '%' || params.q || '%' then 1 else 0 end,
        case when coalesce(visible_posts.tag, '') ilike '%' || params.q || '%' then 0.8 else 0 end,
        case when coalesce(visible_posts.ip_title, '') ilike '%' || params.q || '%' then 0.35 else 0 end
      )::real as score,
      params.result_limit
    from params
    join visible_posts on true
    where visible_posts.text ilike '%' || params.q || '%'
      or coalesce(visible_posts.tag, '') ilike '%' || params.q || '%'
      or coalesce(visible_posts.ip_title, '') ilike '%' || params.q || '%'
      or extensions.similarity(visible_posts.text, params.q) > 0.15

    union all

    select
      'tag'::text as kind,
      visible_posts.tag as id,
      '#' || visible_posts.tag as label,
      '커뮤니티 태그'::text as subtitle,
      null::text as ip_id,
      null::text as ip_title,
      null::text as image_path,
      null::text as bg,
      max(visible_posts.accent) as accent,
      max(greatest(
        extensions.similarity(visible_posts.tag, params.q),
        case when visible_posts.tag ilike '%' || params.q || '%' then 1 else 0 end
      ))::real as score,
      params.result_limit
    from params
    join visible_posts on visible_posts.tag is not null
    where visible_posts.tag ilike '%' || params.q || '%'
      or extensions.similarity(visible_posts.tag, params.q) > 0.15
    group by visible_posts.tag, params.result_limit
  ),
  ranked as (
    select
      all_matches.*,
      row_number() over (
        partition by all_matches.kind
        order by all_matches.score desc, all_matches.label asc, all_matches.id asc
      ) as group_rank
    from all_matches
  )
  select
    ranked.kind,
    ranked.id,
    ranked.label,
    ranked.subtitle,
    ranked.ip_id,
    ranked.ip_title,
    ranked.image_path,
    ranked.bg,
    ranked.accent,
    ranked.score
  from ranked
  where ranked.group_rank <= ranked.result_limit
  order by
    case ranked.kind
      when 'ip' then 1
      when 'good' then 2
      when 'card' then 3
      when 'post' then 4
      when 'tag' then 5
      else 6
    end,
    ranked.score desc,
    ranked.label asc,
    ranked.id asc;
$$;

revoke all on function public.search_public_content(text, integer) from public;
grant execute on function public.search_public_content(text, integer) to anon, authenticated;
