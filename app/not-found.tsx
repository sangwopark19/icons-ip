import Link from 'next/link';
import { Icon } from '@/components/ui/Icon';

export default function NotFound() {
  return (
    <div className="screen">
      <div className="wrap" style={{ paddingTop: 48, paddingBottom: 80 }}>
        <div className="col" style={{ alignItems: 'center', textAlign: 'center', padding: '72px 20px', gap: 12 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 20,
              display: 'grid',
              placeItems: 'center',
              background: 'var(--surface)',
              border: '1px solid var(--line-2)',
              color: 'var(--violet-2)',
            }}
          >
            <Icon name="search" size={28} />
          </div>
          <div style={{ fontWeight: 600, fontSize: 16, marginTop: 4 }}>페이지를 찾을 수 없어요</div>
          <div className="muted" style={{ fontSize: 14 }}>주소가 바뀌었거나 삭제된 페이지일 수 있어요.</div>
          <Link className="btn btn-holo btn-sm" style={{ marginTop: 8 }} href="/">
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}
