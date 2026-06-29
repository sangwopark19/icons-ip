/* ICONS — mock data (ported from the design prototype's data.js) */

import { RARITY_META } from './rarity';

export type { Rarity, RarityKey } from './rarity';

import type { RarityKey } from './rarity';

export type Stock = 'low' | 'ok' | 'soldout';

export interface Vertical {
  key: string;
  label: string;
  color: string;
}
export interface Ip {
  id: string;
  title: string;
  sub: string;
  v: Vertical;
  glyph: string;
  bg: string;
  fans: number;
  goods: number;
  cards: number;
  featured: boolean;
  tagline: string;
  synopsis: string;
}
export interface Good {
  id: string;
  name: string;
  ip: string;
  type: string;
  price: number;
  badge: string | null;
  stock: Stock;
  img: string;
}
export interface Card {
  id: string;
  ip: string;
  name: string;
  no: string;
  rarity: RarityKey;
  owned: boolean;
  bg: string;
}
export interface FandomEvent {
  id: string;
  title: string;
  ip: string | null;
  mode: string;
  status: string;
  date: string;
  loc: string;
  accent: string;
  img: string;
}
export interface Post {
  id: string;
  user: string;
  ipName: string;
  avatar: string;
  text: string;
  likes: number;
  comments: number;
  time: string;
  tag: string;
  img: string | null;
}
export interface Exchange {
  id: string;
  kind: '직거래' | '경매';
  card: string;
  rarity: RarityKey;
  want?: string;
  bid?: number;
  bids?: number;
  endsIn?: string;
  user: string;
  bg: string;
  fee: number;
}
export interface MarketItem {
  id: string;
  name: string;
  ip: string;
  type: string;
  price: number;
  cond: string;
  seller: string;
  verified: boolean;
  bg: string;
}

/* vertical accent map */
const V: Record<string, Vertical> = {
  blgl: { key: 'blgl', label: 'BL/GL', color: '#FF4D9D' },
  rofan: { key: 'rofan', label: '로맨스판타지', color: '#8B5CFF' },
  global: { key: 'global', label: '글로벌 IP', color: '#2DE2FF' },
  vtuber: { key: 'vtuber', label: '버튜버', color: '#38F0C0' },
  streamer: { key: 'streamer', label: '스트리머', color: '#FFB23D' },
};

/* poster gradient by 3 spectrum stops */
export const grad = (a: string, b: string, c: string) =>
  `linear-gradient(150deg, ${a}, ${b} 55%, ${c})`;

const imageBg = (src: string, fallback: string) =>
  `url("${src}") center / cover no-repeat, ${fallback}`;

