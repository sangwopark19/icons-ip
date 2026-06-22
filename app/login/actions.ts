'use server';

import { redirect } from 'next/navigation';
import { isOnboarded, safeNextPath } from '@/lib/auth/onboarding';
import { getProfileForUser } from '@/lib/auth/server';
import { getSupabaseConfig } from '@/lib/supabase/config';
import { createClient } from '@/lib/supabase/server';

export interface AuthActionState {
  message?: string;
  errors?: {
    email?: string;
    password?: string;
    form?: string;
  };
}

interface Credentials {
  email: string;
  password: string;
  next: string;
}

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === 'string' ? value : '';
}

function validateCredentials(formData: FormData): { ok: true; credentials: Credentials } | { ok: false; state: AuthActionState } {
  const email = readString(formData, 'email').trim();
  const password = readString(formData, 'password');
  const next = safeNextPath(formData.get('next'));
  const errors: NonNullable<AuthActionState['errors']> = {};

  if (!email) errors.email = '이메일을 입력해주세요.';
  if (!password) errors.password = '비밀번호를 입력해주세요.';

  if (Object.keys(errors).length) return { ok: false, state: { errors } };
  return { ok: true, credentials: { email, password, next } };
}

function onboardingPath(next: string) {
  return `/onboarding?next=${encodeURIComponent(next)}`;
}

export async function signInWithEmailAction(_state: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const parsed = validateCredentials(formData);
  if (!parsed.ok) return parsed.state;
  const { email, next, password } = parsed.credentials;

  const { isConfigured } = getSupabaseConfig();
  if (!isConfigured) return { errors: { form: 'Supabase 환경변수를 설정한 뒤 로그인할 수 있습니다.' } };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    return { errors: { form: '이메일 또는 비밀번호를 확인해주세요.' } };
  }

  const profile = await getProfileForUser(supabase, data.user.id);
  redirect(isOnboarded(profile, data.user.email) ? next : onboardingPath(next));
}

export async function signUpWithEmailAction(_state: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const parsed = validateCredentials(formData);
  if (!parsed.ok) return parsed.state;
  const { email, next, password } = parsed.credentials;

  const { isConfigured } = getSupabaseConfig();
  if (!isConfigured) return { errors: { form: 'Supabase 환경변수를 설정한 뒤 가입할 수 있습니다.' } };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error || !data.user) {
    return { errors: { form: '가입 정보를 확인해주세요.' } };
  }

  if (!data.session) {
    return { message: '가입 확인 메일을 보냈습니다. 메일 확인 후 로그인해주세요.' };
  }

  redirect(onboardingPath(next));
}

export async function signOutAction() {
  const { isConfigured } = getSupabaseConfig();
  if (isConfigured) {
    const supabase = await createClient();
    await supabase.auth.signOut({ scope: 'local' });
  }

  redirect('/');
}
