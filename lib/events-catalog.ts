import type { FandomEvent } from './data';

export const ALL_IPS = 'all';
export const ALL_MODES = '전체';
export const ALL_STATUSES = '전체';

const MODE_ORDER = ['온라인', '오프라인'];
// 예매 의도가 큰 순서로 노출한다: 지금 입장 가능한 진행중 → 예매중 → 예정.
const STATUS_PRIORITY = ['진행중', '예매중', '예정'];

export interface EventFilter {
  ipId: string;
  mode: string;
  status: string;
}

function statusRank(status: string): number {
  const index = STATUS_PRIORITY.indexOf(status);
  return index === -1 ? STATUS_PRIORITY.length : index;
}

export function eventModeOptions(events: FandomEvent[]): string[] {
  const present = new Set(events.map((event) => event.mode));
  return MODE_ORDER.filter((mode) => present.has(mode));
}

export function eventStatusOptions(events: FandomEvent[]): string[] {
  const present = new Set(events.map((event) => event.status));
  return STATUS_PRIORITY.filter((status) => present.has(status));
}

export function selectFandomEvents(events: FandomEvent[], filter: EventFilter): FandomEvent[] {
  return events
    .filter(
      (event) =>
        (filter.ipId === ALL_IPS || event.ip === filter.ipId) &&
        (filter.mode === ALL_MODES || event.mode === filter.mode) &&
        (filter.status === ALL_STATUSES || event.status === filter.status),
    )
    .sort((a, b) => statusRank(a.status) - statusRank(b.status));
}
