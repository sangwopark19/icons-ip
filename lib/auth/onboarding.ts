export interface OnboardingConsents {
  terms?: boolean | null;
  privacy?: boolean | null;
  marketing?: boolean | null;
}

export interface ProfileForOnboarding {
  email?: string | null;
  nickname?: string | null;
  birth_date?: string | null;
  consents?: OnboardingConsents | null;
  onboarded_at?: string | null;
}

export function isOnboarded(profile: ProfileForOnboarding | null | undefined, authEmail?: string | null): boolean {
  if (!profile) return false;
  if (!(profile.email ?? authEmail)?.trim()) return false;
  if (!profile.nickname?.trim()) return false;
  if (!profile.birth_date) return false;
  if (!profile.onboarded_at) return false;
  if (profile.consents?.terms !== true) return false;
  if (profile.consents?.privacy !== true) return false;

  const birthDate = new Date(`${profile.birth_date}T00:00:00.000Z`);
  if (Number.isNaN(birthDate.getTime())) return false;

  const today = new Date();
  const todayUtc = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  return birthDate <= todayUtc;
}

export function safeNextPath(value: FormDataEntryValue | string | null | undefined): string {
  if (typeof value !== 'string') return '/';

  let decoded: string;
  try {
    decoded = decodeURIComponent(value);
  } catch {
    return '/';
  }

  if (decoded.includes('\\')) return '/';
  if (!decoded.startsWith('/') || decoded.startsWith('//')) return '/';

  const sameOrigin = 'https://icons.local';
  const url = new URL(decoded, sameOrigin);
  if (url.origin !== sameOrigin) return '/';

  return `${url.pathname}${url.search}${url.hash}`;
}

export function nextPathWithSearch(pathname: string, searchParams: Pick<URLSearchParams, 'toString'>): string {
  const query = searchParams.toString();
  return query ? `${pathname}?${query}` : pathname;
}
