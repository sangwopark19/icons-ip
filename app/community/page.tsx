import { Community } from '@/components/screens/Community';
import { getCurrentAuthState } from '@/lib/auth/server';
import { getCommunitySnapshot } from '@/lib/community.server';

export default async function Page() {
  const auth = await getCurrentAuthState();
  const snapshot = await getCommunitySnapshot({ viewerId: auth.user?.id ?? null });
  return <Community snapshot={snapshot} />;
}
