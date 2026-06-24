-- Community comment, like, and author-delete mutations.

drop function if exists public.create_post_comment(uuid, text);
drop function if exists public.set_post_like(uuid, boolean);
drop function if exists public.delete_own_post(uuid);
drop function if exists public.delete_own_comment(uuid);

create or replace function public.create_post_comment(
  target_post_id uuid,
  comment_text text
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  actor_id uuid := auth.uid();
  normalized_text text := nullif(btrim(comment_text), '');
  inserted_comment_id uuid;
  post_ip_id text;
begin
  if actor_id is null then
    raise exception 'auth_required' using errcode = '28000';
  end if;

  if normalized_text is null then
    raise exception 'comment_text_required' using errcode = '22023';
  end if;

  select posts.ip_id
    into post_ip_id
    from public.posts
    where posts.id = target_post_id
      and posts.status = 'visible';

  if not found then
    raise exception 'post_not_visible' using errcode = '42501';
  end if;

  insert into public.comments (post_id, user_id, text)
  values (target_post_id, actor_id, normalized_text)
  returning id into inserted_comment_id;

  return jsonb_build_object('commentId', inserted_comment_id, 'ipId', post_ip_id);
end;
$$;

create or replace function public.set_post_like(
  target_post_id uuid,
  should_like boolean
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  actor_id uuid := auth.uid();
  post_ip_id text;
  current_liked boolean;
begin
  if actor_id is null then
    raise exception 'auth_required' using errcode = '28000';
  end if;

  select posts.ip_id
    into post_ip_id
    from public.posts
    where posts.id = target_post_id
      and posts.status = 'visible';

  if not found then
    raise exception 'post_not_visible' using errcode = '42501';
  end if;

  if coalesce(should_like, false) then
    insert into public.likes (post_id, user_id)
    values (target_post_id, actor_id)
    on conflict (post_id, user_id) do nothing;
  else
    delete from public.likes
    where post_id = target_post_id
      and user_id = actor_id;
  end if;

  select exists (
    select 1
    from public.likes
    where likes.post_id = target_post_id
      and likes.user_id = actor_id
  ) into current_liked;

  return jsonb_build_object('liked', current_liked, 'ipId', post_ip_id);
end;
$$;

create or replace function public.delete_own_post(target_post_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  actor_id uuid := auth.uid();
  post_ip_id text;
begin
  if actor_id is null then
    raise exception 'auth_required' using errcode = '28000';
  end if;

  select posts.ip_id
    into post_ip_id
    from public.posts
    where posts.id = target_post_id
      and posts.user_id = actor_id;

  if not found then
    raise exception 'post_not_owned' using errcode = '42501';
  end if;

  delete from public.posts
  where posts.id = target_post_id
    and posts.user_id = actor_id;

  return jsonb_build_object('ipId', post_ip_id);
end;
$$;

create or replace function public.delete_own_comment(target_comment_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  actor_id uuid := auth.uid();
  post_ip_id text;
begin
  if actor_id is null then
    raise exception 'auth_required' using errcode = '28000';
  end if;

  select posts.ip_id
    into post_ip_id
    from public.comments
    join public.posts on posts.id = comments.post_id
    where comments.id = target_comment_id
      and comments.user_id = actor_id;

  if not found then
    raise exception 'comment_not_owned' using errcode = '42501';
  end if;

  delete from public.comments
  where comments.id = target_comment_id
    and comments.user_id = actor_id;

  return jsonb_build_object('ipId', post_ip_id);
end;
$$;

revoke all on function public.create_post_comment(uuid, text) from public;
revoke all on function public.set_post_like(uuid, boolean) from public;
revoke all on function public.delete_own_post(uuid) from public;
revoke all on function public.delete_own_comment(uuid) from public;

grant execute on function public.create_post_comment(uuid, text) to authenticated;
grant execute on function public.set_post_like(uuid, boolean) to authenticated;
grant execute on function public.delete_own_post(uuid) to authenticated;
grant execute on function public.delete_own_comment(uuid) to authenticated;

drop policy if exists comments_read on public.comments;
create policy comments_read on public.comments for select
  using (
    exists (
      select 1
      from public.posts
      where posts.id = comments.post_id
        and (
          posts.status = 'visible'
          or posts.user_id = (select auth.uid())
          or comments.user_id = (select auth.uid())
          or (select public.is_staff())
        )
    )
  );

drop policy if exists comments_insert on public.comments;
create policy comments_insert on public.comments for insert
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1
      from public.posts
      where posts.id = comments.post_id
        and posts.status = 'visible'
    )
  );

drop policy if exists likes_insert on public.likes;
create policy likes_insert on public.likes for insert
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1
      from public.posts
      where posts.id = likes.post_id
        and posts.status = 'visible'
    )
  );
