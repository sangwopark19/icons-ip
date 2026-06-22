import { Shop } from '@/components/screens/Shop';
import { getCatalogSnapshot } from '@/lib/catalog';

export default async function Page() {
  const catalog = await getCatalogSnapshot();
  return <Shop catalog={catalog} />;
}
