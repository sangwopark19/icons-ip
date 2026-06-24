import { describe, expect, it, vi } from 'vitest';
import { getCommunitySnapshot } from './community.server';
import type { CatalogSnapshot } from './catalog';

const mocks = vi.hoisted(() => ({
  catalog: null as CatalogSnapshot | null,
  client: null as unknown,
}));

vi.mock('server-only', () => ({}));
vi.mock('@/lib/data', async () => await import('./data'));
vi.mock('@/lib/community', async () => await import('./community'));
vi.mock('@/lib/catalog', () => ({
  getCatalogSnapshot: () => mocks.catalog,
}));
vi.mock('@/lib/supabase/server', () => ({
  createClient: () => mocks.client,
}));

type QueryRecord = {
  table: string;
  select?: string;
  selectOptions?: { count?: string; head?: boolean };
  eq: [string, unknown][];
  in: [string, unknown[]][];
  order: [string, { ascending?: boolean } | undefined][];
  limit?: number;
};

type QueryResult<T> = {
  data: T[] | null;
  count?: number | null;
  error: null;
};

interface RpcRecord {
  functionName: string;
  args: Record<string, unknown>;
}

interface CreateClientOptions {
  rpcRecords?: RpcRecord[];
  signedUrlFailures?: ReadonlySet<string>;
}

function createQuery<T extends Record<string, unknown>>(
  table: string,
  rows: T[],
  records: QueryRecord[],
) {
  const record: QueryRecord = { table, eq: [], in: [], order: [] };
  records.push(record);

  const query = {
    select(value: string, options?: { count?: string; head?: boolean }) {
      record.select = value;
      record.selectOptions = options;
      return query;
    },
    eq(column: string, value: unknown) {
      record.eq.push([column, value]);
      return query;
    },
    in(column: string, value: unknown[]) {
      record.in.push([column, value]);
      return query;
    },
    order(column: string, options?: { ascending?: boolean }) {
      record.order.push([column, options]);
      return query;
    },
    limit(value: number) {
      record.limit = value;
      return query;
    },
    then<TResult1 = QueryResult<T>, TResult2 = never>(
      onfulfilled?: ((value: QueryResult<T>) => TResult1 | PromiseLike<TResult1>) | null,
      onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
    ) {
      let data = rows;
      for (const [column, value] of record.eq) data = data.filter((row) => row[column] === value);
      for (const [column, values] of record.in) data = data.filter((row) => values.includes(row[column]));
      for (const [column, options] of record.order) {
        data = [...data].sort((a, b) => {
          const left = String(a[column] ?? '');
          const right = String(b[column] ?? '');
          return (options?.ascending === false ? -1 : 1) * left.localeCompare(right);
        });
      }
      if (typeof record.limit === 'number') data = data.slice(0, record.limit);
      return Promise.resolve({
        data: record.selectOptions?.head ? null : data,
        count: record.selectOptions?.count ? data.length : undefined,
        error: null,
      }).then(onfulfilled, onrejected);
    },
  };

  return query;
}

function createClient(records: QueryRecord[], options: CreateClientOptions = {}) {
  const rows = {
    posts: [
      {
        id: 'p1',
        user_id: 'u1',
        ip_id: 'hwasan',
        text: '첫 번째 포스트',
        tag: '후기',
        created_at: '2026-06-22T04:00:00.000Z',
        image_path: 'u1/community/p1.png',
        status: 'visible',
      },
      {
        id: 'hidden',
        user_id: 'u1',
        ip_id: 'hwasan',
        text: '숨김 포스트',
        tag: '숨김',
        created_at: '2026-06-22T05:00:00.000Z',
        image_path: 'u1/community/hidden.png',
        status: 'hidden',
      },
    ],
    public_profiles: [{ id: 'u1', nickname: 'neonfan' }],
    likes: [{ post_id: 'p1' }, { post_id: 'p1' }],
    comments: [{ post_id: 'p1' }],
  };

  return {
    from(table: keyof typeof rows) {
      return createQuery(table, rows[table], records);
    },
    async rpc(functionName: string, args: Record<string, unknown>) {
      options.rpcRecords?.push({ functionName, args });

      if (functionName !== 'community_post_reaction_counts') {
        return { data: null, error: { message: `Unexpected RPC: ${functionName}` } };
      }

      return {
        data: [{ post_id: 'p1', likes_count: 2, comments_count: 1 }],
        error: null,
      };
    },
    storage: {
      from(bucket: string) {
        return {
          async createSignedUrl(path: string, expiresIn: number) {
            if (options.signedUrlFailures?.has(path)) {
              return {
                data: null,
                error: { message: 'Object not found' },
              };
            }

            return {
              data: { signedUrl: `https://cdn.example/${bucket}/${path}?exp=${expiresIn}` },
              error: null,
            };
          },
        };
      },
    },
  };
}

