'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { isOnboarded, onboardingPath, safeNextPath } from '@/lib/auth/onboarding';
import { getCurrentAuthState } from '@/lib/auth/server';
import { normalizeIpFollowIntent } from '@/lib/ip-follow';
import { createClient } from '@/lib/supabase/server';

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === 'string' ? value : '';
}

function loginPath(next: string) {
  return `/login?next=${encodeURIComponent(safeNextPath(next))}`;
}

function followErrorPath(next: string) {
  const url = new URL(safeNextPath(next), 'https://icons.local');
  url.searchParams.set('follow_error', '1');
  return `${url.pathname}${url.search}${url.hash}`;
}

export async function toggleIpFollowAction(formData: FormData) {
  const ipId = readString(formData, 'ipId').trim();
  const fallbackNext = ipId ? `/ip/${encodeURIComponent(ipId)}` : '/ip';
  const rawNext = formData.get('next');
  const next = typeof rawNext === 'string' && rawNext.trim() ? safeNextPath(rawNext) : fallbackNext;

  if (!ipId) redirect('/ip');

  const auth = await getCurrentAuthState();

  if (!auth.isConfigured || !auth.user) {
    redirect(loginPath(next));
  }

  if (!isOnboarded(auth.profile, auth.user.email)) {
    redirect(onboardingPath(next));
  }

  const supabase = await createClient();
  const intent = normalizeIpFollowIntent(formData.get('intent'));
  const rpcName = intent === 'unfollow' ? 'unfollow_ip' : 'follow_ip';
  const { error } = await supabase.rpc(rpcName, { target_ip_id: ipId });

  if (error) redirect(followErrorPath(next));

  revalidatePath('/');
  revalidatePath('/ip');
  revalidatePath(`/ip/${ipId}`);
  redirect(next);
}
