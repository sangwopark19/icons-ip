-- IP follow actions keep the public fan count cache in sync without trusting
-- client-provided user IDs.

create or replace function public.follow_ip(target_ip_id text)
returns integer
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  actor_id uuid := auth.uid();
  inserted_count integer := 0;
  current_fans_count integer := 0;
begin
  if actor_id is null then
    raise exception 'auth_required' using errcode = '28000';
  end if;

  if not exists (select 1 from public.ips where id = target_ip_id) then
    raise exception 'ip_not_found' using errcode = 'P0002';
  end if;

  insert into public.ip_follows (user_id, ip_id)
  values (actor_id, target_ip_id)
  on conflict (user_id, ip_id) do nothing;

  get diagnostics inserted_count = row_count;

  if inserted_count > 0 then
    update public.ips
    set fans_count = fans_count + 1,
        updated_at = now()
    where id = target_ip_id
    returning fans_count into current_fans_count;
  else
    select fans_count into current_fans_count
    from public.ips
    where id = target_ip_id;
  end if;

  return coalesce(current_fans_count, 0);
end;
$$;

create or replace function public.unfollow_ip(target_ip_id text)
returns integer
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  actor_id uuid := auth.uid();
  deleted_count integer := 0;
  current_fans_count integer := 0;
begin
  if actor_id is null then
    raise exception 'auth_required' using errcode = '28000';
  end if;

  if not exists (select 1 from public.ips where id = target_ip_id) then
    raise exception 'ip_not_found' using errcode = 'P0002';
  end if;

  delete from public.ip_follows
  where user_id = actor_id and ip_id = target_ip_id;

  get diagnostics deleted_count = row_count;

  if deleted_count > 0 then
    update public.ips
    set fans_count = greatest(fans_count - 1, 0),
        updated_at = now()
    where id = target_ip_id
    returning fans_count into current_fans_count;
  else
    select fans_count into current_fans_count
    from public.ips
    where id = target_ip_id;
  end if;

  return coalesce(current_fans_count, 0);
end;
$$;

drop policy if exists follows_read on public.ip_follows;
drop policy if exists follows_insert on public.ip_follows;
drop policy if exists follows_delete on public.ip_follows;

revoke select on public.ip_follows from anon;
revoke insert, update, delete on public.ip_follows from authenticated;

create policy follows_read on public.ip_follows for select
  using ((select auth.uid()) = user_id or (select public.is_staff()));

revoke all on function public.follow_ip(text) from public;
revoke all on function public.unfollow_ip(text) from public;
grant execute on function public.follow_ip(text) to authenticated;
grant execute on function public.unfollow_ip(text) to authenticated;
