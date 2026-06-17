'use client';

import { useState } from 'react';
import { DATA, type FandomEvent } from '@/lib/data';
import { Icon } from '@/components/ui/Icon';
import { Collectible } from '@/components/ui/Collectible';
import { GoodsCard } from '@/components/ui/GoodsCard';
import { FeedPreview } from '@/components/ui/FeedPreview';
import { Empty } from '@/components/ui/Empty';
import { useGo, type Go } from '@/components/shell/useGo';

function EventRow({ e, go }: { e: FandomEvent; go: Go }) {
  return (
    <button className="card" onClick={() => go('events')} style={{ padding: 14, display: 'flex', gap: 16, textAlign: 'left', cursor: 'pointer', alignItems: 'center' }}>
      <div style={{ width: 108, height: 68, borderRadius: 12, background: e.img, flex: '0 0 auto', position: 'relative', overflow: 'hidden' }}>
        <div className="sheen" />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="row" style={{ gap: 6 }}>
          <span className="tag" style={{ color: '#0A0813', background: e.accent, border: 'none', fontWeight: 700 }}>{e.mode}</span>
          <span className="tag">{e.status}</span>
        </div>
        <div style={{ fontWeight: 700, fontSize: 15, marginTop: 8 }}>{e.title}</div>
        <div className="muted row" style={{ gap: 14, fontSize: 12.5, marginTop: 6 }}>
          <span className="row" style={{ gap: 5 }}><Icon name="event" size={13} /> {e.date}</span>
          <span className="row" style={{ gap: 5 }}><Icon name="globe" size={13} /> {e.loc}</span>
        </div>
      </div>
      <Icon name="arrow" size={18} style={{ color: 'var(--faint)' }} />
    </button>
  );
}

export function IpDetail({ id }: { id: string }) {
  const go = useGo();
  const ip = DATA.ipById(id) || DATA.IPS[0];
  const [tab, setTab] = useState('굿즈');
  const goods = DATA.GOODS.filter((g) => g.ip === ip.id);
  const cards = DATA.CARDS.filter((c) => c.ip === ip.id);
  const events = DATA.EVENTS.filter((e) => e.ip === ip.id);
  const tabs: [string, number | ''][] = [['굿즈', goods.length], ['카드', cards.length], ['팝업', events.length], ['커뮤니티', '']];

  return (
    <div className="screen">
      {/* banner */}
      <div style={{ position: 'relative', height: 340, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: ip.bg }} />
        <div className="sheen" />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(transparent 30%, var(--bg) 96%)' }} />
        <div className="glyph" style={{ fontSize: 'clamp(60px,14vw,140px)', opacity: 0.16, color: '#fff' }}>{ip.glyph}</div>
      </div>
      <div className="wrap" style={{ marginTop: -110, position: 'relative', zIndex: 3, paddingBottom: 80 }}>
        <button className="btn btn-ghost btn-sm" onClick={() => go('iphub')} style={{ marginBottom: 20 }}>
          <Icon name="arrow" size={14} style={{ transform: 'rotate(180deg)' }} /> IP 허브
        </button>
        <div className="between" style={{ alignItems: 'flex-end', flexWrap: 'wrap', gap: 20 }}>
          <div>
            <span className="tag" style={{ borderColor: ip.v.color, color: '#fff' }}>{ip.v.label} · {ip.sub}</span>
            <h1 className="h-xl" style={{ marginTop: 14 }}>{ip.title}</h1>
            <p style={{ fontSize: 17, fontWeight: 600, marginTop: 8 }}>{ip.tagline}</p>
            <p className="muted" style={{ marginTop: 10, maxWidth: 560 }}>{ip.synopsis}</p>
          </div>
          <div className="row" style={{ gap: 10 }}>
            <button className="btn btn-holo">팬덤 가입 <Icon name="plus" size={15} /></button>
            <button className="btn btn-ghost">알림 받기</button>
          </div>
        </div>
        <div className="row" style={{ gap: 'clamp(20px,4vw,40px)', marginTop: 28, flexWrap: 'wrap' }}>
          {([[(ip.fans / 1000).toFixed(1) + 'K', '팬'], [ip.goods, '굿즈'], [ip.cards, '카드'], [events.length, '이벤트']] as const).map(([n, l]) => (
            <div key={l} className="col">
              <span className="h-lg" style={{ fontFamily: 'var(--ff-display)', color: ip.v.color }}>{n}</span>
              <span className="faint mono" style={{ fontSize: 11 }}>{l}</span>
            </div>
          ))}
        </div>

        <div className="wrapgap" style={{ margin: '36px 0 26px', borderBottom: '1px solid var(--line)', paddingBottom: 0, gap: 4 }}>
          {tabs.map(([t, n]) => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: '12px 18px', fontWeight: 600, fontSize: 15, position: 'relative', color: tab === t ? 'var(--text)' : 'var(--dim)' }}>
              {t} {n !== '' && <span className="mono faint" style={{ fontSize: 12 }}>{n}</span>}
              {tab === t && <span style={{ position: 'absolute', left: 14, right: 14, bottom: -1, height: 2, background: 'var(--holo)' }} />}
            </button>
          ))}
        </div>

        {tab === '굿즈' && (
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
            {goods.map((g) => <GoodsCard key={g.id} g={g} go={go} />)}
          </div>
        )}
        {tab === '카드' && (
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', justifyItems: 'center' }}>
            {cards.map((c) => <Collectible key={c.id} card={c} onClick={() => go('binder')} />)}
          </div>
        )}
        {tab === '팝업' && (
          <div className="col" style={{ gap: 14 }}>
            {events.length ? events.map((e) => <EventRow key={e.id} e={e} go={go} />) : <Empty icon="event" text="예정된 이벤트가 없어요" />}
          </div>
        )}
        {tab === '커뮤니티' && (
          <div className="col" style={{ gap: 14 }}>
            {DATA.POSTS.slice(0, 3).map((p) => <FeedPreview key={p.id} p={p} go={go} />)}
          </div>
        )}
      </div>
    </div>
  );
}
