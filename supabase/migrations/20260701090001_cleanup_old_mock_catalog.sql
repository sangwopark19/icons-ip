-- Remove the previous prototype catalog rows before the licensed mock catalog seed runs.
-- Guard transactional/gacha/ticket references so production history is never silently deleted.

do $$
declare
  old_verticals text[] := array['blgl', 'rofan', 'global', 'vtuber', 'streamer'];
  old_ips text[] := array['hwasan', 'cheong', 'lumen', 'nocturne', 'lilac', 'hoshina', 'rune', 'aster'];
  old_goods text[] := array['g1', 'g2', 'g3', 'g4', 'g5', 'g6', 'g7', 'g8', 'g9', 'g10', 'g11', 'g12'];
  old_cards text[] := array['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8', 'c9', 'c10', 'c11', 'c12'];
  old_events text[] := array['e1', 'e2', 'e3', 'e4', 'e5'];
  dependency_count integer;
begin
  select count(*) into dependency_count
  from public.order_items
  where good_id = any(old_goods);
  if dependency_count > 0 then
    raise exception 'old mock catalog cleanup aborted: % order_items reference old goods', dependency_count;
  end if;

  select count(*) into dependency_count
  from public.ticket_orders
  where event_id = any(old_events);
  if dependency_count > 0 then
    raise exception 'old mock catalog cleanup aborted: % ticket_orders reference old events', dependency_count;
  end if;

  select count(*) into dependency_count
  from public.card_pools
  where ip_id = any(old_ips);
  if dependency_count > 0 then
    raise exception 'old mock catalog cleanup aborted: % card_pools reference old IPs', dependency_count;
  end if;

  select count(*) into dependency_count
  from public.pull_results
  where card_id = any(old_cards);
  if dependency_count > 0 then
    raise exception 'old mock catalog cleanup aborted: % pull_results reference old cards', dependency_count;
  end if;

  select count(*) into dependency_count
  from public.user_cards
  where card_id = any(old_cards);
  if dependency_count > 0 then
    raise exception 'old mock catalog cleanup aborted: % user_cards reference old cards', dependency_count;
  end if;

  delete from public.cart_items
  where good_id = any(old_goods);

  delete from public.ticket_types
  where event_id = any(old_events);

  delete from public.ip_follows
  where ip_id = any(old_ips);

  update public.posts
  set ip_id = null
  where ip_id = any(old_ips);

  delete from public.goods
  where id = any(old_goods);

  delete from public.events
  where id = any(old_events);

  delete from public.cards
  where id = any(old_cards);

  delete from public.ips
  where id = any(old_ips);

  delete from public.verticals v
  where v.key = any(old_verticals)
    and not exists (
      select 1
      from public.ips i
      where i.vertical_key = v.key
    );
end $$;
