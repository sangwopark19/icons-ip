'use client';

import { useState } from 'react';
import type { CatalogSnapshot } from '@/lib/catalog';
import { Icon } from '@/components/ui/Icon';
import { Poster } from '@/components/ui/Poster';
import { Empty } from '@/components/ui/Empty';

export function Events({ catalog }: { catalog: Pick<CatalogSnapshot, 'events'> }) {
  const [mode, setMode] = useState('전체');
  const list = catalog.events.filter((e) => mode === '전체' || e.mode === mode || (mode === '진행중' && e.status === '진행중'));
  return (
    <div className="screen">
      <div className="wrap" style={{ paddingTop: 48, paddingBottom: 80 }}>
        <div className="between" style={{ flexWrap: 'wrap', gap: 16, alignItems: 'flex-end' }}>
          <div>
            <div className="eyebrow" style={{ marginBottom: 14 }}>Popup &amp; Ticketing</div>
            <h1 className="h-xl">팝업 · 이벤트</h1>
            <p className="muted" style={{ marginTop: 10 }}>공식 오프라인 &amp; 온라인 이벤트. 티켓팅부터 입장 인증, 기념 카드 발급까지.</p>
          </div>
          <div className="wrapgap">
            {['전체', '온라인', '오프라인', '진행중'].map((m) => (
              <button key={m} className={'chip' + (mode === m ? ' on' : '')} onClick={() => setMode(m)}>{m}</button>
            ))}
          </div>
        </div>
        {list[0] ? (
          <div className="card lift" style={{ marginTop: 28, padding: 0, overflow: 'hidden', textAlign: 'left', width: '100%', cursor: 'pointer', position: 'relative' }}>
            <div className="event-featured-layout" style={{ position: 'relative', minHeight: 300, display: 'grid', gridTemplateColumns: '1.1fr 0.9fr' }}>
              <div className="event-featured-copy" style={{ padding: '40px 44px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div className="row" style={{ gap: 8 }}>
                  <span className="tag" style={{ color: '#0A0813', background: list[0].accent, border: 'none', fontWeight: 700 }}>{list[0].mode}</span>
                  <span className="tag" style={{ color: '#fff' }}>{list[0].status}</span>
                  <span className="tag" style={{ color: 'var(--lime)', borderColor: 'var(--line-2)' }}>NOW</span>
                </div>
                <h2 className="h-lg" style={{ marginTop: 18 }}>{list[0].title}</h2>
                <div className="muted row" style={{ gap: 18, marginTop: 14, flexWrap: 'wrap' }}>
                  <span className="row" style={{ gap: 7 }}><Icon name="event" size={16} /> {list[0].date}</span>
                  <span className="row" style={{ gap: 7 }}><Icon name="globe" size={16} /> {list[0].loc}</span>
                </div>
                <div className="row" style={{ gap: 10, marginTop: 24, flexWrap: 'wrap' }}>
                  <button className="btn btn-holo">티켓 예매 <Icon name="arrow" size={15} /></button>
                  <button className="btn btn-ghost">기념 카드 보기</button>
                </div>
              </div>
              <div className="event-featured-art" style={{ position: 'relative', background: list[0].img }}>
                <div className="sheen" />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, var(--surface), transparent 40%)' }} />
              </div>
            </div>
          </div>
        ) : (
          <Empty
            icon="event"
            text={catalog.events.length ? '조건에 맞는 이벤트가 없어요' : '등록된 이벤트가 아직 없습니다'}
            sub={catalog.events.length ? '필터를 바꿔보세요' : 'Supabase 카탈로그 seed 또는 admin 등록 후 이벤트 목록에 공개됩니다.'}
          />
        )}
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', marginTop: 24 }}>
          {list.slice(1).map((e) => (
            <button key={e.id} className="card lift" style={{ padding: 0, overflow: 'hidden', textAlign: 'left', cursor: 'pointer' }}>
              <Poster bg={e.img} ratio="16 / 9" radius={0}>
                <div style={{ position: 'absolute', top: 12, left: 12, zIndex: 4, display: 'flex', gap: 6 }}>
                  <span className="tag" style={{ color: '#0A0813', background: e.accent, border: 'none', fontWeight: 700 }}>{e.mode}</span>
                  <span className="tag" style={{ color: '#fff', background: 'rgba(0,0,0,.4)' }}>{e.status}</span>
                </div>
              </Poster>
              <div style={{ padding: '16px 18px 18px' }}>
                <div style={{ fontWeight: 700, fontSize: 15.5 }}>{e.title}</div>
                <div className="muted row" style={{ gap: 14, marginTop: 10, fontSize: 12.5, flexWrap: 'wrap' }}>
                  <span className="row" style={{ gap: 6 }}><Icon name="event" size={14} /> {e.date}</span>
                  <span className="row" style={{ gap: 6 }}><Icon name="globe" size={14} /> {e.loc}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
