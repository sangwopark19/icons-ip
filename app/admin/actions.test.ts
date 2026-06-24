import { beforeEach, describe, expect, it, vi } from 'vitest';
import { upsertAdminGoodAction } from './actions';
import type { CatalogSnapshot } from '@/lib/catalog';

const mocks = vi.hoisted(() => ({
  adminState: {
    isConfigured: true,
    user: { id: 'staff-1', email: 'staff@icons.gg' },
    role: 'staff' as 'user' | 'staff' | 'admin',
    isStaff: true,
  } as {
    isConfigured: boolean;
    user: { id: string; email: string | null } | null;
    role: 'user' | 'staff' | 'admin' | null;
    isStaff: boolean;
  },
  catalog: null as CatalogSnapshot | null,
  rpc: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock('@/lib/auth/admin', () => ({
  getCurrentAdminAuthState: () => mocks.adminState,
}));
vi.mock('@/lib/admin/catalog', async () => await import('../../lib/admin/catalog'));
vi.mock('@/lib/catalog', () => ({
  getCatalogSnapshot: () => mocks.catalog,
}));
vi.mock('@/lib/supabase/server', () => ({
  createClient: () => ({
    rpc: mocks.rpc,
  }),
}));
vi.mock('next/cache', () => ({
  revalidatePath: mocks.revalidatePath,
}));
vi.mock('next/navigation', () => ({
  redirect: (path: string) => {
    throw new Error(`NEXT_REDIRECT:${path}`);
  },
}));

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
  goods: [],
  cards: [],
  events: [],
};

function goodForm() {
  const formData = new FormData();
  formData.set('id', 'g100');
  formData.set('ipId', 'hwasan');
  formData.set('name', '화산강림 아크릴 스탠드');
  formData.set('type', '아크릴 스탠드');
  formData.set('price', '22000');
  formData.set('badge', '신상');
  formData.set('stock', 'ok');
  formData.set('stockQty', '12');
  return formData;
}

describe('admin catalog actions', () => {
  beforeEach(() => {
    mocks.adminState = {
      isConfigured: true,
      user: { id: 'staff-1', email: 'staff@icons.gg' },
      role: 'staff',
      isStaff: true,
    };
    mocks.catalog = catalog;
    mocks.rpc.mockReset();
    mocks.revalidatePath.mockReset();
    mocks.rpc.mockResolvedValue({ data: null, error: null });
  });

  it('redirects unauthenticated users to login with the admin next path', async () => {
    mocks.adminState = { isConfigured: true, user: null, role: null, isStaff: false };

    await expect(upsertAdminGoodAction({}, goodForm())).rejects.toThrow(
      'NEXT_REDIRECT:/login?next=%2Fadmin',
    );
    expect(mocks.rpc).not.toHaveBeenCalled();
  });

  it('blocks authenticated non-staff users without writing', async () => {
    mocks.adminState = {
      isConfigured: true,
      user: { id: 'user-1', email: 'fan@icons.gg' },
      role: 'user',
      isStaff: false,
    };

    await expect(upsertAdminGoodAction({}, goodForm())).resolves.toEqual({
      errors: { form: '관리자 권한이 필요합니다.' },
    });
    expect(mocks.rpc).not.toHaveBeenCalled();
  });

  it('returns validation errors before calling the admin RPC', async () => {
    const formData = goodForm();
    formData.set('ipId', 'missing');
    formData.set('price', '-1');

    await expect(upsertAdminGoodAction({}, formData)).resolves.toEqual({
      errors: {
        ipId: '등록된 IP를 선택해주세요.',
        price: '가격은 0 이상의 정수여야 합니다.',
      },
    });
    expect(mocks.rpc).not.toHaveBeenCalled();
  });

  it('calls the admin good RPC and refreshes catalog surfaces', async () => {
    const formData = goodForm();
    formData.set('previousIpId', 'lumen');

    await expect(upsertAdminGoodAction({}, formData)).resolves.toEqual({
      message: '굿즈를 저장했습니다.',
    });

    expect(mocks.rpc).toHaveBeenCalledWith('admin_upsert_good', {
      target_id: 'g100',
      target_ip_id: 'hwasan',
      target_name: '화산강림 아크릴 스탠드',
      target_type: '아크릴 스탠드',
      target_price: 22000,
      target_badge: '신상',
      target_stock: 'ok',
      target_stock_qty: 12,
      target_bg: null,
      target_image_path: null,
    });
    expect(mocks.revalidatePath).toHaveBeenCalledWith('/');
    expect(mocks.revalidatePath).toHaveBeenCalledWith('/ip');
    expect(mocks.revalidatePath).toHaveBeenCalledWith('/ip/hwasan');
    expect(mocks.revalidatePath).toHaveBeenCalledWith('/ip/lumen');
    expect(mocks.revalidatePath).toHaveBeenCalledWith('/shop');
    expect(mocks.revalidatePath).toHaveBeenCalledWith('/admin');
  });
});
