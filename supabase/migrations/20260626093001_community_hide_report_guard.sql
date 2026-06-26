-- Ensure staff hide actions only resolve reports linked to the hidden post.

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
  linked_report_target report_target;
  linked_report_target_id text;
  linked_report_post_id uuid;
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
    select reports.target_type, reports.target_id
      into linked_report_target, linked_report_target_id
      from public.reports
      where reports.id = target_report_id
      for update;

    if not found then
      raise exception 'report_not_found' using errcode = '22023';
    end if;

    if linked_report_target = 'post' then
      if linked_report_target_id !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then
        raise exception 'report_target_mismatch' using errcode = '22023';
      end if;

      linked_report_post_id := linked_report_target_id::uuid;
    elsif linked_report_target = 'comment' then
      if linked_report_target_id !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then
        raise exception 'report_target_mismatch' using errcode = '22023';
      end if;

      select comments.post_id
        into linked_report_post_id
        from public.comments
        where comments.id = linked_report_target_id::uuid;

      if not found then
        raise exception 'report_target_mismatch' using errcode = '22023';
      end if;
    else
      raise exception 'report_target_mismatch' using errcode = '22023';
    end if;

    if linked_report_post_id <> target_post_id then
      raise exception 'report_target_mismatch' using errcode = '22023';
    end if;

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