const IPS: Ip[] = [
  { id: 'hwasan', title: '화산강림', sub: '리디 · 로판', v: V.rofan, glyph: '화산\n강림', bg: imageBg('/generated/ip/hwasan.png', grad('#3a1d6e', '#8B5CFF', '#FF4D9D')), fans: 42130, goods: 38, cards: 24, featured: true,
    tagline: '백번 죽어도 화산의 검을 든다', synopsis: '정파의 자존심 화산파, 그 부활을 그린 무협 판타지. 공식 라이선스 굿즈와 한정 카드가 ICONS에서 처음 공개됩니다.' },
  { id: 'cheong', title: '청명', sub: '카카오웹툰 · 로판', v: V.rofan, glyph: '청명', bg: imageBg('/generated/ip/cheong.png', grad('#1d2f6e', '#2D6FDB', '#8B5CFF')), fans: 31980, goods: 22, cards: 18, featured: true,
    tagline: '매화는 다시 핀다', synopsis: '청명 매화 시리즈 공식 굿즈 라인. 향수 한정판부터 아크릴까지.' },
  { id: 'lumen', title: 'LUMEN', sub: 'Global Anime', v: V.global, glyph: 'LU\nMEN', bg: imageBg('/generated/ip/lumen.png', grad('#0c4a5e', '#2DE2FF', '#38F0C0')), fans: 89020, goods: 54, cards: 40, featured: true,
    tagline: 'The light never sleeps', synopsis: '글로벌 흥행 애니메이션 LUMEN의 한국 공식 파트너. 시즌 한정 컬렉션 진행 중.' },
  { id: 'nocturne', title: '녹턴 클럽', sub: 'BL · 오리지널', v: V.blgl, glyph: '녹턴\n클럽', bg: imageBg('/generated/ip/nocturne.png', grad('#5e0c3a', '#FF4D9D', '#8B5CFF')), fans: 28470, goods: 30, cards: 21, featured: false,
    tagline: '밤은 우리 편', synopsis: '밴드 BL 「녹턴 클럽」 공식 머천다이즈.' },
  { id: 'lilac', title: '라일락 노트', sub: 'GL · 학원', v: V.blgl, glyph: '라일락', bg: imageBg('/generated/ip/lilac.png', grad('#3a0c5e', '#A981FF', '#FF4D9D')), fans: 19340, goods: 16, cards: 14, featured: false,
    tagline: '다정도 병이라면', synopsis: 'GL 감성 학원물 공식 컬렉션.' },
  { id: 'hoshina', title: '호시나 미오', sub: 'VTuber', v: V.vtuber, glyph: '호시나\n미오', bg: imageBg('/generated/ip/hoshina.png', grad('#0c5e4a', '#38F0C0', '#2DE2FF')), fans: 35180, goods: 44, cards: 33, featured: true,
    tagline: '오늘도 별을 줍는 중', synopsis: '버튜버 호시나 미오 1주년 기념 한정 굿즈 & 생일 카드 드롭.' },
  { id: 'rune', title: 'RUNE Live', sub: 'Streamer', v: V.streamer, glyph: 'RUNE', bg: imageBg('/generated/ip/rune.png', grad('#5e3a0c', '#FFB23D', '#FF4D9D')), fans: 24760, goods: 19, cards: 16, featured: false,
    tagline: '클립 장인', synopsis: '스트리머 RUNE 공식 채널 굿즈.' },
  { id: 'aster', title: 'ASTER', sub: 'Global · Game', v: V.global, glyph: 'AS\nTER', bg: imageBg('/generated/ip/aster.png', grad('#1d1d6e', '#5B7BFF', '#2DE2FF')), fans: 51200, goods: 48, cards: 36, featured: false,
    tagline: 'Reach the stars', synopsis: '글로벌 모바일 게임 ASTER 공식 굿즈 스토어.' },
];

const ipById = (id: string | null | undefined) => IPS.find((i) => i.id === id);

const GOODS_TYPES = ['아크릴 스탠드', '포토카드', '키링', '피규어', '음원·앨범', '의류', '문구', '한정 세트'];

const GOODS: Good[] = [
  { id: 'g1', name: '청명 매화 향수 한정판', ip: 'cheong', type: '음원·앨범', price: 38000, badge: '한정', stock: 'low', img: imageBg('/generated/goods/g1.png', grad('#1d2f6e', '#2D6FDB', '#8B5CFF')) },
  { id: 'g2', name: '화산강림 청명 아크릴 스탠드', ip: 'hwasan', type: '아크릴 스탠드', price: 22000, badge: '신상', stock: 'ok', img: imageBg('/generated/goods/g2.png', grad('#3a1d6e', '#8B5CFF', '#FF4D9D')) },
  { id: 'g3', name: '호시나 미오 1st 포토카드 세트', ip: 'hoshina', type: '포토카드', price: 15000, badge: '한정', stock: 'low', img: imageBg('/generated/goods/g3.png', grad('#0c5e4a', '#38F0C0', '#2DE2FF')) },
  { id: 'g4', name: 'LUMEN 시즌2 피규어', ip: 'lumen', type: '피규어', price: 89000, badge: '예약', stock: 'ok', img: imageBg('/generated/goods/g4.png', grad('#0c4a5e', '#2DE2FF', '#38F0C0')) },
  { id: 'g5', name: '녹턴 클럽 멤버 키링 6종', ip: 'nocturne', type: '키링', price: 12000, badge: null, stock: 'ok', img: imageBg('/generated/goods/g5.png', grad('#5e0c3a', '#FF4D9D', '#8B5CFF')) },
  { id: 'g6', name: 'ASTER 콜렉터 박스 세트', ip: 'aster', type: '한정 세트', price: 74000, badge: '한정', stock: 'soldout', img: imageBg('/generated/goods/g6.png', grad('#1d1d6e', '#5B7BFF', '#2DE2FF')) },
  { id: 'g7', name: '라일락 노트 엽서북', ip: 'lilac', type: '문구', price: 9000, badge: null, stock: 'ok', img: imageBg('/generated/goods/g7.png', grad('#3a0c5e', '#A981FF', '#FF4D9D')) },
  { id: 'g8', name: 'RUNE 오버사이즈 후드', ip: 'rune', type: '의류', price: 54000, badge: '신상', stock: 'ok', img: imageBg('/generated/goods/g8.png', grad('#5e3a0c', '#FFB23D', '#FF4D9D')) },
  { id: 'g9', name: '화산강림 매화검 레플리카', ip: 'hwasan', type: '한정 세트', price: 128000, badge: '한정', stock: 'low', img: imageBg('/generated/goods/g9.png', grad('#2a1550', '#8B5CFF', '#2DE2FF')) },
  { id: 'g10', name: '호시나 미오 아크릴 디오라마', ip: 'hoshina', type: '아크릴 스탠드', price: 34000, badge: null, stock: 'ok', img: imageBg('/generated/goods/g10.png', grad('#0c5e5e', '#38F0C0', '#8B5CFF')) },
  { id: 'g11', name: 'LUMEN 홀로그램 포토카드 12종', ip: 'lumen', type: '포토카드', price: 18000, badge: '한정', stock: 'low', img: imageBg('/generated/goods/g11.png', grad('#0c3a5e', '#2DE2FF', '#A981FF')) },
  { id: 'g12', name: '청명 자수 패치 키링', ip: 'cheong', type: '키링', price: 11000, badge: '신상', stock: 'ok', img: imageBg('/generated/goods/g12.png', grad('#1d2f6e', '#5B7BFF', '#FF4D9D')) },
];