const catalog: CatalogSnapshot = {
  source: 'supabase',
  verticals: [{ key: 'rofan', label: '로맨스판타지', color: '#8B5CFF' }],
  ips: [{
    id: 'hwasan',
    title: '화산강림',
    sub: '리디 · 로판',
    v: { key: 'rofan', label: '로맨스판타지', color: '#8B5CFF' },
    glyph: '화산',
    bg: 'bg',
    fans: 10,
    goods: 1,
    cards: 1,
    featured: true,
    tagline: '매화는 다시 핀다',
    synopsis: '화산파의 부활',
  }],
  goods: [{ id: 'g1', ip: 'hwasan', name: '아크릴', type: '굿즈', price: 1000, badge: null, stock: 'ok', img: 'img' }],
  cards: [],
  events: [],
};

describe('getCommunitySnapshot', () => {
  it('loads visible Supabase posts with safe author, reaction and signed image fields', async () => {
    const records: QueryRecord[] = [];
    const rpcRecords: RpcRecord[] = [];
    mocks.catalog = catalog;
    mocks.client = createClient(records, { rpcRecords });

    const snapshot = await getCommunitySnapshot();

    expect(snapshot.posts).toEqual([
      expect.objectContaining({
        id: 'p1',
        user: 'neonfan',
        ipId: 'hwasan',
        ipName: '화산강림',
        avatar: '#8B5CFF',
        text: '첫 번째 포스트',
        tag: '후기',
        likes: 2,
        comments: 1,
        img: 'https://cdn.example/user-uploads/u1/community/p1.png?exp=3600',
      }),
    ]);
    expect(snapshot.posts).not.toEqual(expect.arrayContaining([expect.objectContaining({ id: 'hidden' })]));
    expect(snapshot.posts[0]).not.toHaveProperty('image_path');
    expect(records.find((record) => record.table === 'posts')).toMatchObject({
      select: 'id,user_id,ip_id,text,tag,created_at,image_path,status',
      eq: [['status', 'visible']],
      order: [['created_at', { ascending: false }]],
      limit: 30,
    });
    expect(records.filter((record) => record.table === 'likes' || record.table === 'comments')).toEqual([]);
    expect(rpcRecords).toEqual([{
      functionName: 'community_post_reaction_counts',
      args: { target_post_ids: ['p1'] },
    }]);
  });

  it('omits a post image when signed URL creation fails without failing the public feed', async () => {
    const records: QueryRecord[] = [];
    const rpcRecords: RpcRecord[] = [];
    mocks.catalog = catalog;
    mocks.client = createClient(records, {
      rpcRecords,
      signedUrlFailures: new Set(['u1/community/p1.png']),
    });

    const snapshot = await getCommunitySnapshot();

    expect(snapshot.posts).toEqual([
      expect.objectContaining({
        id: 'p1',
        img: null,
      }),
    ]);
    expect(rpcRecords).toEqual([{
      functionName: 'community_post_reaction_counts',
      args: { target_post_ids: ['p1'] },
    }]);
  });
});
