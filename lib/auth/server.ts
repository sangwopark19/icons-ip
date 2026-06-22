import 'server-only';

import { createClient } from '@/lib/supabase/server';
import { getSupabaseConfig } from '@/lib/supabase/config';
import type { OnboardingConsents, ProfileForOnboarding } from './onboarding';

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

interface ProfileRow {
  email: string | null;
  nickname: string | null;
  birth_date: string | null;
  consents: OnboardingConsents | null;
  onboarded_at: string | null;
}

export interface CurrentAuthState {
  isConfigured: boolean;
  user: {
    id: string;
    email: string | null;
  } | null;
  profile: ProfileForOnboarding | null;
}

export async function getProfileForUser(supabase: SupabaseServerClient, userId: string): Promise<ProfileForOnboarding | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('email,nickname,birth_date,consents,onboarded_at')
    .eq('id', userId)
    .maybeSingle<ProfileRow>();

  if (error || !data) return null;
  return data;
}

export async function getCurrentAuthState(): Promise<CurrentAuthState> {
  const { isConfigured } = getSupabaseConfig();
  if (!isConfigured) return { isConfigured: false, user: null, profile: null };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  const user = data.user;

  if (error || !user) return { isConfigured: true, user: null, profile: null };

  return {
    isConfigured: true,
    user: {
      id: user.id,
      email: user.email ?? null,
    },
    profile: await getProfileForUser(supabase, user.id),
  };
}
