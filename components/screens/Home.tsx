'use client';

import Link from 'next/link';
import { useMemo, useState, type ReactNode } from 'react';
import { useFormStatus } from 'react-dom';
import { toggleIpFollowAction } from '@/app/ip/actions';
import type { CatalogSnapshot } from '@/lib/catalog';
import type { Card, FandomEvent, Good, Ip, Stock } from '@/lib/data';
import { buildHomeIpWorld } from '@/lib/home-catalog';
import { hrefFor } from '@/lib/routes';
import { useCart } from '@/components/shell/CartProvider';
import { Icon } from '@/components/ui/Icon';
import { Collectible } from '@/components/ui/Collectible';
import { Empty } from '@/components/ui/Empty';

const STOCK_LABEL: Record<Stock, string | null> = { low: '품절임박', soldout: '품절', ok: null };

const compactNumber = (n: number) =>
  new Intl.NumberFormat('ko-KR', { notation: 'compact', maximumFractionDigits: 1 }).format(n);

const plainNumber = (n: number) => new Intl.NumberFormat('ko-KR').format(n);

const krw = (n: number) => `₩${n.toLocaleString('ko-KR')}`;

function FandomJoinButton() {
  const { pending } = useFormStatus();

  return (
    <button className="btn btn-holo" disabled={pending}>
      {pending ? '저장 중' : '팬덤 가입 — 무료'} <Icon name="heart" size={16} />
    </button>
  );
}

function FandomJoinForm({ ipId }: { ipId: string }) {
  return (
    <form action={toggleIpFollowAction}>
      <input type="hidden" name="ipId" value={ipId} />
      <input type="hidden" name="intent" value="follow" />
      <input type="hidden" name="next" value={`/ip/${ipId}`} />
      <FandomJoinButton />
    </form>
  );
}

function Picker({
  ips,
  selectedIpId,
  onSelect,
}: {
  ips: Ip[];
  selectedIpId: string;
  onSelect: (ipId: string) => void;
}) {
  return (
    <div className="home-picker" role="group" aria-label="최애 IP 선택">
      {ips.map((ip) => {
        const active = ip.id === selectedIpId;
        return (
          <button
            key={ip.id}
            type="button"
            className="home-picker-button"
            aria-pressed={active}
            onClick={() => onSelect(ip.id)}
          >
            <span
              className="home-picker-poster"
              style={{
                background: ip.bg,
                boxShadow: active
                  ? `0 0 0 2px ${ip.v.color}, 0 18px 38px -18px ${ip.v.color}`
                  : '0 0 0 1px rgba(255,255,255,.12)',
              }}
            >
              <span className="sheen" />
            </span>
            <span style={{ opacity: active ? 1 : 0.58 }}>{ip.title}</span>
          </button>
        );
      })}
    </div>
  );
}

