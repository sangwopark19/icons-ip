'use client';

import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import { toggleIpFollowAction } from '@/app/ip/actions';
import type { CatalogIpDetail } from '@/lib/catalog';
import type { FandomEvent } from '@/lib/data';
import type { IpFollowState } from '@/lib/ip-follow';
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

function FollowButton({ isFollowed }: { isFollowed: boolean }) {
  const { pending } = useFormStatus();
  const label = pending ? '저장 중' : isFollowed ? '팬덤 나가기' : '팬덤 가입';

  return (
    <button className={isFollowed ? 'btn btn-ghost' : 'btn btn-holo'} disabled={pending}>
      {label} <Icon name={isFollowed ? 'check' : 'plus'} size={15} />
    </button>
  );
}

function FollowForm({ followState, ipId }: { followState: IpFollowState; ipId: string }) {
  return (
    <form action={toggleIpFollowAction}>
      <input type="hidden" name="ipId" value={ipId} />
      <input type="hidden" name="intent" value={followState.isFollowed ? 'unfollow' : 'follow'} />
      <input type="hidden" name="next" value={`/ip/${ipId}`} />
      <FollowButton isFollowed={followState.isFollowed} />
    </form>
  );
}

export function IpDetail({
  detail,
  followError,
  followState,
}: {
  detail: CatalogIpDetail;
  followError: boolean;
  followState: IpFollowState;
}) {
  const go = useGo();
  const { ip, goods, cards, events, posts } = detail;
  const [tab, setTab] = useState('굿즈');
  const tabs: [string, number | ''][] = [['굿즈', goods.length], ['카드', cards.length], ['팝업', events.length], ['커뮤니티', posts.length]];

  return (
    <div className="screen">
      {/* banner */}
      <div style={{ position: 'relative', height: 340, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: ip.bg }} />
        <div className="sheen" />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(transparent 30%, var(--bg) 96%)' }} />
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
            <FollowForm followState={followState} ipId={ip.id} />
            <button className="btn btn-ghost">알림 받기</button>
          </div>
        </div>
        {followError && (
          <div className="card" role="alert" style={{ marginTop: 18, padding: 12, borderRadius: 12, color: 'var(--pink)', fontSize: 13.5, fontWeight: 700 }}>
            팔로우 상태를 저장하지 못했습니다. 잠시 후 다시 시도해주세요.
          </div>
        )}
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
          goods.length ? (
            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
              {goods.map((g) => <GoodsCard key={g.id} g={g} ip={ip} />)}
            </div>
          ) : (
            <Empty icon="bag" text="등록된 굿즈가 아직 없습니다" />
          )
        )}
        {tab === '카드' && (
          cards.length ? (
            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', justifyItems: 'center' }}>
              {cards.map((c) => <Collectible key={c.id} card={c} ip={ip} onClick={() => go('binder')} />)}
            </div>
          ) : (
            <Empty icon="card" text="등록된 카드가 아직 없습니다" />
          )
        )}
        {tab === '팝업' && (
          <div className="col" style={{ gap: 14 }}>
            {events.length ? events.map((e) => <EventRow key={e.id} e={e} go={go} />) : <Empty icon="event" text="예정된 이벤트가 없어요" />}
          </div>
        )}
        {tab === '커뮤니티' && (
          <div className="col" style={{ gap: 14 }}>
            {posts.length ? posts.map((p) => <FeedPreview key={p.id} p={p} />) : <Empty icon="chat" text="아직 포스트가 없어요" sub="공개 포스트가 등록되면 이 IP 탭에 표시됩니다." />}
          </div>
        )}
      </div>
    </div>
  );
}
