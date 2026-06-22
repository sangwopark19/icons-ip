import { notFound } from 'next/navigation';
import { IpDetail } from '@/components/screens/IpDetail';
import { getCatalogIpDetail } from '@/lib/catalog';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const detail = await getCatalogIpDetail(id);

  if (!detail) notFound();

  return <IpDetail detail={detail} />;
}
