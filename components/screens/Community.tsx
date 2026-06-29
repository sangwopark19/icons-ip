'use client';

import { useActionState, useState, type ReactNode } from 'react';
import { useFormStatus } from 'react-dom';
import {
  blockCommunityUserAction,
  createCommunityCommentAction,
  createCommunityPostAction,
  deleteCommunityCommentAction,
  deleteCommunityPostAction,
  reportCommunityTargetAction,
  setCommunityPostLikeAction,
  type CommunityCommentActionState,
  type CommunityPostActionState,
} from '@/app/community/actions';
import type { CommunityChannel, CommunityFeedPost, CommunityReportTarget, CommunitySnapshot } from '@/lib/community';
import { krw, type Good } from '@/lib/data';
import { Icon } from '@/components/ui/Icon';
import { Empty } from '@/components/ui/Empty';
import { useGo } from '@/components/shell/useGo';

const emptyState: CommunityPostActionState = {};
const emptyCommentState: CommunityCommentActionState = {};
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function ErrorText({ children, id }: { children?: string; id: string }) {
  if (!children) return null;
  return (
    <span id={id} style={{ color: 'var(--pink)', fontSize: 12.5, fontWeight: 600 }}>
      {children}
    </span>
  );
}

function ReactionButton({
  active,
  children,
  label,
}: {
  active?: boolean;
  children: ReactNode;
  label: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      aria-label={label}
      aria-pressed={active}
      className="row muted"
      disabled={pending}
      style={{
        gap: 7,
        fontSize: 13.5,
        fontWeight: 600,
        color: active ? 'var(--pink)' : undefined,
        opacity: pending ? 0.6 : undefined,
      }}
      type="submit"
    >
      {children}
    </button>
  );
}

function DeleteButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      aria-label={label}
      className="muted"
      disabled={pending}
      style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--faint)', opacity: pending ? 0.6 : undefined }}
      type="submit"
    >
      삭제
    </button>
  );
}

function SmallActionButton({ children, label }: { children: ReactNode; label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      aria-label={label}
      className="muted"
      disabled={pending}
      style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--faint)', opacity: pending ? 0.6 : undefined }}
      type="submit"
    >
      {children}
    </button>
  );
}

function isUuid(value: string | null | undefined) {
  return typeof value === 'string' && UUID_PATTERN.test(value);
}

function ReportForm({
  label,
  targetId,
  targetType,
}: {
  label: string;
  targetId: string;
  targetType: CommunityReportTarget;
}) {
  if (!isUuid(targetId)) return null;

  return (
    <form action={reportCommunityTargetAction}>
      <input type="hidden" name="next" value="/community" />
      <input type="hidden" name="targetType" value={targetType} />
      <input type="hidden" name="targetId" value={targetId} />
      <SmallActionButton label={label}>신고</SmallActionButton>
    </form>
  );
}

function BlockUserForm({ authorId }: { authorId: string }) {
  if (!isUuid(authorId)) return null;

  return (
    <form action={blockCommunityUserAction}>
      <input type="hidden" name="next" value="/community" />
      <input type="hidden" name="targetUserId" value={authorId} />
      <SmallActionButton label="사용자 차단">차단</SmallActionButton>
    </form>
  );
}

function CommentSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      aria-label="댓글 게시"
      className="btn btn-sm"
      disabled={pending}
      style={{ height: 36, padding: '0 12px' }}
      type="submit"
    >
      {pending ? <Icon name="clock" size={15} /> : <Icon name="arrowUp" size={15} />}
    </button>
  );
}