const RARITY = RARITY_META;

const CARDS: Card[] = [
  { id: 'c1', ip: 'hwasan', name: '청명 · 매화 일섬', no: '001/120', rarity: 'HOLO', owned: true, bg: imageBg('/generated/cards/c1.png', grad('#3a1d6e', '#8B5CFF', '#FF4D9D')) },
  { id: 'c2', ip: 'hwasan', name: '화산의 검', no: '014/120', rarity: 'SSR', owned: true, bg: imageBg('/generated/cards/c2.png', grad('#2a1550', '#8B5CFF', '#2DE2FF')) },
  { id: 'c3', ip: 'hoshina', name: '호시나 · 1주년', no: '003/088', rarity: 'SSR', owned: true, bg: imageBg('/generated/cards/c3.png', grad('#0c5e4a', '#38F0C0', '#2DE2FF')) },
  { id: 'c4', ip: 'lumen', name: 'LUMEN · Dawn', no: '027/200', rarity: 'SR', owned: true, bg: imageBg('/generated/cards/c4.png', grad('#0c4a5e', '#2DE2FF', '#38F0C0')) },
  { id: 'c5', ip: 'cheong', name: '청명 · 봄밤', no: '041/090', rarity: 'R', owned: true, bg: imageBg('/generated/cards/c5.png', grad('#1d2f6e', '#2D6FDB', '#8B5CFF')) },
  { id: 'c6', ip: 'nocturne', name: '녹턴 · 무대', no: '009/070', rarity: 'SR', owned: true, bg: imageBg('/generated/cards/c6.png', grad('#5e0c3a', '#FF4D9D', '#8B5CFF')) },
  { id: 'c7', ip: 'hwasan', name: '청명 · 입문', no: '072/120', rarity: 'N', owned: true, bg: imageBg('/generated/cards/c7.png', grad('#241640', '#5a4a8a', '#8B5CFF')) },
  { id: 'c8', ip: 'lumen', name: 'LUMEN · Eclipse', no: '112/200', rarity: 'SSR', owned: false, bg: imageBg('/generated/cards/c8.png', grad('#0c3a5e', '#2DE2FF', '#A981FF')) },
  { id: 'c9', ip: 'hoshina', name: '호시나 · 스타라이트', no: '055/088', rarity: 'HOLO', owned: false, bg: imageBg('/generated/cards/c9.png', grad('#0c5e5e', '#38F0C0', '#8B5CFF')) },
  { id: 'c10', ip: 'aster', name: 'ASTER · Nova', no: '088/150', rarity: 'SR', owned: false, bg: imageBg('/generated/cards/c10.png', grad('#1d1d6e', '#5B7BFF', '#2DE2FF')) },
  { id: 'c11', ip: 'lilac', name: '라일락 · 방과후', no: '033/060', rarity: 'R', owned: false, bg: imageBg('/generated/cards/c11.png', grad('#3a0c5e', '#A981FF', '#FF4D9D')) },
  { id: 'c12', ip: 'rune', name: 'RUNE · 클러치', no: '019/070', rarity: 'SR', owned: false, bg: imageBg('/generated/cards/c12.png', grad('#5e3a0c', '#FFB23D', '#FF4D9D')) },
];

