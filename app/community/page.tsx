import { Community } from '@/components/screens/Community';
import { getCommunitySnapshot } from '@/lib/community.server';

export default async function Page() {
  const snapshot = await getCommunitySnapshot();
  return <Community snapshot={snapshot} />;
}