function SelectedIpHero({
  selectedIp,
  selectableIps,
  onSelect,
  stats,
}: {
  selectedIp: Ip;
  selectableIps: Ip[];
  onSelect: (ipId: string) => void;
  stats: { ips: number; goods: number; cards: number; events: number };
}) {
  return (
    <header className="home-hero">
      <div className="home-hero-copy">
        <div className="home-kicker rise">
          <span className="dot" style={{ width: 7, height: 7, borderRadius: 99, background: 'var(--mint)', boxShadow: '0 0 10px var(--mint)' }} />
          <span className="home-kicker-text">ICONS · 공식 라이선스 서브컬처 팬덤 플랫폼</span>
        </div>

        <h1 className="h-xxl rise" style={{ animationDelay: '.05s', marginTop: 22 }}>
          누구의<br />팬이세요?
        </h1>
        <p className="muted rise" style={{ animationDelay: '.1s', marginTop: 22, maxWidth: 520, fontSize: 'clamp(16px,1.8vw,20px)' }}>
          최애를 고르면 그 세계가 통째로 열려요. <strong style={{ color: 'var(--text)' }}>사고 · 모으고 · 만나고 · 떠들고</strong> — 흩어진 덕질을 한 곳에서.
        </p>

        <div className="rise" style={{ animationDelay: '.15s', marginTop: 34 }}>
          <div className="eyebrow" style={{ marginBottom: 14 }}>Favorite First</div>
          <Picker ips={selectableIps} selectedIpId={selectedIp.id} onSelect={onSelect} />
        </div>

        <div className="home-cta-row rise" style={{ animationDelay: '.2s' }}>
          <FandomJoinForm ipId={selectedIp.id} />
          <Link className="btn btn-ghost" href={hrefFor('ip', selectedIp.id)}>
            IP 허브 보기 <Icon name="arrow" size={16} />
          </Link>
        </div>

        <div className="home-stat-row rise" style={{ animationDelay: '.25s' }}>
          {([
            [stats.ips, '공식 IP'],
            [stats.goods, '굿즈'],
            [stats.cards, '카드'],
            [stats.events, '이벤트'],
          ] as const).map(([value, label]) => (
            <div key={label} className="col">
              <span className="h-lg holo-text" style={{ fontFamily: 'var(--ff-display)' }}>{plainNumber(value)}</span>
              <span className="faint mono" style={{ fontSize: 11 }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="home-hero-art" style={{ borderColor: `${selectedIp.v.color}66` }}>
        <div className="home-hero-art-bg" style={{ background: selectedIp.bg }} />
        <div className="sheen" />
        <div className="home-hero-art-shade" />
        <div className="home-hero-art-label">
          <div className="mono" style={{ fontSize: 12, letterSpacing: '.18em', opacity: 0.78 }}>NOW SHOWING</div>
          <div className="h-lg" style={{ color: selectedIp.v.color, fontFamily: 'var(--ff-display)', marginTop: 6 }}>{selectedIp.title}</div>
          <div className="muted" style={{ marginTop: 8, maxWidth: 420 }}>{selectedIp.tagline}</div>
        </div>
      </div>
    </header>
  );
}

function IpFeatureCard({
  ip,
  goodsCount,
  cardsCount,
  eventsCount,
}: {
  ip: Ip;
  goodsCount: number;
  cardsCount: number;
  eventsCount: number;
}) {
  return (
    <div className="home-ip-feature" style={{ borderColor: `${ip.v.color}55` }}>
      <div className="home-ip-feature-bg" style={{ background: ip.bg }} />
      <div className="home-ip-feature-shade" />
      <div style={{ position: 'relative', zIndex: 2, padding: 26 }}>
        <span className="tag" style={{ borderColor: ip.v.color, color: '#fff', background: 'rgba(0,0,0,.35)' }}>{ip.v.label} · {ip.sub}</span>
        <h2 className="h-lg" style={{ marginTop: 16 }}>{ip.title}</h2>
        <p style={{ fontWeight: 700, marginTop: 8 }}>{ip.tagline}</p>
        <p className="muted" style={{ marginTop: 10 }}>{ip.synopsis}</p>
        <div className="wrapgap" style={{ marginTop: 22 }}>
          <span className="tag" style={{ color: ip.v.color }}>팬 {compactNumber(ip.fans)}</span>
          <span className="tag">굿즈 {goodsCount}</span>
          <span className="tag">카드 {cardsCount}</span>
          <span className="tag">이벤트 {eventsCount}</span>
        </div>
      </div>
    </div>
  );
}

function TileEmpty({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="row" style={{ gap: 12, color: 'var(--dim)', fontSize: 13.5 }}>
      <span style={{ width: 42, height: 42, borderRadius: 14, display: 'grid', placeItems: 'center', background: 'rgba(255,255,255,.05)', color: 'var(--violet-2)', flex: '0 0 auto' }}>
        <Icon name={icon} size={20} />
      </span>
      <span>{text}</span>
    </div>
  );
}

function ActionTile({
  eyebrow,
  title,
  color,
  children,
  cta,
}: {
  eyebrow: string;
  title: string;
  color: string;
  children: ReactNode;
  cta: ReactNode;
}) {
  return (
    <div className="card home-action-tile">
      <div className="mono" style={{ fontSize: 11, letterSpacing: '.12em', color, textTransform: 'uppercase' }}>{eyebrow}</div>
      <h3 style={{ fontSize: 18, fontWeight: 800, marginTop: 8 }}>{title}</h3>
      <div style={{ marginTop: 16 }}>{children}</div>
      <div style={{ marginTop: 'auto', paddingTop: 16 }}>{cta}</div>
    </div>
  );
}

function GoodsTile({
  good,
  added,
  onAdd,
}: {
  good: Good | null;
  added: boolean;
  onAdd: () => void;
}) {
  const stockLabel = good ? STOCK_LABEL[good.stock] : null;
  const disabled = !good || good.stock === 'soldout';

  return (
    <ActionTile
      eyebrow="사요 · 공식 굿즈"
      title="대표 굿즈"
      color="var(--amber)"
      cta={
        <button
          className="btn btn-primary"
          disabled={disabled}
          onClick={onAdd}
          style={{ width: '100%', opacity: disabled ? 0.5 : 1, cursor: disabled ? 'not-allowed' : 'pointer' }}
        >
          {added ? '장바구니 담김' : '장바구니 담기'} <Icon name={added ? 'check' : 'bag'} size={16} />
        </button>
      }
    >
      {good ? (
        <div className="row" style={{ alignItems: 'center', gap: 14 }}>
          <div className="home-action-thumb" style={{ background: good.img }}>
            <span className="sheen" />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 700, lineHeight: 1.3 }}>{good.name}</div>
            <div className="muted" style={{ fontSize: 13, marginTop: 5 }}>{good.type}{stockLabel ? ` · ${stockLabel}` : ''}</div>
            <div className="mono" style={{ fontSize: 15, marginTop: 6 }}>{krw(good.price)}</div>
          </div>
        </div>
      ) : (
        <TileEmpty icon="bag" text="선택한 IP의 대표 굿즈가 아직 등록되지 않았습니다." />
      )}
    </ActionTile>
  );
}

function CardTile({ card, ip }: { card: Card | null; ip: Ip }) {
  return (
    <ActionTile
      eyebrow="모아요 · 수집 카드"
      title="대표 카드"
      color="var(--violet-2)"
      cta={
        <Link className="btn btn-holo" href={hrefFor('binder')} style={{ width: '100%' }}>
          지금 뽑기 <Icon name="spark" size={16} />
        </Link>
      }
    >
      {card ? (
        <div className="row" style={{ alignItems: 'center', gap: 16 }}>
          <Collectible card={{ ...card, owned: true }} ip={ip} size="sm" />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 700, lineHeight: 1.3 }}>{card.name}</div>
            <div className="muted mono" style={{ fontSize: 12, marginTop: 6 }}>No. {card.no}</div>
            <span className="tag" style={{ display: 'inline-flex', marginTop: 10 }}>{card.rarity}</span>
          </div>
        </div>
      ) : (
        <TileEmpty icon="card" text="선택한 IP의 카드가 아직 등록되지 않았습니다." />
      )}
    </ActionTile>
  );
}