const EVENTS: FandomEvent[] = [
  { id: 'e1', title: '귀멸의칼날 × ICONS 팝업스토어', ip: null, mode: '오프라인', status: '진행중', date: '5.10 – 5.28', loc: '성수 갤러리아 포레', accent: '#FF4D9D', img: grad('#5e0c3a', '#FF4D9D', '#FFB23D') },
  { id: 'e2', title: '호시나 미오 1주년 온라인 팬미팅', ip: 'hoshina', mode: '온라인', status: '예매중', date: '5.17 20:00', loc: 'ICONS Live', accent: '#38F0C0', img: grad('#0c5e4a', '#38F0C0', '#2DE2FF') },
  { id: 'e3', title: '화산강림 매화 특별전', ip: 'hwasan', mode: '오프라인', status: '예정', date: '6.02 – 6.16', loc: '강남 ICONS 플래그십', accent: '#8B5CFF', img: grad('#3a1d6e', '#8B5CFF', '#FF4D9D') },
  { id: 'e4', title: 'LUMEN 시즌2 글로벌 카운트다운', ip: 'lumen', mode: '온라인', status: '예정', date: '6.20 21:00', loc: 'ICONS Live', accent: '#2DE2FF', img: grad('#0c4a5e', '#2DE2FF', '#38F0C0') },
  { id: 'e5', title: '녹턴 클럽 단독 쇼케이스', ip: 'nocturne', mode: '오프라인', status: '예매중', date: '6.28 18:00', loc: '홍대 무브홀', accent: '#FF4D9D', img: grad('#5e0c3a', '#FF4D9D', '#8B5CFF') },
];

const POSTS: Post[] = [
  { id: 'p1', user: 'tanjiro_fan_', ipName: '귀멸의칼날', avatar: '#FF4D9D', text: '성수 팝업 현장 다녀왔어요 🔥 굿즈 라인업 미쳤다... 매화검 레플리카 실물 보고 바로 결제함', likes: 342, comments: 48, time: '12분 전', tag: '팝업인증', img: grad('#5e0c3a', '#FF4D9D', '#FFB23D') },
  { id: 'p2', user: 'semail_love', ipName: '녹턴 클럽', avatar: '#8B5CFF', text: '녹턴 클럽 키링 6종 다 모았다!! 무대 카드 SSR 떴는데 교환 원하시는 분 댓글 주세요', likes: 218, comments: 33, time: '41분 전', tag: '카드교환', img: null },
  { id: 'p3', user: 'hoshi_kr_fan', ipName: '호시나 미오', avatar: '#38F0C0', text: '미오 1주년 생일 카드 HOLO 떴습니다... 손떨려요 인생 가챠 ✨ 다들 봐주세요', likes: 503, comments: 91, time: '1시간 전', tag: '가챠', img: grad('#0c5e4a', '#38F0C0', '#2DE2FF') },
  { id: 'p4', user: 'naruto_otaku', ipName: 'LUMEN', avatar: '#2DE2FF', text: 'LUMEN 시즌2 피규어 예약 오픈했네요. 디테일 실화? 프리뷰 사진 첨부합니다', likes: 189, comments: 27, time: '2시간 전', tag: '한정굿즈', img: grad('#0c4a5e', '#2DE2FF', '#38F0C0') },
  { id: 'p5', user: 'maehwa_geom', ipName: '화산강림', avatar: '#8B5CFF', text: '화산강림 매화검 레플리카 드디어 입수… 검신 각인 디테일 실화냐 ㅠㅠ 공식 정품 퀄 인정합니다', likes: 421, comments: 57, time: '34분 전', tag: '굿즈인증', img: grad('#3a1d6e', '#8B5CFF', '#FF4D9D') },
  { id: 'p6', user: 'cheong_spring', ipName: '청명', avatar: '#2D6FDB', text: '청명 봄밤 카드 떴어요!! R인데도 일러 너무 고와서 대만족… 매화 향수 한정판이랑 같이 질렀습니다', likes: 287, comments: 39, time: '1시간 전', tag: '카드자랑', img: null },
];

