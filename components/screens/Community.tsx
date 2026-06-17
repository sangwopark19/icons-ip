'use client';

import { useState } from 'react';
import { DATA, type Post } from '@/lib/data';
import { Icon } from '@/components/ui/Icon';
import { Empty } from '@/components/ui/Empty';
import { useGo } from '@/components/shell/useGo';

function PostCard({ p }: { p: Post }) {
  const [liked, setLiked] = useState(false);
  return (
    <div className="card" style={{ padding: 18, borderRadius: 'var(--r)' }}>
      <div className="row" style={{ gap: 12 }}>
        <div style={{ width: 44, height: 44, borderRadius: 99, background: p.avatar, flex: '0 0 auto', display: 'grid', placeItems: 'center', fontWeight: 700, color: '#0A0813' }}>
          {p.user[0].toUpperCase()}
        </div>
        <div className="col">
          <span style={{ fontWeight: 600, fontSize: 14.5 }}>@{p.user}</span>
          <div className="row" style={{ gap: 8 }}>
            <span className="tag">{p.ipName}</span>
            <span className="faint mono" style={{ fontSize: 11 }}>{p.time}</span>
          </div>
        </div>
        <span className="tag" style={{ marginLeft: 'auto', color: 'var(--violet-2)' }}>#{p.tag}</span>
      </div>
      <p style={{ marginTop: 14, fontSize: 15, lineHeight: 1.55 }}>{p.text}</p>
      {p.img && <div style={{ marginTop: 14, height: 220, borderRadius: 14, background: p.img, position: 'relative', overflow: 'hidden' }}><div className="sheen" /></div>}
      <div className="row" style={{ marginTop: 16, gap: 22 }}>
        <button className="row" style={{ gap: 7, color: liked ? 'var(--pink)' : 'var(--dim)', fontSize: 13.5, fontWeight: 600 }} onClick={() => setLiked(!liked)}>
          <Icon name="heart" size={17} fill={liked ? 'currentColor' : undefined} /> {p.likes + (liked ? 1 : 0)}
        </button>
        <span className="row muted" style={{ gap: 7, fontSize: 13.5 }}><Icon name="chat" size={17} /> {p.comments}</span>
        <span className="row muted" style={{ gap: 7, fontSize: 13.5, marginLeft: 'auto' }}><Icon name="arrow" size={17} /> 공유</span>
      </div>
    </div>
  );
}

