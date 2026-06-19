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
