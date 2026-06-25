import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getSearchSnapshot, normalizeSearchQuery } from './search';

const mocks = vi.hoisted(() => ({
  isConfigured: false,
  rpc: vi.fn(),
}));

vi.mock('server-only', () => ({}));
vi.mock('@/lib/data', async () => await import('./data'));
vi.mock('@/lib/supabase/config', () => ({
  getSupabaseConfig: () => ({ isConfigured: mocks.isConfigured }),
}));
vi.mock('@/lib/supabase/server', () => ({
  createClient: () => ({
    rpc: mocks.rpc,
  }),
}));

beforeEach(() => {
  mocks.isConfigured = false;
  mocks.rpc.mockReset();
});

describe('normalizeSearchQuery', () => {
  it('trims repeated whitespace and caps long search input', () => {
    expect(normalizeSearchQuery('  화산   강림  ')).toBe('화산 강림');
    expect(normalizeSearchQuery('x'.repeat(120))).toHaveLength(80);
  });
});

describe('getSearchSnapshot', () => {
  it('uses mock catalog data when Supabase is not configured', async () => {
    const snapshot = await getSearchSnapshot('호시나');

    expect(mocks.rpc).not.toHaveBeenCalled();
    expect(snapshot.source).toBe('mock');
    expect(snapshot.query).toBe('호시나');
    expect(snapshot.groups.map((group) => group.kind)).toEqual(['ip', 'good', 'card', 'post']);
    expect(snapshot.groups.find((group) => group.kind === 'ip')?.results).toEqual([
      expect.objectContaining({ id: 'hoshina', label: '호시나 미오', ipId: 'hoshina' }),
    ]);
    expect(snapshot.groups.find((group) => group.kind === 'post')?.results).toEqual([
      expect.objectContaining({ id: 'p3', label: expect.stringContaining('미오 1주년') }),
    ]);
  });

  it('maps Supabase RPC results into ordered public result groups', async () => {
    mocks.isConfigured = true;
    mocks.rpc.mockResolvedValue({
      data: [
        {
          kind: 'good',
          id: 'g2',
          label: '화산강림 청명 아크릴 스탠드',
          subtitle: '화산강림 · 아크릴 스탠드',
          ip_id: 'hwasan',
          ip_title: '화산강림',
          image_path: null,
          bg: 'good-bg',
          accent: '#8B5CFF',
          score: 0.9,
        },
        {
          kind: 'ip',
          id: 'hwasan',
          label: '화산강림',
          subtitle: '로맨스판타지 · 리디 · 로판',
          ip_id: 'hwasan',
          ip_title: '화산강림',
          image_path: null,
          bg: 'ip-bg',
          accent: '#8B5CFF',
          score: 1,
        },
        {
          kind: 'card',
          id: 'c2',
          label: '화산의 검',
          subtitle: '화산강림 · SSR',
          ip_id: 'hwasan',
          ip_title: '화산강림',
          image_path: null,
          bg: 'card-bg',
          accent: '#8B5CFF',
          score: 0.8,
        },
        {
          kind: 'post',
          id: '00000000-0000-4000-8000-000000000015',
          label: '화산 팝업 후기',
          subtitle: '화산강림 · #후기',
          ip_id: 'hwasan',
          ip_title: '화산강림',
          image_path: null,
          bg: null,
          accent: '#8B5CFF',
          score: 0.7,
        },
        {
          kind: 'tag',
          id: '후기',
          label: '#후기',
          subtitle: '커뮤니티 태그',
          ip_id: null,
          ip_title: null,
          image_path: null,
          bg: null,
          accent: '#8B5CFF',
          score: 0.6,
        },
        {
          kind: 'unknown',
          id: 'ignored',
          label: 'ignored',
          subtitle: null,
          ip_id: null,
          ip_title: null,
          image_path: null,
          bg: null,
          accent: null,
          score: 0,
        },
      ],
      error: null,
    });

    const snapshot = await getSearchSnapshot('  화산  ');

    expect(mocks.rpc).toHaveBeenCalledWith('search_public_content', {
      search_query: '화산',
      per_group_limit: 6,
    });
    expect(snapshot).toEqual({
      source: 'supabase',
      query: '화산',
      total: 5,
      groups: [
        expect.objectContaining({ kind: 'ip', label: 'IP', results: [expect.objectContaining({ id: 'hwasan' })] }),
        expect.objectContaining({ kind: 'good', label: '굿즈', results: [expect.objectContaining({ id: 'g2' })] }),
        expect.objectContaining({ kind: 'card', label: '카드', results: [expect.objectContaining({ id: 'c2' })] }),
        expect.objectContaining({ kind: 'post', label: '포스트', results: [expect.objectContaining({ id: '00000000-0000-4000-8000-000000000015' })] }),
        expect.objectContaining({ kind: 'tag', label: '태그', results: [expect.objectContaining({ id: '후기' })] }),
      ],
    });
  });
});
