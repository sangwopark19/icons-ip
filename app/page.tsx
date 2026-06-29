import { Home } from '@/components/screens/Home';
import { getHomeSnapshot } from '@/lib/catalog';

export default async function Page() {
  const home = await getHomeSnapshot();
  return <Home catalog={home.catalog} postPreviewByIpId={home.postPreviewByIpId} />;
}
