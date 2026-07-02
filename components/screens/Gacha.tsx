'use client';

import type { CatalogSnapshot } from '@/lib/catalog';
import { Empty } from '@/components/ui/Empty';

/* Gacha.dc.html 이식 전 임시 화면 — 기반 커밋의 /gacha 라우트 확보용 */
export function Gacha({
  catalog,
  initialIpId,
}: {
  catalog: Pick<CatalogSnapshot, 'ips' | 'cards'>;
  initialIpId?: string;
}) {
  void catalog;
  void initialIpId;
  return (
    <div className="screen">
      <div className="wrap" style={{ paddingTop: 48, paddingBottom: 80 }}>
        <div className="eyebrow" style={{ marginBottom: 14 }}>Gacha</div>
        <h1 className="h-xl">뽑기</h1>
        <Empty icon="card" text="뽑기 화면 준비 중" sub="새 디자인 이식 작업이 진행 중입니다." />
      </div>
    </div>
  );
}
