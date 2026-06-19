import { notFound } from 'next/navigation';
import { IpDetail } from '@/components/screens/IpDetail';
import { getCatalogIp } from '@/lib/catalog';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ip = await getCatalogIp(id);

  if (!ip) notFound();

  return <IpDetail ip={ip} />;
}
