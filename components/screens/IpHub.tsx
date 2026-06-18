'use client';

import { useState, type CSSProperties } from 'react';
import { DATA, type Ip } from '@/lib/data';
import { Poster } from '@/components/ui/Poster';
import { useGo, type Go } from '@/components/shell/useGo';

function IpCard({ ip, go }: { ip: Ip; go: Go }) {
  return (
    <button className="card lift" onClick={() => go('ip', ip.id)} style={{ padding: 0, overflow: 'hidden', textAlign: 'left', cursor: 'pointer' }}>
      <Poster bg={ip.bg} glyph={ip.glyph} showGlyph={false} ratio="4 / 3" radius={0}>
        <div style={{ position: 'absolute', top: 12, left: 12, zIndex: 4 }}>
          <span className="tag" style={{ borderColor: ip.v.color, color: '#fff', background: 'rgba(0,0,0,.35)' }}>{ip.v.label}</span>
        </div>
        {ip.featured && (
          <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 4 }}>
            <span className="tag" style={{ color: '#0A0813', background: 'var(--lime)', border: 'none', fontWeight: 700 }}>FEATURED</span>
          </div>
        )}
      </Poster>
      <div style={{ padding: '16px 18px 18px' }}>
        <div className="between">
          <div style={{ fontWeight: 700, fontSize: 17 }}>{ip.title}</div>
          <span className="mono" style={{ fontSize: 11, color: ip.v.color }}>{(ip.fans / 1000).toFixed(1)}K</span>
        </div>
        <div className="faint" style={{ fontSize: 12.5, marginTop: 3 }}>{ip.sub}</div>
        <div className="muted" style={{ fontSize: 13, marginTop: 8 }}>{ip.tagline}</div>
        <div className="row" style={{ marginTop: 14, gap: 8 }}>
          <span className="tag">굿즈 {ip.goods}</span><span className="tag">카드 {ip.cards}</span>
        </div>
      </div>
    </button>
  );
}

export function IpHub() {
  const go = useGo();
  const [v, setV] = useState('all');
  const verts = [{ key: 'all', label: '전체', color: undefined as string | undefined }, ...Object.values(DATA.V)];
  const list = v === 'all' ? DATA.IPS : DATA.IPS.filter((i) => i.v.key === v);
  return (
    <div className="screen">
      <div className="wrap" style={{ paddingTop: 48 }}>
        <div className="eyebrow" style={{ marginBottom: 14 }}>IP Hub</div>
        <h1 className="h-xl">좋아하는 작품의 모든 것을, 한 곳에서</h1>
        <p className="muted" style={{ marginTop: 12, maxWidth: 560 }}>
          리디 · 카카오웹툰 · 네이버웹툰의 인기 IP부터 글로벌 앵커까지. 취향에 맞는 버티컬로 필터링해 나만의 컬렉션을 시작하세요.
        </p>
        <div className="wrapgap" style={{ margin: '28px 0 8px' }}>
          {verts.map((t) => {
            const activeStyle: CSSProperties = v === t.key && t.color ? { background: t.color, borderColor: t.color, color: '#0A0813' } : {};
            return (
              <button key={t.key} className={'chip' + (v === t.key ? ' on accent' : '')} onClick={() => setV(t.key)} style={activeStyle}>
                {t.color && <span style={{ width: 8, height: 8, borderRadius: 99, background: v === t.key ? '#0A0813' : t.color }} />}
                {t.label}
              </button>
            );
          })}
        </div>
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', marginTop: 24, paddingBottom: 80 }}>
          {list.map((ip) => <IpCard key={ip.id} ip={ip} go={go} />)}
        </div>
      </div>
    </div>
  );
}
