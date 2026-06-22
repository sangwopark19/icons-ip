import { NextResponse, type NextRequest } from 'next/server';
import { authErrorLoginPath, isOnboarded, onboardingPath, safeNextPath } from '@/lib/auth/onboarding';
import { getProfileForUser } from '@/lib/auth/server';
import { getSupabaseConfig } from '@/lib/supabase/config';
import { createClient } from '@/lib/supabase/server';

function redirectTo(request: NextRequest, path: string) {
  return NextResponse.redirect(new URL(path, request.url));
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const next = safeNextPath(request.nextUrl.searchParams.get('next'));
  const providerError = request.nextUrl.searchParams.get('error_code') ?? request.nextUrl.searchParams.get('error');

  if (providerError) return redirectTo(request, authErrorLoginPath(providerError, next));
  if (!code) return redirectTo(request, authErrorLoginPath('missing_code', next));

  const { isConfigured } = getSupabaseConfig();
  if (!isConfigured) return redirectTo(request, authErrorLoginPath('provider_disabled', next));

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return redirectTo(request, authErrorLoginPath(error.code ?? 'exchange_failed', next));

  const { data, error: userError } = await supabase.auth.getUser();
  if (userError || !data.user) return redirectTo(request, authErrorLoginPath('exchange_failed', next));

  const profile = await getProfileForUser(supabase, data.user.id);
  return redirectTo(request, isOnboarded(profile, data.user.email) ? next : onboardingPath(next));
}
