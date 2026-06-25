'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { SearchResult, SearchSnapshot } from '@/lib/search';
import { Icon } from '@/components/ui/Icon';
import { Empty } from '@/components/ui/Empty';
import { useGo } from '@/components/shell/useGo';

function targetLabel(result: SearchResult) {
  if (result.kind === 'ip') return `${result.label} 상세 보기`;
  if (result.kind === 'good') return `${result.label} 굿즈샵에서 보기`;
  if (result.kind === 'card') return `${result.label} 카드에서 보기`;
  if (result.kind === 'post') return '커뮤니티 포스트 보기';
  return `${result.label} 태그 보기`;
}

function resultFallbackBg(kind: SearchResult['kind']) {
  if (kind === 'tag') return 'linear-gradient(150deg, var(--violet), var(--pink))';
  if (kind === 'post') return 'linear-gradient(150deg, rgba(45,226,255,.24), rgba(139,92,255,.26))';
  return 'var(--surface-2)';
}

export function Search({ snapshot }: { snapshot: SearchSnapshot }) {
  const go = useGo();
  const router = useRouter();
  const [q, setQ] = useState(snapshot.query);
  const popular = ['화산강림', '한정굿즈', '호시나 미오', 'LUMEN', '포토카드', '버튜버'];

  const openResult = (result: SearchResult) => {
    if (result.kind === 'ip') return go('ip', result.ipId ?? result.id);
    if (result.kind === 'good') return go('shop');
    if (result.kind === 'card') return go('binder');
    return go('community');
  };

  const searchFor = (query: string) => {
    setQ(query);
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="screen">
      <div className="wrap" style={{ paddingTop: 64, paddingBottom: 80, maxWidth: 760 }}>
        <h1 className="h-xl">검색</h1>
        <form action="/search" method="get" className="row" style={{ marginTop: 22, gap: 10 }}>
          <div className="row" style={{ flex: 1, gap: 12, height: 56, padding: '0 20px', borderRadius: 99, background: 'var(--surface)', border: '1px solid var(--line-2)' }}>
            <Icon name="search" size={20} style={{ color: 'var(--faint)' }} />
            <input
              autoFocus
              name="q"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="IP, 굿즈, 카드, 포스트, 태그 검색…"
              style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: 'var(--text)', fontSize: 16, fontFamily: 'inherit' }}
            />
          </div>
          <button className="btn btn-holo" style={{ height: 56 }} type="submit">검색</button>
        </form>

        {!snapshot.query && (
          <div className="card" style={{ marginTop: 24, padding: '22px 24px', borderRadius: 'var(--r)' }}>
            <div className="faint mono" style={{ fontSize: 11, letterSpacing: '.1em', marginBottom: 16 }}>이주의 인기 검색</div>
            <div className="col" style={{ gap: 4 }}>
              {popular.map((t, i) => (
                <button key={t} type="button" className="row" style={{ gap: 16, padding: '12px 6px', textAlign: 'left' }} onClick={() => searchFor(t)}>
                  <span className="mono" style={{ fontWeight: 700, color: i < 3 ? 'var(--violet-2)' : 'var(--faint)', width: 18 }}>{i + 1}</span>
                  <span style={{ fontWeight: 600 }}>{t}</span>
                  {i < 3 && <Icon name="fire" size={15} style={{ color: 'var(--pink)' }} />}
                </button>
              ))}
            </div>
          </div>
        )}
        {snapshot.query && (
          <div className="col" style={{ gap: 10, marginTop: 24 }}>
            <div className="faint mono" style={{ fontSize: 12 }}>{snapshot.total}건의 결과</div>
            {snapshot.groups.map((group) => (
              <section key={group.kind} className="col" style={{ gap: 10, marginTop: 12 }}>
                <div className="between" style={{ padding: '0 2px' }}>
                  <h2 style={{ fontSize: 15, margin: 0 }}>{group.label}</h2>
                  <span className="faint mono" style={{ fontSize: 11 }}>{group.results.length}</span>
                </div>
                {group.results.map((result) => (
                  <button
                    key={`${result.kind}:${result.id}`}
                    aria-label={targetLabel(result)}
                    className="card row"
                    style={{ padding: 14, gap: 14, textAlign: 'left' }}
                    onClick={() => openResult(result)}
                    type="button"
                  >
                    <div
                      style={{
                        width: 52,
                        height: 52,
                        borderRadius: 12,
                        background: result.bg ?? resultFallbackBg(result.kind),
                        flex: '0 0 auto',
                        display: 'grid',
                        placeItems: 'center',
                        color: result.kind === 'tag' ? '#0A0813' : 'var(--text)',
                        fontWeight: 800,
                      }}
                    >
                      {result.kind === 'tag' ? '#' : null}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{result.label}</div>
                      <div className="faint mono" style={{ fontSize: 11, marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {result.subtitle ?? group.label}
                      </div>
                    </div>
                    <Icon name="arrow" size={18} style={{ marginLeft: 'auto', color: 'var(--faint)', flex: '0 0 auto' }} />
                  </button>
                ))}
              </section>
            ))}
            {!snapshot.total && <Empty icon="search" text={`'${snapshot.query}' 검색 결과가 없어요`} sub="다른 키워드로 검색해보세요" />}
          </div>
        )}
      </div>
    </div>
  );
}