export function Community() {
  const go = useGo();
  const [ch, setCh] = useState('전체');
  const [sort, setSort] = useState('최신순');
  const channels = ['전체', ...DATA.IPS.slice(0, 5).map((i) => i.title)];
  let posts = DATA.POSTS.filter((p) => ch === '전체' || p.ipName === ch);
  if (sort === '인기순') posts = [...posts].sort((a, b) => b.likes - a.likes);

  return (
    <div className="screen">
      <div className="wrap" style={{ paddingTop: 40, paddingBottom: 80, display: 'grid', gridTemplateColumns: '230px 1fr 280px', gap: 28, alignItems: 'start' }}>
        {/* left: channels */}
        <aside className="hide-mob" style={{ position: 'sticky', top: 90 }}>
          <div className="faint mono" style={{ fontSize: 11, letterSpacing: '.1em', marginBottom: 12 }}>IP 커뮤니티</div>
          <div className="col" style={{ gap: 4 }}>
            {channels.map((c) => {
              const ip = DATA.IPS.find((i) => i.title === c);
              return (
                <button
                  key={c}
                  onClick={() => setCh(c)}
                  className="row"
                  style={{
                    gap: 10,
                    padding: '11px 14px',
                    borderRadius: 14,
                    textAlign: 'left',
                    justifyContent: 'flex-start',
                    background: ch === c ? 'var(--surface-2)' : 'transparent',
                    border: '1px solid',
                    borderColor: ch === c ? 'var(--line-2)' : 'transparent',
                    color: ch === c ? 'var(--text)' : 'var(--dim)',
                    fontWeight: 600,
                    fontSize: 14,
                  }}
                >
                  <span style={{ width: 9, height: 9, borderRadius: 99, background: ip ? ip.v.color : 'var(--holo)' }} />
                  {c === '전체' ? '전체 피드' : c}
                </button>
              );
            })}
          </div>
        </aside>

        {/* center feed */}
        <main>
          {/* mobile channel chips */}
          <div className="only-mob wrapgap" style={{ marginBottom: 16 }}>
            {channels.map((c) => (
              <button key={c} className={'chip btn-sm' + (ch === c ? ' on' : '')} onClick={() => setCh(c)}>{c === '전체' ? '전체' : c}</button>
            ))}
          </div>
          {/* composer */}
          <div className="card" style={{ padding: 16, display: 'flex', gap: 14, alignItems: 'center', borderRadius: 'var(--r)' }}>
            <div style={{ width: 42, height: 42, borderRadius: 99, background: 'var(--holo)', flex: '0 0 auto' }} />
            <input
              placeholder="IP 채널에 글을 남겨보세요…"
              style={{ flex: 1, height: 44, border: '1px solid var(--line-2)', background: 'var(--bg-2)', borderRadius: 99, padding: '0 18px', color: 'var(--text)', fontSize: 14, fontFamily: 'inherit', outline: 'none' }}
            />
            <button className="btn btn-holo btn-sm" onClick={() => go('login')}>게시</button>
          </div>
          {/* sort */}
          <div className="between" style={{ margin: '22px 2px 16px' }}>
            <span style={{ fontWeight: 700, fontSize: 17 }}>{ch === '전체' ? '전체 피드' : ch}</span>
            <div className="row" style={{ gap: 14 }}>
              {['최신순', '인기순'].map((s) => (
                <button key={s} onClick={() => setSort(s)} style={{ fontSize: 13.5, fontWeight: 600, color: sort === s ? 'var(--text)' : 'var(--faint)' }}>{s}</button>
              ))}
            </div>
          </div>
          <div className="col" style={{ gap: 14 }}>
            {posts.map((p) => <PostCard key={p.id} p={p} />)}
            {!posts.length && <Empty icon="chat" text="아직 게시글이 없어요" sub="첫 번째 게시글을 작성해보세요" />}
          </div>
        </main>

        {/* right rail */}
        <aside className="hide-mob col" style={{ gap: 18, position: 'sticky', top: 90 }}>
          <div className="card" style={{ padding: 18, borderRadius: 'var(--r)' }}>
            <div className="between" style={{ marginBottom: 14 }}><span style={{ fontWeight: 700, fontSize: 14 }}>🔥 트렌딩</span></div>
            <div className="wrapgap">{DATA.TRENDING.slice(0, 8).map((t) => <span key={t} className="chip btn-sm" style={{ cursor: 'pointer' }}>{t}</span>)}</div>
          </div>
          <div className="card" style={{ padding: 18, borderRadius: 'var(--r)' }}>
            <div className="between" style={{ marginBottom: 14 }}>
              <span style={{ fontWeight: 700, fontSize: 14 }}>공식 굿즈</span>
              <button className="faint" style={{ fontSize: 12 }} onClick={() => go('shop')}>전체 →</button>
            </div>
            <div className="col" style={{ gap: 12 }}>
              {DATA.GOODS.slice(0, 3).map((g) => (
                <button key={g.id} className="row" style={{ gap: 12, textAlign: 'left' }} onClick={() => go('shop')}>
                  <div style={{ width: 46, height: 46, borderRadius: 10, background: g.img, flex: '0 0 auto' }} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{g.name}</div>
                    <div className="mono faint" style={{ fontSize: 11, marginTop: 2 }}>{DATA.krw(g.price)}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
          <div className="card" style={{ padding: 18, borderRadius: 'var(--r)' }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>게이미피케이션</div>
            {([['spark', '데일리 가챠', '카드 획득 & 공유', 'binder'], ['shield', '팝업 인증', '컬렉션 완성 인증', 'events']] as const).map(([ic, t, d, r]) => (
              <button key={t} className="row" style={{ gap: 12, padding: '8px 0', textAlign: 'left', width: '100%' }} onClick={() => go(r)}>
                <div style={{ width: 36, height: 36, borderRadius: 10, display: 'grid', placeItems: 'center', background: 'var(--surface-2)', color: 'var(--violet-2)' }}><Icon name={ic} size={18} /></div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{t}</div>
                  <div className="faint" style={{ fontSize: 11.5 }}>{d}</div>
                </div>
              </button>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
