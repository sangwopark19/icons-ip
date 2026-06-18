'use client';

import { useState } from 'react';
import { DATA, type Card } from '@/lib/data';
import { Icon } from '@/components/ui/Icon';
import { Collectible } from '@/components/ui/Collectible';
import { RarityBadge } from '@/components/ui/RarityBadge';
import { Modal } from '@/components/ui/Modal';
import { Empty } from '@/components/ui/Empty';
import { useGo, type Go } from '@/components/shell/useGo';

function CardDetail({ card, onClose, go }: { card: Card; onClose: () => void; go: Go }) {
  const info = DATA.RARITY[card.rarity];
  const ip = DATA.ipById(card.ip)!;
  const stats: [string, string][] = [
    ['시세', '₩' + (info.foil ? '48,000' : '12,000')],
    ['보유 팬', (120 - +card.no.slice(0, 3)).toString()],
    ['발행량', card.no.split('/')[1]],
  ];
  return (
    <Modal onClose={onClose}>
      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 28, alignItems: 'center' }} className="cd-grid">
        <div style={{ justifySelf: 'center' }}>
          <Collectible card={{ ...card, owned: true }} ip={ip} size="lg" />
        </div>
        <div>
          <div className="row" style={{ gap: 8 }}>
            <RarityBadge r={card.rarity} />
            <span className="tag" style={{ borderColor: ip.v.color, color: '#fff' }}>{ip.v.label}</span>
          </div>
          <h2 className="h-lg" style={{ marginTop: 14 }}>{card.name}</h2>
          <div className="mono muted" style={{ marginTop: 6 }}>{ip.title} · No.{card.no}</div>
          <p className="muted" style={{ marginTop: 14, fontSize: 14 }}>
            {card.owned
              ? '보유 중인 카드입니다. 교환 마켓에 등록하거나 컬렉션에 전시할 수 있어요.'
              : '아직 보유하지 않은 카드입니다. 팝업 참여 · 가챠 · 교환으로 획득할 수 있어요.'}
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
            {card.owned ? (
              <>
                <button className="btn btn-holo" onClick={() => { onClose(); go('exchange'); }}>교환 등록 <Icon name="swap" size={15} /></button>
                <button className="btn btn-ghost">전시하기</button>
              </>
            ) : (
              <button className="btn btn-holo" onClick={() => { onClose(); go('exchange'); }}>교환으로 획득 <Icon name="arrow" size={15} /></button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}

function PackOpen({ onClose }: { onClose: () => void }) {
  const [stage, setStage] = useState<'ready' | 'opening' | 'reveal'>('ready');
  const pulled = DATA.CARDS[8]; // HOLO
  const pulledIp = DATA.ipById(pulled.ip)!;
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
            <p className="muted" style={{ marginTop: 8 }}>SR 이상 확정 · HOLO 확률 3%</p>
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
            <p className="mono" style={{ color: 'var(--lime)', fontWeight: 700, letterSpacing: '.1em', marginBottom: 18 }}>✦ HOLO 카드 획득! ✦</p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <Collectible card={{ ...pulled, owned: true }} ip={pulledIp} size="lg" />
            </div>
            <div style={{ fontWeight: 700, fontSize: 18, marginTop: 18 }}>{pulled.name}</div>
            <div className="mono muted" style={{ fontSize: 13, marginTop: 4 }}>{pulledIp.title} · No.{pulled.no}</div>
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

export function Binder() {
  const go = useGo();
  const [filter, setFilter] = useState<'all' | 'owned' | 'wish'>('all');
  const [rarF, setRarF] = useState('all');
  const [detail, setDetail] = useState<Card | null>(null);
  const [packOpen, setPackOpen] = useState(false);

  let cards = DATA.CARDS;
  if (filter === 'owned') cards = cards.filter((c) => c.owned);
  if (filter === 'wish') cards = cards.filter((c) => !c.owned);
  if (rarF !== 'all') cards = cards.filter((c) => c.rarity === rarF);

  const owned = DATA.CARDS.filter((c) => c.owned).length;
  const total = DATA.CARDS.length;
  const pct = Math.round((owned / total) * 100);

  const stats: [string | number, string][] = [
    [owned, '보유 카드'],
    [total - owned, '미보유'],
    ['7', '보유 IP'],
    ['HOLO ×2', '최고 등급'],
  ];

  return (
    <div className="screen">
      <div className="wrap" style={{ paddingTop: 48, paddingBottom: 80 }}>
        {/* header / collection progress */}
        <div className="card mobile-stack" style={{ padding: '28px 30px', display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 30, alignItems: 'center', borderRadius: 'var(--r-lg)' }}>
          <div>
            <div className="eyebrow" style={{ marginBottom: 14 }}>My Binder</div>
            <h1 className="h-lg">수집 바인더</h1>
            <p className="muted" style={{ marginTop: 8 }}>참여로 모은 IP 기념 카드를 모아보세요. 컬렉션을 완성하면 한정 보상이 열립니다.</p>
            <div className="row" style={{ gap: 'clamp(18px,4vw,36px)', marginTop: 20, flexWrap: 'wrap' }}>
              {stats.map(([n, l]) => (
                <div key={l} className="col">
                  <span className="h-lg holo-text" style={{ fontFamily: 'var(--ff-display)' }}>{n}</span>
                  <span className="faint mono" style={{ fontSize: 11 }}>{l}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="col" style={{ gap: 14 }}>
            <div className="between">
              <span className="mono" style={{ fontSize: 13 }}>컬렉션 달성률</span>
              <span className="mono holo-text" style={{ fontWeight: 700 }}>{pct}%</span>
            </div>
            <div style={{ height: 12, borderRadius: 99, background: 'var(--surface-2)', overflow: 'hidden', border: '1px solid var(--line)' }}>
              <div style={{ height: '100%', width: pct + '%', background: 'var(--holo)', backgroundSize: '200%', animation: 'holoShift 6s ease infinite' }} />
            </div>
            <button className="btn btn-holo" style={{ marginTop: 8 }} onClick={() => setPackOpen(true)}>
              <Icon name="spark" size={17} fill /> 데일리 팩 열기
            </button>
            <div className="faint mono" style={{ fontSize: 11, textAlign: 'center' }}>오늘 1회 무료 · 다음 팩까지 23:41:08</div>
          </div>
        </div>

        {/* filters */}
        <div className="between" style={{ marginTop: 30, flexWrap: 'wrap', gap: 14 }}>
          <div className="wrapgap">
            {([['all', '전체'], ['owned', '보유'], ['wish', '미보유']] as const).map(([k, l]) => (
              <button key={k} className={'chip' + (filter === k ? ' on' : '')} onClick={() => setFilter(k)}>{l}</button>
            ))}
          </div>
          <div className="wrapgap">
            <button className={'chip btn-sm' + (rarF === 'all' ? ' on' : '')} onClick={() => setRarF('all')}>전체 등급</button>
            {Object.keys(DATA.RARITY).map((r) => (
              <button
                key={r}
                className={'chip btn-sm' + (rarF === r ? ' on' : '')}
                onClick={() => setRarF(r)}
                style={rarF === r ? { background: DATA.RARITY[r as keyof typeof DATA.RARITY].color, borderColor: DATA.RARITY[r as keyof typeof DATA.RARITY].color, color: '#0A0813', fontWeight: 700 } : {}}
              >
                {DATA.RARITY[r as keyof typeof DATA.RARITY].label}
              </button>
            ))}
          </div>
        </div>

        {/* binder grid */}
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', marginTop: 24, justifyItems: 'center', rowGap: 26 }}>
          {cards.map((c) => <Collectible key={c.id} card={c} ip={DATA.ipById(c.ip)} onClick={() => setDetail(c)} />)}
        </div>
        {!cards.length && <Empty icon="card" text="조건에 맞는 카드가 없어요" />}

        <div className="between card" style={{ marginTop: 34, padding: '22px 26px', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 17 }}>중복 카드가 있나요?</div>
            <div className="muted" style={{ fontSize: 14, marginTop: 4 }}>교환 마켓에서 다른 팬과 직거래하거나 경매에 올려보세요.</div>
          </div>
          <button className="btn btn-ghost" onClick={() => go('exchange')}>교환 마켓으로 <Icon name="swap" size={16} /></button>
        </div>
      </div>

      {detail && <CardDetail card={detail} onClose={() => setDetail(null)} go={go} />}
      {packOpen && <PackOpen onClose={() => setPackOpen(false)} />}
    </div>
  );
}
