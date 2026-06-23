import { notFound } from 'next/navigation';
import { IpDetail } from '@/components/screens/IpDetail';
import { getCatalogIpDetail } from '@/lib/catalog';
import { getIpFollowState } from '@/lib/ip-follow.server';

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function Page({ params, searchParams }: PageProps) {
  const { id } = await params;
  const [detail, followState] = await Promise.all([
    getCatalogIpDetail(id),
    getIpFollowState(id),
  ]);

  if (!detail) notFound();

  const query = (await searchParams) ?? {};

  return <IpDetail detail={detail} followState={followState} followError={firstParam(query.follow_error) === '1'} />;
}
