create or replace function public.community_post_reaction_counts(target_post_ids uuid[])
returns table (
  post_id uuid,
  likes_count bigint,
  comments_count bigint
)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  with target_posts as (
    select posts.id
    from public.posts
    where posts.id = any(target_post_ids)
      and posts.status = 'visible'
  ),
  like_counts as (
    select likes.post_id, count(*)::bigint as likes_count
    from public.likes
    join target_posts on target_posts.id = likes.post_id
    group by likes.post_id
  ),
  comment_counts as (
    select comments.post_id, count(*)::bigint as comments_count
    from public.comments
    join target_posts on target_posts.id = comments.post_id
    group by comments.post_id
  )
  select
    target_posts.id as post_id,
    coalesce(like_counts.likes_count, 0)::bigint as likes_count,
    coalesce(comment_counts.comments_count, 0)::bigint as comments_count
  from target_posts
  left join like_counts on like_counts.post_id = target_posts.id
  left join comment_counts on comment_counts.post_id = target_posts.id;
$$;

grant execute on function public.community_post_reaction_counts(uuid[]) to anon, authenticated;
