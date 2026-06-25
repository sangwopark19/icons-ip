import { Search } from '@/components/screens/Search';
import { getSearchSnapshot } from '@/lib/search';

interface PageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export default async function Page({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};
  const snapshot = await getSearchSnapshot(params.q);
  return <Search key={snapshot.query} snapshot={snapshot} />;
}
