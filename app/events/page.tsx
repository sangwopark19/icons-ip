import { Events } from '@/components/screens/Events';
import { getCatalogSnapshot } from '@/lib/catalog';

export default async function Page({ searchParams }: { searchParams: Promise<{ ip?: string | string[] }> }) {
  const catalog = await getCatalogSnapshot();
  const ipParam = (await searchParams).ip;
  const requestedIp = Array.isArray(ipParam) ? ipParam[0] : ipParam;
  const initialIpId = catalog.ips.some((ip) => ip.id === requestedIp) ? requestedIp : undefined;
  return <Events catalog={catalog} initialIpId={initialIpId} />;
}
