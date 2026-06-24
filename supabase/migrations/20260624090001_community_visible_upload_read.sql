-- Allow public community feeds to render images attached to visible posts while
-- keeping the user-uploads bucket private and owner-scoped for writes.
drop policy if exists posts_insert on public.posts;
create policy posts_insert on public.posts for insert
  with check (
    (select auth.uid()) = user_id
    and (
      image_path is null
      or (storage.foldername(image_path))[1] = (select auth.uid())::text
    )
  );

drop policy if exists posts_update on public.posts;
create policy posts_update on public.posts for update
  using ((select auth.uid()) = user_id or (select public.is_staff()))
  with check (
    (select public.is_staff())
    or (
      (select auth.uid()) = user_id
      and (
        image_path is null
        or (storage.foldername(image_path))[1] = (select auth.uid())::text
      )
    )
  );

create policy user_uploads_visible_post_read on storage.objects for select
  using (
    bucket_id = 'user-uploads'
    and exists (
      select 1
      from public.posts
      where posts.image_path = storage.objects.name
        and posts.status = 'visible'
        and posts.user_id::text = (storage.foldername(storage.objects.name))[1]
    )
  );