function CommentForm({ postId }: { postId: string }) {
  const [state, action] = useActionState(createCommunityCommentAction, emptyCommentState);
  const errorId = `comment-${postId}-error`;

  return (
    <form action={action} className="row" style={{ gap: 8, marginTop: 12, alignItems: 'start' }}>
      <input type="hidden" name="next" value="/community" />
      <input type="hidden" name="postId" value={postId} />
      <div className="col" style={{ flex: 1, gap: 6 }}>
        <input
          aria-describedby={state.errors?.text || state.errors?.form ? errorId : undefined}
          aria-invalid={Boolean(state.errors?.text || state.errors?.form)}
          name="text"
          placeholder="댓글을 남겨보세요"
          style={{ width: '100%', height: 36, border: '1px solid var(--line-2)', background: 'var(--bg-2)', borderRadius: 10, padding: '0 11px', color: 'var(--text)', fontSize: 13, fontFamily: 'inherit', outline: 'none' }}
        />
        <ErrorText id={errorId}>{state.errors?.text ?? state.errors?.form ?? state.errors?.postId}</ErrorText>
      </div>
      <CommentSubmitButton />
    </form>
  );
}

function PostCard({ p }: { p: CommunityFeedPost }) {
  const imageBackground = p.img && (p.img.startsWith('http') || p.img.startsWith('/'))
    ? `url("${p.img}") center / cover no-repeat`
    : p.img;

  return (
    <article className="card" style={{ padding: 18, borderRadius: 'var(--r)' }}>
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
        <div className="row" style={{ marginLeft: 'auto', gap: 10, alignItems: 'center' }}>
          <span className="tag" style={{ color: 'var(--violet-2)' }}>#{p.tag}</span>
          <ReportForm label="포스트 신고" targetId={p.id} targetType="post" />
          {!p.canDelete && (
            <>
              <ReportForm label="사용자 신고" targetId={p.authorId} targetType="user" />
              <BlockUserForm authorId={p.authorId} />
            </>
          )}
          {p.canDelete && (
            <form action={deleteCommunityPostAction}>
              <input type="hidden" name="next" value="/community" />
              <input type="hidden" name="postId" value={p.id} />
              <DeleteButton label="포스트 삭제" />
            </form>
          )}
        </div>
      </div>
      <p style={{ marginTop: 14, fontSize: 15, lineHeight: 1.55 }}>{p.text}</p>
      {imageBackground && <div style={{ marginTop: 14, height: 220, borderRadius: 14, background: imageBackground, position: 'relative', overflow: 'hidden' }}><div className="sheen" /></div>}
      <div className="row" style={{ marginTop: 16, gap: 22 }}>
        <form action={setCommunityPostLikeAction}>
          <input type="hidden" name="next" value="/community" />
          <input type="hidden" name="postId" value={p.id} />
          <input type="hidden" name="shouldLike" value={p.likedByViewer ? '0' : '1'} />
          <ReactionButton active={p.likedByViewer} label={p.likedByViewer ? '좋아요 취소' : '좋아요'}>
            <Icon name="heart" size={17} fill={p.likedByViewer} /> {p.likes}
          </ReactionButton>
        </form>
        <span className="row muted" style={{ gap: 7, fontSize: 13.5 }}><Icon name="chat" size={17} /> {p.comments}</span>
        <span className="row muted" style={{ gap: 7, fontSize: 13.5, marginLeft: 'auto' }}><Icon name="arrow" size={17} /> 공유</span>
      </div>
      {(p.commentItems.length > 0 || p.comments > 0) && (
        <div className="col" style={{ gap: 10, marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--line)' }}>
          {p.commentItems.map((comment) => (
            <div key={comment.id} className="row" style={{ alignItems: 'start', gap: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: 99, background: 'var(--surface-2)', flex: '0 0 auto', display: 'grid', placeItems: 'center', fontWeight: 800, color: 'var(--violet-2)', fontSize: 11 }}>
                {comment.user[0].toUpperCase()}
              </div>
              <div className="col" style={{ minWidth: 0, gap: 3, flex: 1 }}>
                <div className="row" style={{ gap: 7, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 12.5, fontWeight: 700 }}>@{comment.user}</span>
                  <span className="faint mono" style={{ fontSize: 10.5 }}>{comment.time}</span>
                </div>
                <p style={{ fontSize: 13.5, lineHeight: 1.45, margin: 0 }}>{comment.text}</p>
              </div>
              {comment.canDelete && (
                <form action={deleteCommunityCommentAction}>
                  <input type="hidden" name="next" value="/community" />
                  <input type="hidden" name="commentId" value={comment.id} />
                  <DeleteButton label="댓글 삭제" />
                </form>
              )}
              <ReportForm label="댓글 신고" targetId={comment.id} targetType="comment" />
              {!comment.canDelete && (
                <>
                  <ReportForm label="사용자 신고" targetId={comment.authorId} targetType="user" />
                  <BlockUserForm authorId={comment.authorId} />
                </>
              )}
            </div>
          ))}
        </div>
      )}
      <CommentForm postId={p.id} />
    </article>
  );
}

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button className="btn btn-holo btn-sm" disabled={disabled || pending}>
      {pending ? '게시 중' : '게시'}
    </button>
  );
}

