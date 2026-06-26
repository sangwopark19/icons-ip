-- Preserve the documented reports/blocks read contract: owner + staff/admin.

drop policy if exists blocks_read_self on public.blocks;
drop policy if exists blocks_read_self_or_staff on public.blocks;

create policy blocks_read_self_or_staff on public.blocks for select
  using ((select auth.uid()) = user_id or (select public.is_staff()));
