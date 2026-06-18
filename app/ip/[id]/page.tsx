import { IpDetail } from '@/components/screens/IpDetail';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <IpDetail id={id} />;
}