function EventTile({ event }: { event: FandomEvent | null }) {
  return (
    <ActionTile
      eyebrow="만나요 · 팝업·팬미팅"
      title="대표 이벤트"
      color="var(--mint)"
      cta={
        <Link className="btn btn-ghost" href={hrefFor('events')} style={{ width: '100%' }}>
          예매하기 <Icon name="event" size={16} />
        </Link>
      }
    >
      {event ? (
        <div>
          <div className="mono" style={{ fontSize: 22, fontWeight: 700 }}>{event.date || '일정 공개 예정'}</div>
          <div style={{ fontWeight: 700, marginTop: 10 }}>{event.title}</div>
          <div className="muted" style={{ fontSize: 13, marginTop: 7 }}>{event.loc || '장소 공개 예정'} · {event.mode} · {event.status}</div>
        </div>
      ) : (
        <TileEmpty icon="event" text="선택한 IP의 이벤트가 아직 등록되지 않았습니다." />
      )}
    </ActionTile>
  );
}

function CommunityTile({ ip, goodsCount, cardsCount }: { ip: Ip; goodsCount: number; cardsCount: number }) {
  return (
    <ActionTile
      eyebrow="떠들어요 · 팬 커뮤니티"
      title="팬덤 채널"
      color="var(--pink)"
      cta={
        <Link className="btn btn-ghost" href={hrefFor('community')} style={{ width: '100%' }}>
          팬덤 들어가기 <Icon name="chat" size={16} />
        </Link>
      }
    >
      <div className="row" style={{ alignItems: 'flex-start', gap: 12 }}>
        <span style={{ width: 34, height: 34, borderRadius: 99, background: ip.v.color, boxShadow: `0 0 22px -6px ${ip.v.color}`, flex: '0 0 auto' }} />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 700 }}>#{ip.title} 팬덤</div>
          <p className="muted" style={{ fontSize: 13.5, marginTop: 7 }}>
            굿즈 인증, 카드 결과, 이벤트 후기를 같은 IP 팬들과 나누는 커뮤니티로 이동합니다.
          </p>
          <div className="wrapgap" style={{ marginTop: 12 }}>
            <span className="tag">팬 {compactNumber(ip.fans)}</span>
            <span className="tag">굿즈 {goodsCount}</span>
            <span className="tag">카드 {cardsCount}</span>
          </div>
        </div>
      </div>
    </ActionTile>
  );
}

