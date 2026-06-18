'use client';

import { usePathname } from 'next/navigation';
import { useGo } from './useGo';

const cols: { h: string; items: [string, string | null][] }[] = [
  { h: '서비스', items: [['굿즈샵', 'shop'], ['IP 허브', 'iphub'], ['팝업·티케팅', 'events'], ['커뮤니티', 'community']] },
  { h: '카드', items: [['수집 바인더', 'binder'], ['카드 교환', 'exchange'], ['애프터마켓', 'market']] },
  { h: '회사', items: [['이용약관', null], ['개인정보처리방침', null], ['문의하기', null]] },
];

export function SiteFooter() {
  const pathname = usePathname();
  const go = useGo();
  if (pathname === '/login') return null;

  return (
    <footer style={{ borderTop: '1px solid var(--line)', background: 'var(--bg-2)', padding: '56px 0 40px', position: 'relative', zIndex: 2 }}>
      <div className="wrap" style={{ display: 'grid', gap: 36, gridTemplateColumns: '1.4fr 1fr 1fr 1fr' }}>
        <div>
          <div className="brand" style={{ fontSize: 26 }}><span className="dot" />ICONS</div>
          <p className="muted" style={{ marginTop: 14, maxWidth: 280, fontSize: 14 }}>
            서브컬처 팬덤의 모든 활동을 가치 있는 데이터로 자산화하는 디지털 팬덤 허브 플랫폼.
          </p>
          <div className="wrapgap" style={{ marginTop: 18 }}>
            <span className="tag">K-POP</span><span className="tag">ANIME</span>
            <span className="tag">VTUBER</span><span className="tag">WEBTOON</span>
          </div>
        </div>
        {cols.map((c) => (
          <div key={c.h} className="col" style={{ gap: 12 }}>
            <div className="mono" style={{ fontSize: 12, letterSpacing: '.12em', color: 'var(--faint)', textTransform: 'uppercase' }}>{c.h}</div>
            {c.items.map(([t, r]) => (
              <a key={t} className="muted" style={{ fontSize: 14, cursor: 'pointer' }} onClick={() => r && go(r)}>{t}</a>
            ))}
          </div>
        ))}
      </div>
      <div className="wrap between" style={{ marginTop: 44, paddingTop: 24, borderTop: '1px solid var(--line)' }}>
        <span className="faint mono" style={{ fontSize: 12 }}>© 2026 ICONS Inc. All rights reserved.</span>
        <span className="faint mono" style={{ fontSize: 12 }}>made for fandoms ✦</span>
      </div>
    </footer>
  );
}
