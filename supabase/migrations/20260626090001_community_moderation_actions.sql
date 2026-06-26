-- Community report, block, and staff moderation actions.

drop function if exists public.submit_community_report(report_target, text, text);
drop function if exists public.block_community_user(uuid);
drop function if exists public.admin_update_report_status(uuid, report_status);
drop function if exists public.admin_hide_community_post(uuid, uuid);

create or replace function public.submit_community_report(
  target_type report_target,
  target_id text,
  reason text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  actor_id uuid := auth.uid();
  target_uuid uuid;
  normalized_reason text := nullif(btrim(reason), '');
  target_ip_id text := null;
  inserted_report_id uuid;
begin
  if actor_id is null then
    raise exception 'auth_required' using errcode = '28000';
  end if;

  if target_id !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then
    raise exception 'target_not_found' using errcode = '22023';
  end if;

  target_uuid := target_id::uuid;

  if target_type = 'post' then
    select posts.ip_id
      into target_ip_id
      from public.posts
      where posts.id = target_uuid
        and posts.status = 'visible';

    if not found then
      raise exception 'target_not_found' using errcode = '42501';
    end if;
  elsif target_type = 'comment' then
    select posts.ip_id
      into target_ip_id
      from public.comments
      join public.posts on posts.id = comments.post_id
      where comments.id = target_uuid
        and posts.status = 'visible';

    if not found then
      raise exception 'target_not_found' using errcode = '42501';
    end if;
  elsif target_type = 'user' then
    perform 1
    from public.profiles
    where profiles.id = target_uuid;

    if not found then
      raise exception 'target_not_found' using errcode = '42501';
    end if;
  else
    raise exception 'target_not_found' using errcode = '22023';
  end if;

  insert into public.reports (target_type, target_id, reporter_id, reason)
  values (target_type, target_uuid::text, actor_id, normalized_reason)
  returning id into inserted_report_id;

  return jsonb_build_object('reportId', inserted_report_id, 'ipId', target_ip_id);
end;
$$;

create or replace function public.block_community_user(target_user_id uuid)
returns jsonb
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

  if target_user_id = actor_id then
    raise exception 'cannot_block_self' using errcode = '22023';
  end if;

  perform 1
  from public.profiles
  where profiles.id = target_user_id;

  if not found then
    raise exception 'target_not_found' using errcode = '42501';
  end if;

  insert into public.blocks (user_id, blocked_user_id)
  values (actor_id, target_user_id)
  on conflict (user_id, blocked_user_id) do nothing;

  return jsonb_build_object('blockedUserId', target_user_id);
end;
$$;

create or replace function public.admin_update_report_status(
  target_report_id uuid,
  target_status report_status
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  actor_id uuid := auth.uid();
  previous_status report_status;
begin
  if actor_id is null or not public.is_staff() then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  select reports.status
    into previous_status
    from public.reports
    where reports.id = target_report_id
    for update;

  if not found then
    raise exception 'report_not_found' using errcode = '22023';
  end if;

  update public.reports
  set status = target_status
  where reports.id = target_report_id;

  insert into public.audit_log (actor_id, action, target, diff)
  values (
    actor_id,
    'community_report_status_update',
    'report:' || target_report_id::text,
    jsonb_build_object('from', previous_status, 'to', target_status)
  );
end;
$$;

create or replace function public.admin_hide_community_post(
  target_post_id uuid,
  target_report_id uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  actor_id uuid := auth.uid();
  previous_status post_status;
  target_ip_id text;
begin
  if actor_id is null or not public.is_staff() then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  select posts.status, posts.ip_id
    into previous_status, target_ip_id
    from public.posts
    where posts.id = target_post_id
    for update;

  if not found then
    raise exception 'post_not_found' using errcode = '22023';
  end if;

  update public.posts
  set status = 'hidden'
  where posts.id = target_post_id;

  if target_report_id is not null then
    update public.reports
    set status = 'resolved'
    where reports.id = target_report_id;
  end if;

  insert into public.audit_log (actor_id, action, target, diff)
  values (
    actor_id,
    'community_post_hide',
    'post:' || target_post_id::text,
    jsonb_build_object('from', previous_status, 'to', 'hidden', 'reportId', target_report_id)
  );

  return jsonb_build_object('ipId', target_ip_id);
end;
$$;

revoke all on function public.submit_community_report(report_target, text, text) from public;
revoke all on function public.block_community_user(uuid) from public;
revoke all on function public.admin_update_report_status(uuid, report_status) from public;
revoke all on function public.admin_hide_community_post(uuid, uuid) from public;

grant execute on function public.submit_community_report(report_target, text, text) to authenticated;
grant execute on function public.block_community_user(uuid) to authenticated;
grant execute on function public.admin_update_report_status(uuid, report_status) to authenticated;
grant execute on function public.admin_hide_community_post(uuid, uuid) to authenticated;

drop policy if exists reports_insert on public.reports;
drop policy if exists reports_update on public.reports;
drop policy if exists blocks_self on public.blocks;

create policy blocks_read_self_or_staff on public.blocks for select
  using ((select auth.uid()) = user_id or (select public.is_staff()));