export function Home({ catalog }: { catalog: CatalogSnapshot }) {
  const { add } = useCart();
  const [selectedIpId, setSelectedIpId] = useState<string | null>(null);
  const [addedGoodId, setAddedGoodId] = useState<string | null>(null);
  const world = useMemo(() => buildHomeIpWorld(catalog, selectedIpId), [catalog, selectedIpId]);
  const selectedIp = world.selectedIp;

  const selectedGoods = selectedIp ? catalog.goods.filter((good) => good.ip === selectedIp.id) : [];
  const selectedCards = selectedIp ? catalog.cards.filter((card) => card.ip === selectedIp.id) : [];
  const selectedEvents = selectedIp ? catalog.events.filter((event) => event.ip === selectedIp.id) : [];

  if (!selectedIp) {
    return (
      <div className="screen">
        <div className="wrap" style={{ paddingTop: 48, paddingBottom: 80 }}>
          <Empty icon="ip" text="등록된 IP가 아직 없습니다" sub="Supabase 카탈로그 seed 또는 admin 등록 후 홈에 공개됩니다." />
        </div>
      </div>
    );
  }

  const stats = {
    ips: catalog.ips.length,
    goods: catalog.goods.length,
    cards: catalog.cards.length,
    events: catalog.events.length,
  };

  const onAddGood = () => {
    if (!world.representativeGood || world.representativeGood.stock === 'soldout') return;
    add();
    setAddedGoodId(world.representativeGood.id);
    window.setTimeout(() => setAddedGoodId(null), 1100);
  };

  return (
    <div className="screen">
      <div className="wrap">
        <SelectedIpHero selectedIp={selectedIp} selectableIps={world.selectableIps} onSelect={setSelectedIpId} stats={stats} />
      </div>

      <section className="section">
        <div className="wrap">
          <div className="eyebrow" style={{ marginBottom: 16 }}>내 최애 · {selectedIp.v.label}</div>
          <h2 className="h-xl"><span style={{ color: selectedIp.v.color }}>{selectedIp.title}</span>, 여기서 다 해요</h2>
          <p className="muted" style={{ marginTop: 14, maxWidth: 560 }}>
            {selectedIp.tagline} — 굿즈부터 한정 카드, 팝업, 팬들까지 한 흐름으로.
          </p>

          <div className="home-world-layout">
            <IpFeatureCard
              ip={selectedIp}
              goodsCount={selectedGoods.length}
              cardsCount={selectedCards.length}
              eventsCount={selectedEvents.length}
            />
            <div className="home-action-grid">
              <GoodsTile good={world.representativeGood} added={addedGoodId === world.representativeGood?.id} onAdd={onAddGood} />
              <CardTile card={world.representativeCard} ip={selectedIp} />
              <EventTile event={world.representativeEvent} />
              <CommunityTile ip={selectedIp} goodsCount={selectedGoods.length} cardsCount={selectedCards.length} />
            </div>
          </div>
        </div>
      </section>

      <section className="section" style={{ background: 'var(--bg-2)', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
        <div className="wrap">
          <div className="between" style={{ alignItems: 'flex-end', gap: 20, flexWrap: 'wrap' }}>
            <div>
              <div className="eyebrow" style={{ marginBottom: 16 }}>Official IPs</div>
              <h2 className="h-lg">{selectedIp.title} 말고도, <span className="holo-text">{plainNumber(catalog.ips.length)}개 공식 IP</span>가 있어요</h2>
              <div className="wrapgap" style={{ marginTop: 20 }}>
                {catalog.verticals.map((vertical) => (
                  <span key={vertical.key} className="chip" style={{ pointerEvents: 'none' }}>
                    <span style={{ width: 8, height: 8, borderRadius: 99, background: vertical.color }} />
                    {vertical.label}
                  </span>
                ))}
              </div>
            </div>
            <Link className="btn btn-holo" href={hrefFor('iphub')}>
              전체 IP 보기 <Icon name="arrow" size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
