import { Community } from '@/components/screens/Community';
import { getCurrentAuthState } from '@/lib/auth/server';
import { getCommunitySnapshot } from '@/lib/community.server';

export default async function Page({ searchParams }: { searchParams: Promise<{ ip?: string | string[] }> }) {
  const auth = await getCurrentAuthState();
  const snapshot = await getCommunitySnapshot({ viewerId: auth.user?.id ?? null, isStaff: auth.isStaff });
  const ipParam = (await searchParams).ip;
  const requestedIp = Array.isArray(ipParam) ? ipParam[0] : ipParam;
  const initialChannelId = snapshot.channels.some((channel) => channel.id === requestedIp) ? requestedIp : undefined;
  return <Community snapshot={snapshot} initialChannelId={initialChannelId} />;
}
