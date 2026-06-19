import { Events } from '@/components/screens/Events';
import { getCatalogSnapshot } from '@/lib/catalog';

export default async function Page() {
  const catalog = await getCatalogSnapshot();
  return <Events catalog={catalog} />;
}
