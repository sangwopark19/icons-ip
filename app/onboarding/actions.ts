'use server';

import { redirect } from 'next/navigation';
import { safeNextPath } from '@/lib/auth/onboarding';
import { getSupabaseConfig } from '@/lib/supabase/config';
import { createClient } from '@/lib/supabase/server';

export interface OnboardingActionState {
  errors?: {
    nickname?: string;
    birthDate?: string;
    terms?: string;
    privacy?: string;
    form?: string;
  };
}

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === 'string' ? value : '';
}

function isFutureDate(value: string) {
  const birthDate = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(birthDate.getTime())) return true;

  const today = new Date();
  const todayUtc = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  return birthDate > todayUtc;
}

export async function completeOnboardingAction(
  _state: OnboardingActionState,
  formData: FormData,
): Promise<OnboardingActionState> {
  const nickname = readString(formData, 'nickname').trim();
  const birthDate = readString(formData, 'birthDate');
  const next = safeNextPath(formData.get('next'));
  const terms = formData.get('terms') === 'on';
  const privacy = formData.get('privacy') === 'on';
  const marketing = formData.get('marketing') === 'on';
  const errors: NonNullable<OnboardingActionState['errors']> = {};

  if (!nickname) errors.nickname = '닉네임을 입력해주세요.';
  if (!birthDate || isFutureDate(birthDate)) errors.birthDate = '생년월일을 확인해주세요.';
  if (!terms) errors.terms = '필수 약관에 동의해주세요.';
  if (!privacy) errors.privacy = '개인정보 처리방침에 동의해주세요.';

  if (Object.keys(errors).length) return { errors };

  const { isConfigured } = getSupabaseConfig();
  if (!isConfigured) return { errors: { form: 'Supabase 환경변수를 설정한 뒤 온보딩을 완료할 수 있습니다.' } };

  const supabase = await createClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  const user = userData.user;

  if (userError || !user) return { errors: { form: '로그인이 필요합니다.' } };

  const { error } = await supabase
    .from('profiles')
    .update({
      email: user.email ?? null,
      nickname,
      birth_date: birthDate,
      consents: { terms, privacy, marketing },
      onboarded_at: new Date().toISOString(),
    })
    .eq('id', user.id)
    .select('id')
    .single();

  if (error?.code === '23505') return { errors: { nickname: '이미 사용 중인 닉네임입니다.' } };
  if (error) return { errors: { form: '프로필을 저장하지 못했습니다. 다시 시도해주세요.' } };

  redirect(next);
}
