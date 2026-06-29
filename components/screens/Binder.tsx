'use client';

import { useState } from 'react';
import type { CatalogSnapshot } from '@/lib/catalog';
import type { Card, Ip } from '@/lib/data';
import { RARITY_META, type Rarity, type RarityKey } from '@/lib/rarity';
import { Icon } from '@/components/ui/Icon';
import { Collectible } from '@/components/ui/Collectible';
import { RarityBadge } from '@/components/ui/RarityBadge';
import { Modal } from '@/components/ui/Modal';
import { Empty } from '@/components/ui/Empty';
import { useGo, type Go } from '@/components/shell/useGo';

function CardDetail({
  card,
  ip,
  isMockCatalog,
  onClose,
  go,
}: {
  card: Card;
  ip?: Ip;
  isMockCatalog: boolean;
  onClose: () => void;
  go: Go;
}) {
  const info = RARITY_META[card.rarity];
  const noMatch = /^(\d+)\/(\d+)$/.exec(card.no);
  const stats: [string, string][] = isMockCatalog
    ? [
        ['시세', '₩' + (info.foil ? '48,000' : '12,000')],
        ['보유 팬', noMatch ? (120 - Number(noMatch[1])).toString() : '-'],
        ['발행량', noMatch?.[2] ?? '-'],
      ]
    : [
        ['등급', info.label],
        ['번호', card.no || '-'],
        ['IP', ip?.title ?? 'IP 미지정'],
      ];
  const displayCard = isMockCatalog ? card : { ...card, owned: true };

  return (
    <Modal onClose={onClose}>
      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 28, alignItems: 'center' }} className="cd-grid">
        <div style={{ justifySelf: 'center' }}>
          <Collectible card={displayCard} ip={ip} size="lg" />
        </div>
        <div>
          <div className="row" style={{ gap: 8 }}>
            <RarityBadge r={card.rarity} />
            {ip && <span className="tag" style={{ borderColor: ip.v.color, color: '#fff' }}>{ip.v.label}</span>}
          </div>
          <h2 className="h-lg" style={{ marginTop: 14 }}>{card.name}</h2>
          <div className="mono muted" style={{ marginTop: 6 }}>{ip?.title ?? 'IP 미지정'} · No.{card.no}</div>
          <p className="muted" style={{ marginTop: 14, fontSize: 14 }}>
            {isMockCatalog
              ? card.owned
                ? '보유 중인 카드입니다. 교환 마켓에 등록하거나 컬렉션에 전시할 수 있어요.'
                : '아직 보유하지 않은 카드입니다. 팝업 참여 · 가챠 · 교환으로 획득할 수 있어요.'
              : '공개 카드풀에 등록된 카드입니다.'}
          </p>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginTop: 20 }}>
            {stats.map(([l, v]) => (
              <div key={l} className="card" style={{ padding: '12px 14px', borderRadius: 14 }}>
                <div className="faint mono" style={{ fontSize: 10 }}>{l}</div>
                <div style={{ fontWeight: 700, marginTop: 4, fontFamily: 'var(--ff-display)' }}>{v}</div>
              </div>
            ))}
          </div>
          <div className="row" style={{ gap: 10, marginTop: 22, flexWrap: 'wrap' }}>
            {isMockCatalog ? (
              card.owned ? (
                <>
                  <button className="btn btn-holo" onClick={() => { onClose(); go('exchange'); }}>교환 등록 <Icon name="swap" size={15} /></button>
                  <button className="btn btn-ghost">전시하기</button>
                </>
              ) : (
                <button className="btn btn-holo" onClick={() => { onClose(); go('exchange'); }}>교환으로 획득 <Icon name="arrow" size={15} /></button>
              )
            ) : (
              <button className="btn btn-ghost" disabled>보유 연동 준비 중</button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}

function PackOpen({ card, ip, onClose }: { card: Card; ip?: Ip; onClose: () => void }) {
  const [stage, setStage] = useState<'ready' | 'opening' | 'reveal'>('ready');
  const open = () => {
    setStage('opening');
    setTimeout(() => setStage('reveal'), 1300);
  };
  return (
    <Modal onClose={onClose} narrow>
      <div style={{ textAlign: 'center', padding: '10px 4px' }}>
        {stage === 'ready' && (
          <div className="rise">
            <div
              style={{
                width: 200,
                height: 268,
                margin: '0 auto',
                borderRadius: 20,
                background: 'var(--holo)',
                backgroundSize: '200%',
                animation: 'holoShift 4s ease infinite',
                display: 'grid',
                placeItems: 'center',
                boxShadow: 'var(--glow-v)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div className="sheen" />
              <div style={{ fontFamily: 'var(--ff-display)', fontWeight: 700, fontSize: 26, color: '#fff', textShadow: '0 2px 14px rgba(0,0,0,.4)' }}>ICONS<br />PACK</div>
            </div>
            <h2 className="h-lg" style={{ marginTop: 24 }}>데일리 카드 팩</h2>
            <p className="muted" style={{ marginTop: 8 }}>데모 팩 · 실제 충전금은 소비되지 않아요</p>
            <button className="btn btn-holo" style={{ marginTop: 20 }} onClick={open}><Icon name="spark" size={16} fill /> 팩 열기</button>
          </div>
        )}
        {stage === 'opening' && (
          <div style={{ padding: '40px 0' }}>
            <div
              style={{
                width: 200,
                height: 268,
                margin: '0 auto',
                borderRadius: 20,
                background: 'var(--holo)',
                backgroundSize: '200%',
                animation: 'holoShift 1s linear infinite, shake .25s ease infinite',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <div style={{ fontFamily: 'var(--ff-display)', fontWeight: 700, fontSize: 40, color: '#fff' }}>✦</div>
            </div>
            <p className="mono holo-text" style={{ marginTop: 24, fontWeight: 700, letterSpacing: '.1em' }}>OPENING...</p>
          </div>
        )}
        {stage === 'reveal' && (
          <div className="rise">
            <p className="mono" style={{ color: 'var(--lime)', fontWeight: 700, letterSpacing: '.1em', marginBottom: 18 }}>✦ {RARITY_META[card.rarity].label} 카드 획득! ✦</p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <Collectible card={{ ...card, owned: true }} ip={ip} size="lg" />
            </div>
            <div style={{ fontWeight: 700, fontSize: 18, marginTop: 18 }}>{card.name}</div>
            <div className="mono muted" style={{ fontSize: 13, marginTop: 4 }}>{ip?.title ?? 'IP 미지정'} · No.{card.no}</div>
            <div className="row" style={{ gap: 10, justifyContent: 'center', marginTop: 22 }}>
              <button className="btn btn-primary" onClick={onClose}>바인더에 보관</button>
              <button className="btn btn-ghost" onClick={() => setStage('ready')}>한 번 더</button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

/** 등급이 높을수록 희귀 — N→R→SR→SSR→HOLO 시각 위계. SSR·HOLO는 포일. */
const RARITY_ORDER = Object.entries(RARITY_META) as [RarityKey, Rarity][];

/** 예시 확률 공시 — 실제 값은 가챠 연동(카드풀 확률 공시) 시 대체된다. */
const GACHA_SAMPLE_ODDS: Record<RarityKey, string> = {
  N: '50%',
  R: '30%',
  SR: '14%',
  SSR: '5%',
  HOLO: '1%',
};

function RarityLadder() {
  return (
    <section style={{ marginTop: 34 }}>
      <div className="between" style={{ alignItems: 'baseline', flexWrap: 'wrap', gap: 10 }}>
        <span className="mono" style={{ fontSize: 11, letterSpacing: '.12em', color: 'var(--violet-2)', textTransform: 'uppercase' }}>등급 위계</span>
        <span className="faint mono" style={{ fontSize: 11.5 }}>희귀할수록 오른쪽 · SSR·HOLO는 포일 연출</span>
      </div>
      <div className="grid" style={{ marginTop: 14, gridTemplateColumns: 'repeat(auto-fit, minmax(96px, 1fr))', gap: 12 }}>
        {RARITY_ORDER.map(([key, info], i) => (
          <div
            key={key}
            className="card"
            style={{
              padding: '13px 14px',
              borderRadius: 14,
              borderColor: info.color,
              borderWidth: 1.5,
              background: `linear-gradient(160deg, ${info.color}1f, transparent 70%)`,
            }}
          >
            <div className="between" style={{ alignItems: 'center' }}>
              <span className="mono faint" style={{ fontSize: 10 }}>{i + 1}/{RARITY_ORDER.length}</span>
              {info.foil && <span className="mono" style={{ fontSize: 9.5, color: info.color, letterSpacing: '.08em' }}>FOIL</span>}
            </div>
            <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span aria-hidden="true" style={{ width: 10, height: 10, borderRadius: 3, background: info.color, boxShadow: `0 0 10px ${info.color}99`, flex: '0 0 auto' }} />
              <span style={{ fontFamily: 'var(--ff-display)', fontWeight: 700, fontSize: 18, color: info.color }}>{info.label}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function GachaEntry({ canDraw, mockMode, onDraw }: { canDraw: boolean; mockMode: boolean; onDraw: () => void }) {
  return (
    <section
      className="card"
      style={{
        marginTop: 28,
        padding: '24px 26px',
        borderRadius: 'var(--r-lg)',
        background: 'linear-gradient(150deg, rgba(139,92,255,.16), rgba(255,77,157,.10) 60%, transparent), var(--surface)',
        borderColor: 'var(--line-2)',
      }}
    >
      <div className="between" style={{ alignItems: 'flex-start', gap: 18, flexWrap: 'wrap' }}>
        <div style={{ minWidth: 0 }}>
          <span className="mono" style={{ fontSize: 11, letterSpacing: '.12em', color: 'var(--violet-2)', textTransform: 'uppercase' }}>카드풀 가챠</span>
          <h2 className="h-lg" style={{ marginTop: 10 }}>충전금으로 카드 뽑기</h2>
          <p className="muted" style={{ marginTop: 8, maxWidth: 460, fontSize: 14 }}>
            카드풀에서 무작위로 디지털 카드를 획득합니다. 충전금으로 단챠·연챠를 돌리고, 정해진 횟수에 도달하면 천장으로 최고 등급이 보장돼요.
          </p>
        </div>
        <span className="tag" style={{ color: 'var(--amber)', borderColor: 'var(--amber)', whiteSpace: 'nowrap' }}>가챠 연동 준비 중 · 데모</span>
      </div>

      {/* 등급 구성 미리보기 — 실제 확률 공시는 가챠 backend의 DB 값으로 대체 */}
      <div style={{ marginTop: 18 }}>
        <div className="faint mono" style={{ fontSize: 10.5, letterSpacing: '.04em' }}>등급 구성 미리보기 · 실제 확률 공시는 가챠 연동 시 적용</div>
        <div className="wrapgap" style={{ marginTop: 10 }}>
          {RARITY_ORDER.map(([key, info]) => (
            <span
              key={key}
              className="mono"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 11.5,
                padding: '5px 10px',
                borderRadius: 99,
                border: `1px solid ${info.color}66`,
                color: 'var(--text)',
              }}
            >
              <span aria-hidden="true" style={{ width: 7, height: 7, borderRadius: 99, background: info.color }} />
              {info.label} <span className="faint">{GACHA_SAMPLE_ODDS[key]}</span>
            </span>
          ))}
        </div>
      </div>

      <div className="row" style={{ gap: 12, marginTop: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        {canDraw ? (
          <button className="btn btn-holo" onClick={onDraw}><Icon name="spark" size={16} fill /> 가챠 미리보기</button>
        ) : (
          <button className="btn btn-ghost" disabled>{mockMode ? '카드 등록 후 가챠' : '로그인 후 가챠'}</button>
        )}
        <span className="faint mono" style={{ fontSize: 11 }}>
          {canDraw ? '데일리 팩 데모 1회 · 실제 충전금은 소비되지 않아요' : '카드풀 공개 탐색은 로그인 없이 가능해요'}
        </span>
      </div>
    </section>
  );
}

export function Binder({ catalog }: { catalog: Pick<CatalogSnapshot, 'source' | 'ips' | 'cards'> }) {
  const go = useGo();
  const [filter, setFilter] = useState<'all' | 'owned' | 'wish'>('all');
  const [rarF, setRarF] = useState('all');
  const [detail, setDetail] = useState<Card | null>(null);
  const [packOpen, setPackOpen] = useState(false);
  const isMockCatalog = catalog.source === 'mock';
  const ipsById = new Map(catalog.ips.map((ip) => [ip.id, ip]));
  const featuredCard = isMockCatalog ? catalog.cards.find((c) => c.rarity === 'HOLO') ?? catalog.cards[0] : null;

  let cards = catalog.cards;
  if (isMockCatalog && filter === 'owned') cards = cards.filter((c) => c.owned);
  if (isMockCatalog && filter === 'wish') cards = cards.filter((c) => !c.owned);
  if (rarF !== 'all') cards = cards.filter((c) => c.rarity === rarF);

  const owned = isMockCatalog ? catalog.cards.filter((c) => c.owned).length : 0;
  const total = catalog.cards.length;
  const pct = isMockCatalog && total ? Math.round((owned / total) * 100) : 0;
  const ipCount = new Set(catalog.cards.map((c) => c.ip)).size;
  const holoCount = catalog.cards.filter((c) => c.rarity === 'HOLO').length;
  const ownedIpCount = isMockCatalog ? new Set(catalog.cards.filter((c) => c.owned).map((c) => c.ip)).size : 0;
  const ownedHoloCount = isMockCatalog ? catalog.cards.filter((c) => c.owned && c.rarity === 'HOLO').length : 0;
  const ownershipFilters = isMockCatalog
    ? ([['all', '전체'], ['owned', '보유'], ['wish', '미보유']] as const)
    : ([['all', '전체']] as const);

  const stats: [string | number, string][] = isMockCatalog
    ? [
        [owned, '보유 카드'],
        [total - owned, '미보유'],
        [ownedIpCount, '보유 IP'],
        [ownedHoloCount, 'HOLO'],
      ]
    : [
        [total, '등록 카드'],
        [ipCount, '연결 IP'],
        [holoCount, 'HOLO'],
        [RARITY_ORDER.length, '등급'],
      ];

  const canDraw = isMockCatalog && !!featuredCard;

  return (
    <div className="screen">
      <div className="wrap" style={{ paddingTop: 48, paddingBottom: 80 }}>
        {/* 세계관 헤더 — 모아요 · 수집 카드 */}
        <div className="eyebrow" style={{ marginBottom: 14 }}>모아요 · 수집 카드</div>
        <div>
          <h1 className="h-xl">{isMockCatalog ? '카드' : '카드 탐색'}</h1>
          <p className="muted" style={{ marginTop: 10, maxWidth: 540 }}>
            {isMockCatalog
              ? '가챠로 모은 수집형 디지털 카드를 바인더에 담으세요. 컬렉션을 완성하면 한정 보상이 열립니다.'
              : '공개 카드풀에 등록된 IP 기념 디지털 카드를 둘러보세요. 가챠와 보유 연동은 로그인 후 이용할 수 있어요.'}
          </p>
        </div>

        {/* stat strip */}
        <div className="row" style={{ gap: 'clamp(18px,4vw,40px)', marginTop: 22, flexWrap: 'wrap' }}>
          {stats.map(([n, l]) => (
            <div key={l} className="col">
              <span className="h-lg holo-text" style={{ fontFamily: 'var(--ff-display)' }}>{n}</span>
              <span className="faint mono" style={{ fontSize: 11 }}>{l}</span>
            </div>
          ))}
        </div>

        {/* 가챠 진입 — 획득(가챠)을 보관(바인더)과 분리 */}
        <GachaEntry canDraw={canDraw} mockMode={isMockCatalog} onDraw={() => setPackOpen(true)} />

        {/* 등급 위계 */}
        <RarityLadder />

        {/* 바인더 컬렉션 */}
        <section style={{ marginTop: 44 }}>
          <div className="between" style={{ alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h2 className="h-lg">{isMockCatalog ? '내 바인더' : '공개 카드풀'}</h2>
              <p className="muted" style={{ marginTop: 6, fontSize: 14 }}>
                {isMockCatalog ? '보유한 카드를 등급·IP별로 모아보고 도감을 채워가세요.' : '공개된 카드를 등급별로 둘러보세요.'}
              </p>
            </div>
            {isMockCatalog ? (
              <div className="col" style={{ alignItems: 'flex-end', gap: 8, minWidth: 200 }}>
                <div className="between" style={{ width: '100%' }}>
                  <span className="mono" style={{ fontSize: 12 }}>도감 달성률</span>
                  <span className="mono holo-text" style={{ fontWeight: 700 }}>{pct}%</span>
                </div>
                <div style={{ width: '100%', height: 10, borderRadius: 99, background: 'var(--surface-2)', overflow: 'hidden', border: '1px solid var(--line)' }}>
                  <div style={{ height: '100%', width: pct + '%', background: 'var(--holo)', backgroundSize: '200%', animation: 'holoShift 6s ease infinite' }} />
                </div>
                <span className="faint mono" style={{ fontSize: 11 }}>{owned} / {total}장 보유</span>
              </div>
            ) : (
              <span className="mono holo-text" style={{ fontWeight: 700 }}>{total}장 공개</span>
            )}
          </div>

          {/* filters */}
          <div className="between" style={{ marginTop: 22, flexWrap: 'wrap', gap: 14 }}>
            <div className="wrapgap" role="group" aria-label="보유 필터">
              {ownershipFilters.map(([k, l]) => (
                <button key={k} className={'chip' + (filter === k ? ' on' : '')} aria-pressed={filter === k} onClick={() => setFilter(k)}>{l}</button>
              ))}
            </div>
            <div className="wrapgap" role="group" aria-label="등급 필터">
              <button className={'chip btn-sm' + (rarF === 'all' ? ' on' : '')} aria-pressed={rarF === 'all'} onClick={() => setRarF('all')}>전체 등급</button>
              {RARITY_ORDER.map(([r, info]) => (
                <button
                  key={r}
                  className={'chip btn-sm' + (rarF === r ? ' on' : '')}
                  aria-pressed={rarF === r}
                  onClick={() => setRarF(r)}
                  style={rarF === r ? { background: info.color, borderColor: info.color, color: '#0A0813', fontWeight: 700 } : {}}
                >
                  {info.label}
                </button>
              ))}
            </div>
          </div>

          {/* binder grid */}
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', marginTop: 24, justifyItems: 'center', rowGap: 26 }}>
            {cards.map((c) => <Collectible key={c.id} card={isMockCatalog ? c : { ...c, owned: true }} ip={ipsById.get(c.ip)} onClick={() => setDetail(c)} />)}
          </div>
          {!cards.length && <Empty icon="card" text={catalog.cards.length ? '조건에 맞는 카드가 없어요' : '등록된 카드가 아직 없습니다'} sub={catalog.cards.length ? undefined : 'Supabase 카탈로그 seed 또는 admin 등록 후 바인더 탐색에 공개됩니다.'} />}
        </section>

        {isMockCatalog && (
          <div className="between card" style={{ marginTop: 34, padding: '22px 26px', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 17 }}>중복 카드가 있나요?</div>
              <div className="muted" style={{ fontSize: 14, marginTop: 4 }}>교환 마켓에서 다른 팬과 직거래하거나 경매에 올려보세요.</div>
            </div>
            <button className="btn btn-ghost" onClick={() => go('exchange')}>교환 마켓으로 <Icon name="swap" size={16} /></button>
          </div>
        )}
      </div>

      {detail && <CardDetail card={detail} ip={ipsById.get(detail.ip)} isMockCatalog={isMockCatalog} onClose={() => setDetail(null)} go={go} />}
      {isMockCatalog && packOpen && featuredCard && <PackOpen card={featuredCard} ip={ipsById.get(featuredCard.ip)} onClose={() => setPackOpen(false)} />}
    </div>
  );
}
