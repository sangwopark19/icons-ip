import { IpHub } from '@/components/screens/IpHub';
import { getCatalogSnapshot } from '@/lib/catalog';

export default async function Page() {
  const catalog = await getCatalogSnapshot();
  return <IpHub catalog={catalog} />;
}
