'use client';

import { useState } from 'react';
import { DATA } from '@/lib/data';
import { Icon } from '@/components/ui/Icon';
import { Empty } from '@/components/ui/Empty';
import { useGo } from '@/components/shell/useGo';

export function Search() {
  const go = useGo();
  const [q, setQ] = useState('');
  const popular = ['화산강림', '한정굿즈', '호시나 미오', 'LUMEN', '포토카드', '버튜버'];

  const ipResults = DATA.IPS.filter((i) => i.title.includes(q)).map((i) => ({ _g: false as const, id: i.id, label: i.title, bg: i.bg }));
  const goodsResults = DATA.GOODS.filter((g) => g.name.includes(q)).map((g) => ({ _g: true as const, id: g.id, label: g.name, bg: g.img }));
  const results = q ? [...ipResults, ...goodsResults] : [];

  return (
    <div className="screen">
      <div className="wrap" style={{ paddingTop: 64, paddingBottom: 80, maxWidth: 760 }}>
        <h1 className="h-xl">검색</h1>
        <div className="row" style={{ marginTop: 22, gap: 10 }}>
          <div className="row" style={{ flex: 1, gap: 12, height: 56, padding: '0 20px', borderRadius: 99, background: 'var(--surface)', border: '1px solid var(--line-2)' }}>
            <Icon name="search" size={20} style={{ color: 'var(--faint)' }} />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="IP, 굿즈, 카드, 팝업 검색…"
              style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: 'var(--text)', fontSize: 16, fontFamily: 'inherit' }}
            />
          </div>
          <button className="btn btn-holo" style={{ height: 56 }}>검색</button>
        </div>

        {!q && (
          <div className="card" style={{ marginTop: 24, padding: '22px 24px', borderRadius: 'var(--r)' }}>
            <div className="faint mono" style={{ fontSize: 11, letterSpacing: '.1em', marginBottom: 16 }}>이주의 인기 검색</div>
            <div className="col" style={{ gap: 4 }}>
              {popular.map((t, i) => (
                <button key={t} className="row" style={{ gap: 16, padding: '12px 6px', textAlign: 'left' }} onClick={() => setQ(t)}>
                  <span className="mono" style={{ fontWeight: 700, color: i < 3 ? 'var(--violet-2)' : 'var(--faint)', width: 18 }}>{i + 1}</span>
                  <span style={{ fontWeight: 600 }}>{t}</span>
                  {i < 3 && <Icon name="fire" size={15} style={{ color: 'var(--pink)' }} />}
                </button>
              ))}
            </div>
          </div>
        )}
        {q && (
          <div className="col" style={{ gap: 10, marginTop: 24 }}>
            <div className="faint mono" style={{ fontSize: 12 }}>{results.length}건의 결과</div>
            {results.map((r) => (
              <button key={(r._g ? 'g' : 'i') + r.id} className="card row" style={{ padding: 14, gap: 14, textAlign: 'left' }} onClick={() => (r._g ? go('shop') : go('ip', r.id))}>
                <div style={{ width: 52, height: 52, borderRadius: 12, background: r.bg, flex: '0 0 auto' }} />
                <div>
                  <div style={{ fontWeight: 600 }}>{r.label}</div>
                  <div className="faint mono" style={{ fontSize: 11, marginTop: 3 }}>{r._g ? '굿즈' : 'IP'}</div>
                </div>
                <Icon name="arrow" size={18} style={{ marginLeft: 'auto', color: 'var(--faint)' }} />
              </button>
            ))}
            {!results.length && <Empty icon="search" text={`'${q}' 검색 결과가 없어요`} sub="다른 키워드로 검색해보세요" />}
          </div>
        )}
      </div>
    </div>
  );
}
