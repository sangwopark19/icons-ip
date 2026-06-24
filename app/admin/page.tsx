import { notFound, redirect } from 'next/navigation';
import { Admin } from '@/components/screens/Admin';
import { getAdminCatalogRecords } from '@/lib/admin/catalog.server';
import { getCurrentAdminAuthState } from '@/lib/auth/admin';
import { getCatalogSnapshot } from '@/lib/catalog';

export default async function AdminPage() {
  const auth = await getCurrentAdminAuthState();

  if (!auth.isConfigured || !auth.user) {
    redirect(`/login?next=${encodeURIComponent('/admin')}`);
  }

  if (!auth.isStaff) {
    notFound();
  }

  const [catalog, records] = await Promise.all([
    getCatalogSnapshot(),
    getAdminCatalogRecords(),
  ]);

  return (
    <Admin
      admin={{
        email: auth.user.email,
        role: auth.role ?? 'staff',
      }}
      catalog={catalog}
      records={records}
    />
  );
}
