import { Home } from '@/components/screens/Home';
import { getCatalogSnapshot } from '@/lib/catalog';

export default async function Page() {
  const catalog = await getCatalogSnapshot();
  return <Home catalog={catalog} />;
}