function Composer({ channels }: { channels: CommunityChannel[] }) {
  const [state, action] = useActionState(createCommunityPostAction, emptyState);
  const defaultIpId = channels[0]?.id ?? '';
  const disabled = !defaultIpId;

  return (
    <form action={action} className="card community-composer" style={{ padding: 16, display: 'grid', gridTemplateColumns: '42px 1fr auto', gap: 14, alignItems: 'start', borderRadius: 'var(--r)' }}>
      <input type="hidden" name="next" value="/community" />
      <div className="community-composer-avatar" style={{ width: 42, height: 42, borderRadius: 99, background: 'var(--holo)', flex: '0 0 auto' }} />
      <div className="col" style={{ gap: 10 }}>
        <div className="row" style={{ gap: 10, alignItems: 'stretch' }}>
          <select
            aria-describedby={state.errors?.ipId ? 'community-ip-error' : undefined}
            aria-invalid={Boolean(state.errors?.ipId)}
            defaultValue={defaultIpId}
            disabled={disabled}
            name="ipId"
            style={{ minWidth: 160, height: 42, border: '1px solid var(--line-2)', background: 'var(--bg-2)', borderRadius: 12, padding: '0 12px', color: 'var(--text)', fontSize: 13.5, fontFamily: 'inherit', outline: 'none' }}
          >
            {channels.map((channel) => (
              <option key={channel.id} value={channel.id}>{channel.title}</option>
            ))}
          </select>
          <input
            name="tag"
            placeholder="#태그"
            style={{ flex: 1, minWidth: 0, height: 42, border: '1px solid var(--line-2)', background: 'var(--bg-2)', borderRadius: 12, padding: '0 12px', color: 'var(--text)', fontSize: 13.5, fontFamily: 'inherit', outline: 'none' }}
          />
        </div>
        <textarea
          aria-describedby={state.errors?.text ? 'community-text-error' : undefined}
          aria-invalid={Boolean(state.errors?.text)}
          name="text"
          placeholder="IP 채널에 글을 남겨보세요..."
          rows={3}
          style={{ width: '100%', resize: 'vertical', minHeight: 84, border: '1px solid var(--line-2)', background: 'var(--bg-2)', borderRadius: 14, padding: '12px 14px', color: 'var(--text)', fontSize: 14, fontFamily: 'inherit', outline: 'none', lineHeight: 1.5 }}
        />
        <div className="row" style={{ gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            accept="image/jpeg,image/png,image/webp,image/gif"
            aria-describedby={state.errors?.image ? 'community-image-error' : undefined}
            aria-invalid={Boolean(state.errors?.image)}
            name="image"
            type="file"
            style={{ fontSize: 12.5, color: 'var(--dim)', maxWidth: '100%' }}
          />
        </div>
        <ErrorText id="community-ip-error">{state.errors?.ipId}</ErrorText>
        <ErrorText id="community-text-error">{state.errors?.text}</ErrorText>
        <ErrorText id="community-image-error">{state.errors?.image}</ErrorText>
        {state.errors?.form && (
          <div role="alert" style={{ color: 'var(--pink)', fontSize: 13, fontWeight: 700 }}>
            {state.errors.form}
          </div>
        )}
      </div>
      <SubmitButton disabled={disabled} />
    </form>
  );
}

function OfficialGoods({ goods }: { goods: Good[] }) {
  const go = useGo();

  return (
    <div className="card" style={{ padding: 18, borderRadius: 'var(--r)' }}>
      <div className="between" style={{ marginBottom: 14 }}>
        <span style={{ fontWeight: 700, fontSize: 14 }}>공식 굿즈</span>
        <button className="faint" style={{ fontSize: 12 }} onClick={() => go('shop')}>전체 →</button>
      </div>
      <div className="col" style={{ gap: 12 }}>
        {goods.slice(0, 3).map((good) => (
          <button key={good.id} className="row" style={{ gap: 12, textAlign: 'left' }} onClick={() => go('shop')}>
            <div style={{ width: 46, height: 46, borderRadius: 10, background: good.img, flex: '0 0 auto' }} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{good.name}</div>
              <div className="mono faint" style={{ fontSize: 11, marginTop: 2 }}>{krw(good.price)}</div>
            </div>
          </button>
        ))}
        {!goods.length && <Empty icon="bag" text="등록된 굿즈가 아직 없습니다" />}
      </div>
    </div>
  );
}

function ChannelHero({ channel, postCount }: { channel: CommunityChannel | undefined; postCount: number }) {
  const accent = channel?.color ?? '#FF4D9D';

  return (
    <header className="community-hero">
      <span
        className="community-hero-glow"
        aria-hidden="true"
        style={{ background: `radial-gradient(130% 130% at 100% 0%, ${accent}38, transparent 62%)` }}
      />
      <span className="eyebrow community-hero-kicker">떠들어요 · 팬 커뮤니티</span>
      {channel ? (
        <>
          <h1 className="h-lg community-hero-title">
            <span style={{ color: accent }}>{channel.title}</span> 팬덤 채널
          </h1>
          <p className="muted community-hero-sub">{channel.sub} — 같은 최애를 둔 팬들과 떠들어요.</p>
        </>
      ) : (
        <>
          <h1 className="h-lg community-hero-title">
            모든 팬덤의 <span className="holo-text">이야기</span>
          </h1>
          <p className="muted community-hero-sub">관심 가는 채널을 골라, 같은 최애를 둔 팬들과 떠들어보세요.</p>
        </>
      )}
      <div className="community-hero-meta mono">
        {postCount > 0 ? `지금 이야기 ${postCount}개` : '아직 첫 이야기를 기다려요'}
      </div>
    </header>
  );
}

export function Community({ snapshot, initialChannelId }: { snapshot: CommunitySnapshot; initialChannelId?: string }) {
  const go = useGo();
  const [channelId, setChannelId] = useState(initialChannelId ?? 'all');
  const [sort, setSort] = useState('최신순');
  const channels = snapshot.channels;
  const selectedChannel = channels.find((channel) => channel.id === channelId);
  let posts = snapshot.posts.filter((post) => channelId === 'all' || post.ipId === channelId);
  if (sort === '인기순') posts = [...posts].sort((a, b) => b.likes - a.likes);

  return (
    <div className="screen">
      <div className="wrap community-layout" style={{ paddingTop: 40, paddingBottom: 80, display: 'grid', gridTemplateColumns: '230px 1fr 280px', gap: 28, alignItems: 'start' }}>
        <aside className="hide-mob" style={{ position: 'sticky', top: 90 }}>
          <div className="community-rail-label mono">내 팬덤 채널</div>
          <div className="col" role="group" aria-label="팬덤 채널" style={{ gap: 4 }}>
            <button
              onClick={() => setChannelId('all')}
              className={'community-channel' + (channelId === 'all' ? ' is-active' : '')}
              aria-pressed={channelId === 'all'}
            >
              <span className="community-channel-dot" style={{ background: 'var(--holo)' }} />
              <span className="community-channel-text">
                <span className="community-channel-title">전체 피드</span>
                <span className="community-channel-sub">모든 팬덤의 이야기</span>
              </span>
            </button>
            {channels.map((channel) => (
              <button
                key={channel.id}
                onClick={() => setChannelId(channel.id)}
                className={'community-channel' + (channelId === channel.id ? ' is-active' : '')}
                aria-pressed={channelId === channel.id}
                style={channelId === channel.id ? { borderColor: `${channel.color}66` } : undefined}
              >
                <span className="community-channel-dot" style={{ background: channel.color }} />
                <span className="community-channel-text">
                  <span className="community-channel-title">{channel.title}</span>
                  <span className="community-channel-sub">{channel.sub}</span>
                </span>
              </button>
            ))}
          </div>
        </aside>

        <main>
          <div className="only-mob wrapgap" style={{ marginBottom: 16 }}>
            <button className={'chip btn-sm' + (channelId === 'all' ? ' on' : '')} aria-pressed={channelId === 'all'} onClick={() => setChannelId('all')}>전체</button>
            {channels.map((channel) => (
              <button key={channel.id} className={'chip btn-sm' + (channelId === channel.id ? ' on' : '')} aria-pressed={channelId === channel.id} onClick={() => setChannelId(channel.id)}>{channel.title}</button>
            ))}
          </div>

          <ChannelHero channel={selectedChannel} postCount={posts.length} />

          <div style={{ marginTop: 18 }}>
            <Composer channels={channels} />
          </div>

          <div className="between" style={{ margin: '22px 2px 16px' }}>
            <span style={{ fontWeight: 700, fontSize: 15 }}>최근 이야기</span>
            <div className="row" style={{ gap: 14 }}>
              {['최신순', '인기순'].map((value) => (
                <button key={value} onClick={() => setSort(value)} aria-pressed={sort === value} style={{ fontSize: 13.5, fontWeight: 600, color: sort === value ? 'var(--text)' : 'var(--faint)' }}>{value}</button>
              ))}
            </div>
          </div>
          <div className="col" style={{ gap: 14 }}>
            {posts.map((post) => <PostCard key={post.id} p={post} />)}
            {!posts.length && (
              <Empty
                icon="chat"
                text={selectedChannel ? `${selectedChannel.title} 채널의 첫 이야기를 남겨보세요` : '아직 포스트가 없어요'}
                sub={selectedChannel ? undefined : '첫 번째 포스트를 작성해보세요'}
              />
            )}
          </div>
        </main>

        <aside className="hide-mob col" style={{ gap: 18, position: 'sticky', top: 90 }}>
          <div className="card" style={{ padding: 18, borderRadius: 'var(--r)' }}>
            <div className="between" style={{ marginBottom: 14 }}><span style={{ fontWeight: 700, fontSize: 14 }}>🔥 트렌딩</span></div>
            <div className="wrapgap">{snapshot.trending.slice(0, 8).map((tag) => <span key={tag} className="chip btn-sm" style={{ cursor: 'pointer' }}>{tag}</span>)}</div>
          </div>
          <OfficialGoods goods={snapshot.goods} />
          <div className="card" style={{ padding: 18, borderRadius: 'var(--r)' }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>게이미피케이션</div>
            {([['spark', '데일리 가챠', '카드 획득 & 공유', 'binder'], ['shield', '팝업 인증', '컬렉션 완성 인증', 'events']] as const).map(([ic, title, desc, route]) => (
              <button key={title} className="row" style={{ gap: 12, padding: '8px 0', textAlign: 'left', width: '100%' }} onClick={() => go(route)}>
                <div style={{ width: 36, height: 36, borderRadius: 10, display: 'grid', placeItems: 'center', background: 'var(--surface-2)', color: 'var(--violet-2)' }}><Icon name={ic} size={18} /></div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{title}</div>
                  <div className="faint" style={{ fontSize: 11.5 }}>{desc}</div>
                </div>
              </button>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
