'use client';

import { useState } from 'react';
import { DATA } from '@/lib/data';
import { Icon } from '@/components/ui/Icon';
import { Poster } from '@/components/ui/Poster';

export function Market() {
  const [typeF, setTypeF] = useState('전체');
  const [sort, setSort] = useState('최신순');
  const typeOptions = Array.from(new Set(DATA.MARKET.map((item) => item.type)));
  let list = DATA.MARKET.filter((m) => typeF === '전체' || m.type === typeF);
  if (sort === '낮은 가격순') list = [...list].sort((a, b) => a.price - b.price);
  if (sort === '높은 가격순') list = [...list].sort((a, b) => b.price - a.price);

  return (
    <div className="screen">
      <div className="wrap" style={{ paddingTop: 48, paddingBottom: 80 }}>
        <div className="between" style={{ flexWrap: 'wrap', gap: 16, alignItems: 'flex-end' }}>
          <div>
            <div className="row" style={{ gap: 8 }}>
              <span className="eyebrow">After-market</span>
              <span className="tag" style={{ color: 'var(--violet-2)' }}>BETA</span>
            </div>
            <h1 className="h-xl" style={{ marginTop: 12 }}>애프터마켓</h1>
            <p className="muted" style={{ marginTop: 10 }}>공식 인증 굿즈만 거래하는 안전한 팬 간 C2C 마켓.</p>
          </div>
          <button className="btn btn-holo"><Icon name="plus" size={16} /> 판매 등록</button>
        </div>
        <div className="between" style={{ marginTop: 26, flexWrap: 'wrap', gap: 14 }}>
          <div className="wrapgap">
            <button className={'chip btn-sm' + (typeF === '전체' ? ' on' : '')} onClick={() => setTypeF('전체')}>전체 유형</button>
            {typeOptions.map((t) => (
              <button key={t} className={'chip btn-sm' + (typeF === t ? ' on' : '')} onClick={() => setTypeF(t)}>{t}</button>
            ))}
          </div>
          <div className="wrapgap">
            {['최신순', '낮은 가격순', '높은 가격순'].map((s) => (
              <button key={s} className={'chip btn-sm' + (sort === s ? ' on' : '')} onClick={() => setSort(s)}>{s}</button>
            ))}
          </div>
        </div>
        <div className="faint mono" style={{ fontSize: 12, marginTop: 18 }}>총 {list.length}개 상품</div>
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', marginTop: 16 }}>
          {list.map((m) => {
            const ip = DATA.ipById(m.ip);
            return (
              <div key={m.id} className="card lift" style={{ padding: 0, overflow: 'hidden' }}>
                <Poster bg={m.bg} glyph={ip?.glyph} ratio="1 / 1" radius={0}>
                  <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 4, display: 'flex', gap: 6 }}>
                    <span className="tag" style={{ color: '#fff', background: 'rgba(0,0,0,.45)' }}>{m.cond}</span>
                    {m.verified && (
                      <span className="tag row" style={{ color: '#0A0813', background: 'var(--mint)', border: 'none', fontWeight: 700, gap: 4 }}>
                        <Icon name="check" size={11} /> 인증
                      </span>
                    )}
                  </div>
                </Poster>
                <div style={{ padding: '14px 15px 16px' }}>
                  <div className="mono faint" style={{ fontSize: 11 }}>{ip?.title} · {m.type}</div>
                  <div style={{ fontWeight: 600, fontSize: 13.5, marginTop: 5, lineHeight: 1.3, minHeight: 35 }}>{m.name}</div>
                  <div className="between" style={{ marginTop: 8 }}>
                    <span style={{ fontWeight: 700, fontSize: 16, fontFamily: 'var(--ff-display)' }}>{DATA.krw(m.price)}</span>
                    <span className="faint mono" style={{ fontSize: 10.5 }}>@{m.seller}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
