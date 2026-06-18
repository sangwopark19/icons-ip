import Link from 'next/link';
import { DATA, type Good, type Stock } from '@/lib/data';
import { Poster } from './Poster';

const STOCK_LABEL: Record<Stock, string | null> = { low: '품절임박', soldout: '품절', ok: null };

export function GoodsCard({ g, href = '/shop' }: { g: Good; href?: string }) {
  const ip = DATA.ipById(g.ip);
  const stockLabel = STOCK_LABEL[g.stock];
  return (
    <Link className="card lift" href={href} style={{ display: 'block', padding: 0, overflow: 'hidden', textAlign: 'left', cursor: 'pointer' }}>
      <Poster bg={g.img} glyph={ip?.glyph} ratio="1 / 1" radius={0}>
        <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 4, display: 'flex', gap: 6 }}>
          {g.badge && <span className="tag" style={{ color: '#0A0813', background: 'var(--lime)', border: 'none', fontWeight: 700 }}>{g.badge}</span>}
          {stockLabel && (
            <span className="tag" style={{ color: '#fff', background: g.stock === 'soldout' ? 'rgba(0,0,0,.6)' : 'var(--pink)', border: 'none' }}>
              {stockLabel}
            </span>
          )}
        </div>
      </Poster>
      <div style={{ padding: '14px 15px 16px' }}>
        <div className="mono" style={{ fontSize: 11, color: 'var(--faint)' }}>{ip?.title} · {g.type}</div>
        <div style={{ fontWeight: 600, fontSize: 14, marginTop: 5, lineHeight: 1.3, minHeight: 36 }}>{g.name}</div>
        <div style={{ fontWeight: 700, fontSize: 16, marginTop: 8, fontFamily: 'var(--ff-display)' }}>{DATA.krw(g.price)}</div>
      </div>
    </Link>
  );
}
