import { Binder } from '@/components/screens/Binder';
import { getCatalogSnapshot } from '@/lib/catalog';

export default async function Page() {
  const catalog = await getCatalogSnapshot();
  return <Binder catalog={catalog} />;
}