const EXCHANGES: Exchange[] = [
  { id: 'x1', kind: '직거래', card: '호시나 · 스타라이트', rarity: 'HOLO', want: '미오 1주년 SSR', user: 'star_collector', bg: grad('#0c5e5e', '#38F0C0', '#8B5CFF'), fee: 50 },
  { id: 'x2', kind: '경매', card: 'LUMEN · Eclipse', rarity: 'SSR', bid: 1200, bids: 14, endsIn: '03:21:40', user: 'eclipse_', bg: grad('#0c3a5e', '#2DE2FF', '#A981FF'), fee: 50 },
  { id: 'x3', kind: '직거래', card: '청명 · 매화 일섬', rarity: 'HOLO', want: '화산 SSR 또는 제안', user: 'maehwa_', bg: grad('#3a1d6e', '#8B5CFF', '#FF4D9D'), fee: 50 },
  { id: 'x4', kind: '경매', card: 'ASTER · Nova', rarity: 'SR', bid: 430, bids: 6, endsIn: '11:48:02', user: 'nova_pull', bg: grad('#1d1d6e', '#5B7BFF', '#2DE2FF'), fee: 50 },
  { id: 'x5', kind: '직거래', card: '라일락 · 방과후', rarity: 'R', want: 'GL 카드 아무거나', user: 'lilac_note', bg: grad('#3a0c5e', '#A981FF', '#FF4D9D'), fee: 50 },
  { id: 'x6', kind: '경매', card: '녹턴 · 무대', rarity: 'SR', bid: 680, bids: 9, endsIn: '06:02:55', user: 'nocturne_live', bg: grad('#5e0c3a', '#FF4D9D', '#8B5CFF'), fee: 50 },
];

const MARKET: MarketItem[] = [
  { id: 'm1', name: '화산강림 매화검 레플리카 (미개봉)', ip: 'hwasan', type: '피규어', price: 115000, cond: '미개봉', seller: 'mhk_seller', verified: true, bg: grad('#2a1550', '#8B5CFF', '#2DE2FF') },
  { id: 'm2', name: '호시나 미오 1st 포토카드 풀세트', ip: 'hoshina', type: '포토카드', price: 24000, cond: 'A급', seller: 'mio_shop', verified: true, bg: grad('#0c5e4a', '#38F0C0', '#2DE2FF') },
  { id: 'm3', name: 'LUMEN 시즌1 피규어', ip: 'lumen', type: '피규어', price: 62000, cond: '개봉/전시', seller: 'lumen_kr', verified: true, bg: grad('#0c4a5e', '#2DE2FF', '#38F0C0') },
  { id: 'm4', name: '녹턴 클럽 키링 (단품)', ip: 'nocturne', type: '키링', price: 8000, cond: '미사용', seller: 'noc_fan', verified: false, bg: grad('#5e0c3a', '#FF4D9D', '#8B5CFF') },
  { id: 'm5', name: 'ASTER 콜렉터 박스 (구성품 일부)', ip: 'aster', type: '한정 세트', price: 48000, cond: 'B급', seller: 'aster_g', verified: true, bg: grad('#1d1d6e', '#5B7BFF', '#2DE2FF') },
  { id: 'm6', name: '청명 향수 한정판 (새상품)', ip: 'cheong', type: '음원·앨범', price: 42000, cond: '미개봉', seller: 'cheong_', verified: true, bg: grad('#1d2f6e', '#2D6FDB', '#8B5CFF') },
];

const TRENDING = ['#화산강림', '#매화검존', '#팝업인증', '#호시나1주년', '#한정굿즈', '#버튜버', '#로판추천', '#LUMEN시즌2', '#카드교환', '#홀로떴다'];

const STATS = { fans: '12.4K', ips: 89, goods: '1,240', events: 48 };

export const krw = (n: number) => '₩' + n.toLocaleString('ko-KR');

export const DATA = {
  V,
  IPS,
  ipById,
  GOODS,
  GOODS_TYPES,
  RARITY,
  CARDS,
  EVENTS,
  POSTS,
  EXCHANGES,
  MARKET,
  TRENDING,
  STATS,
  krw,
};
