import Link from 'next/link';
import type { Post } from '@/lib/data';
import { Icon } from './Icon';

export function FeedPreview({ p, href = '/community' }: { p: Post; href?: string }) {
  return (
    <Link className="card" href={href} style={{ padding: 18, textAlign: 'left', cursor: 'pointer', display: 'flex', gap: 14 }}>
      <div
        style={{
          width: 42,
          height: 42,
          borderRadius: 99,
          background: p.avatar,
          flex: '0 0 auto',
          display: 'grid',
          placeItems: 'center',
          fontWeight: 700,
          color: '#0A0813',
          fontSize: 16,
        }}
      >
        {p.user[0].toUpperCase()}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 600, fontSize: 14 }}>@{p.user}</span>
          <span className="tag">{p.ipName}</span>
          <span className="faint mono" style={{ fontSize: 11 }}>{p.time}</span>
        </div>
        <p style={{ fontSize: 14, marginTop: 7, color: 'var(--text)', lineHeight: 1.5 }}>{p.text}</p>
        {p.img && <div style={{ marginTop: 10, height: 120, borderRadius: 12, background: p.img }} />}
        <div className="row" style={{ marginTop: 12, gap: 18 }}>
          <span className="muted row" style={{ gap: 6, fontSize: 13 }}><Icon name="heart" size={15} /> {p.likes}</span>
          <span className="muted row" style={{ gap: 6, fontSize: 13 }}><Icon name="chat" size={15} /> {p.comments}</span>
          <span className="tag" style={{ marginLeft: 'auto', color: 'var(--violet-2)', borderColor: 'var(--line-2)' }}>#{p.tag}</span>
        </div>
      </div>
    </Link>
  );
}
