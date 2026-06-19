-- ICONS local seed for P0 public catalog browsing.
-- Scope: verticals + IP Hub only (#7). Goods/cards/events are handled by follow-up slices.

insert into public.verticals (key, label, color) values
  ('blgl', 'BL/GL', '#FF4D9D'),
  ('rofan', '로맨스판타지', '#8B5CFF'),
  ('global', '글로벌 IP', '#2DE2FF'),
  ('vtuber', '버튜버', '#38F0C0'),
  ('streamer', '스트리머', '#FFB23D')
on conflict (key) do update set
  label = excluded.label,
  color = excluded.color;

insert into public.ips (
  id,
  title,
  sub,
  vertical_key,
  glyph,
  bg,
  tagline,
  synopsis,
  featured,
  fans_count,
  goods_count,
  cards_count
) values
  (
    'hwasan',
    '화산강림',
    '리디 · 로판',
    'rofan',
    E'화산\n강림',
    'url("/generated/ip/hwasan.png") center / cover no-repeat, linear-gradient(150deg, #3a1d6e, #8B5CFF 55%, #FF4D9D)',
    '백번 죽어도 화산의 검을 든다',
    '정파의 자존심 화산파, 그 부활을 그린 무협 판타지. 공식 라이선스 굿즈와 한정 카드가 ICONS에서 처음 공개됩니다.',
    true,
    42130,
    38,
    24
  ),
  (
    'cheong',
    '청명',
    '카카오웹툰 · 로판',
    'rofan',
    '청명',
    'url("/generated/ip/cheong.png") center / cover no-repeat, linear-gradient(150deg, #1d2f6e, #2D6FDB 55%, #8B5CFF)',
    '매화는 다시 핀다',
    '청명 매화 시리즈 공식 굿즈 라인. 향수 한정판부터 아크릴까지.',
    true,
    31980,
    22,
    18
  ),
  (
    'lumen',
    'LUMEN',
    'Global Anime',
    'global',
    E'LU\nMEN',
    'url("/generated/ip/lumen.png") center / cover no-repeat, linear-gradient(150deg, #0c4a5e, #2DE2FF 55%, #38F0C0)',
    'The light never sleeps',
    '글로벌 흥행 애니메이션 LUMEN의 한국 공식 파트너. 시즌 한정 컬렉션 진행 중.',
    true,
    89020,
    54,
    40
  ),
  (
    'nocturne',
    '녹턴 클럽',
    'BL · 오리지널',
    'blgl',
    E'녹턴\n클럽',
    'url("/generated/ip/nocturne.png") center / cover no-repeat, linear-gradient(150deg, #5e0c3a, #FF4D9D 55%, #8B5CFF)',
    '밤은 우리 편',
    '밴드 BL 「녹턴 클럽」 공식 머천다이즈.',
    false,
    28470,
    30,
    21
  ),
  (
    'lilac',
    '라일락 노트',
    'GL · 학원',
    'blgl',
    '라일락',
    'url("/generated/ip/lilac.png") center / cover no-repeat, linear-gradient(150deg, #3a0c5e, #A981FF 55%, #FF4D9D)',
    '다정도 병이라면',
    'GL 감성 학원물 공식 컬렉션.',
    false,
    19340,
    16,
    14
  ),
  (
    'hoshina',
    '호시나 미오',
    'VTuber',
    'vtuber',
    E'호시나\n미오',
    'url("/generated/ip/hoshina.png") center / cover no-repeat, linear-gradient(150deg, #0c5e4a, #38F0C0 55%, #2DE2FF)',
    '오늘도 별을 줍는 중',
    '버튜버 호시나 미오 1주년 기념 한정 굿즈 & 생일 카드 드롭.',
    true,
    35180,
    44,
    33
  ),
  (
    'rune',
    'RUNE Live',
    'Streamer',
    'streamer',
    'RUNE',
    'url("/generated/ip/rune.png") center / cover no-repeat, linear-gradient(150deg, #5e3a0c, #FFB23D 55%, #FF4D9D)',
    '클립 장인',
    '스트리머 RUNE 공식 채널 굿즈.',
    false,
    24760,
    19,
    16
  ),
  (
    'aster',
    'ASTER',
    'Global · Game',
    'global',
    E'AS\nTER',
    'url("/generated/ip/aster.png") center / cover no-repeat, linear-gradient(150deg, #1d1d6e, #5B7BFF 55%, #2DE2FF)',
    'Reach the stars',
    '글로벌 모바일 게임 ASTER 공식 굿즈 스토어.',
    false,
    51200,
    48,
    36
  )
on conflict (id) do update set
  title = excluded.title,
  sub = excluded.sub,
  vertical_key = excluded.vertical_key,
  glyph = excluded.glyph,
  bg = excluded.bg,
  tagline = excluded.tagline,
  synopsis = excluded.synopsis,
  featured = excluded.featured,
  fans_count = excluded.fans_count,
  goods_count = excluded.goods_count,
  cards_count = excluded.cards_count,
  updated_at = now();

insert into public.goods (id, ip_id, name, type, price, badge, stock, bg) values
  ('g1', 'cheong', '청명 매화 향수 한정판', '음원·앨범', 38000, '한정', 'low', 'url("/generated/goods/g1.png") center / cover no-repeat, linear-gradient(150deg, #1d2f6e, #2D6FDB 55%, #8B5CFF)'),
  ('g2', 'hwasan', '화산강림 청명 아크릴 스탠드', '아크릴 스탠드', 22000, '신상', 'ok', 'url("/generated/goods/g2.png") center / cover no-repeat, linear-gradient(150deg, #3a1d6e, #8B5CFF 55%, #FF4D9D)'),
  ('g3', 'hoshina', '호시나 미오 1st 포토카드 세트', '포토카드', 15000, '한정', 'low', 'url("/generated/goods/g3.png") center / cover no-repeat, linear-gradient(150deg, #0c5e4a, #38F0C0 55%, #2DE2FF)'),
  ('g4', 'lumen', 'LUMEN 시즌2 피규어', '피규어', 89000, '예약', 'ok', 'url("/generated/goods/g4.png") center / cover no-repeat, linear-gradient(150deg, #0c4a5e, #2DE2FF 55%, #38F0C0)'),
  ('g5', 'nocturne', '녹턴 클럽 멤버 키링 6종', '키링', 12000, null, 'ok', 'url("/generated/goods/g5.png") center / cover no-repeat, linear-gradient(150deg, #5e0c3a, #FF4D9D 55%, #8B5CFF)'),
  ('g6', 'aster', 'ASTER 콜렉터 박스 세트', '한정 세트', 74000, '한정', 'soldout', 'url("/generated/goods/g6.png") center / cover no-repeat, linear-gradient(150deg, #1d1d6e, #5B7BFF 55%, #2DE2FF)'),
  ('g7', 'lilac', '라일락 노트 엽서북', '문구', 9000, null, 'ok', 'url("/generated/goods/g7.png") center / cover no-repeat, linear-gradient(150deg, #3a0c5e, #A981FF 55%, #FF4D9D)'),
  ('g8', 'rune', 'RUNE 오버사이즈 후드', '의류', 54000, '신상', 'ok', 'url("/generated/goods/g8.png") center / cover no-repeat, linear-gradient(150deg, #5e3a0c, #FFB23D 55%, #FF4D9D)'),
  ('g9', 'hwasan', '화산강림 매화검 레플리카', '한정 세트', 128000, '한정', 'low', 'url("/generated/goods/g9.png") center / cover no-repeat, linear-gradient(150deg, #2a1550, #8B5CFF 55%, #2DE2FF)'),
  ('g10', 'hoshina', '호시나 미오 아크릴 디오라마', '아크릴 스탠드', 34000, null, 'ok', 'url("/generated/goods/g10.png") center / cover no-repeat, linear-gradient(150deg, #0c5e5e, #38F0C0 55%, #8B5CFF)'),
  ('g11', 'lumen', 'LUMEN 홀로그램 포토카드 12종', '포토카드', 18000, '한정', 'low', 'url("/generated/goods/g11.png") center / cover no-repeat, linear-gradient(150deg, #0c3a5e, #2DE2FF 55%, #A981FF)'),
  ('g12', 'cheong', '청명 자수 패치 키링', '키링', 11000, '신상', 'ok', 'url("/generated/goods/g12.png") center / cover no-repeat, linear-gradient(150deg, #1d2f6e, #5B7BFF 55%, #FF4D9D)')
on conflict (id) do update set
  ip_id = excluded.ip_id,
  name = excluded.name,
  type = excluded.type,
  price = excluded.price,
  badge = excluded.badge,
  stock = excluded.stock,
  bg = excluded.bg,
  updated_at = now();

insert into public.cards (id, ip_id, name, no, rarity, bg) values
  ('c1', 'hwasan', '청명 · 매화 일섬', '001/120', 'HOLO', 'url("/generated/cards/c1.png") center / cover no-repeat, linear-gradient(150deg, #3a1d6e, #8B5CFF 55%, #FF4D9D)'),
  ('c2', 'hwasan', '화산의 검', '014/120', 'SSR', 'url("/generated/cards/c2.png") center / cover no-repeat, linear-gradient(150deg, #2a1550, #8B5CFF 55%, #2DE2FF)'),
  ('c3', 'hoshina', '호시나 · 1주년', '003/088', 'SSR', 'url("/generated/cards/c3.png") center / cover no-repeat, linear-gradient(150deg, #0c5e4a, #38F0C0 55%, #2DE2FF)'),
  ('c4', 'lumen', 'LUMEN · Dawn', '027/200', 'SR', 'url("/generated/cards/c4.png") center / cover no-repeat, linear-gradient(150deg, #0c4a5e, #2DE2FF 55%, #38F0C0)'),
  ('c5', 'cheong', '청명 · 봄밤', '041/090', 'R', 'url("/generated/cards/c5.png") center / cover no-repeat, linear-gradient(150deg, #1d2f6e, #2D6FDB 55%, #8B5CFF)'),
  ('c6', 'nocturne', '녹턴 · 무대', '009/070', 'SR', 'url("/generated/cards/c6.png") center / cover no-repeat, linear-gradient(150deg, #5e0c3a, #FF4D9D 55%, #8B5CFF)'),
  ('c7', 'hwasan', '청명 · 입문', '072/120', 'N', 'url("/generated/cards/c7.png") center / cover no-repeat, linear-gradient(150deg, #241640, #5a4a8a 55%, #8B5CFF)'),
  ('c8', 'lumen', 'LUMEN · Eclipse', '112/200', 'SSR', 'url("/generated/cards/c8.png") center / cover no-repeat, linear-gradient(150deg, #0c3a5e, #2DE2FF 55%, #A981FF)'),
  ('c9', 'hoshina', '호시나 · 스타라이트', '055/088', 'HOLO', 'url("/generated/cards/c9.png") center / cover no-repeat, linear-gradient(150deg, #0c5e5e, #38F0C0 55%, #8B5CFF)'),
  ('c10', 'aster', 'ASTER · Nova', '088/150', 'SR', 'url("/generated/cards/c10.png") center / cover no-repeat, linear-gradient(150deg, #1d1d6e, #5B7BFF 55%, #2DE2FF)'),
  ('c11', 'lilac', '라일락 · 방과후', '033/060', 'R', 'url("/generated/cards/c11.png") center / cover no-repeat, linear-gradient(150deg, #3a0c5e, #A981FF 55%, #FF4D9D)'),
  ('c12', 'rune', 'RUNE · 클러치', '019/070', 'SR', 'url("/generated/cards/c12.png") center / cover no-repeat, linear-gradient(150deg, #5e3a0c, #FFB23D 55%, #FF4D9D)')
on conflict (id) do update set
  ip_id = excluded.ip_id,
  name = excluded.name,
  no = excluded.no,
  rarity = excluded.rarity,
  bg = excluded.bg;

insert into public.events (id, ip_id, title, mode, status, starts_at, ends_at, location, accent, bg) values
  ('e1', null, '귀멸의칼날 × ICONS 팝업스토어', '오프라인', '진행중', '2026-05-10 00:00:00+09', '2026-05-28 23:59:00+09', '성수 갤러리아 포레', '#FF4D9D', 'linear-gradient(150deg, #5e0c3a, #FF4D9D 55%, #FFB23D)'),
  ('e2', 'hoshina', '호시나 미오 1주년 온라인 팬미팅', '온라인', '예매중', '2026-05-17 20:00:00+09', null, 'ICONS Live', '#38F0C0', 'linear-gradient(150deg, #0c5e4a, #38F0C0 55%, #2DE2FF)'),
  ('e3', 'hwasan', '화산강림 매화 특별전', '오프라인', '예정', '2026-06-02 00:00:00+09', '2026-06-16 23:59:00+09', '강남 ICONS 플래그십', '#8B5CFF', 'linear-gradient(150deg, #3a1d6e, #8B5CFF 55%, #FF4D9D)'),
  ('e4', 'lumen', 'LUMEN 시즌2 글로벌 카운트다운', '온라인', '예정', '2026-06-20 21:00:00+09', null, 'ICONS Live', '#2DE2FF', 'linear-gradient(150deg, #0c4a5e, #2DE2FF 55%, #38F0C0)'),
  ('e5', 'nocturne', '녹턴 클럽 단독 쇼케이스', '오프라인', '예매중', '2026-06-28 18:00:00+09', null, '홍대 무브홀', '#FF4D9D', 'linear-gradient(150deg, #5e0c3a, #FF4D9D 55%, #8B5CFF)')
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
  updated_at = now();
