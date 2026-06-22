import { Login } from '@/components/screens/Login';
import { authErrorMessage, isOnboarded, safeNextPath } from '@/lib/auth/onboarding';
import { getCurrentAuthState } from '@/lib/auth/server';
import { redirect } from 'next/navigation';

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function Page({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};
  const next = safeNextPath(firstParam(params.next));
  const initialMode = firstParam(params.mode) === 'signup' ? 'signup' : 'signin';
  const initialError = authErrorMessage(firstParam(params.auth_error));
  const auth = await getCurrentAuthState();

  if (auth.user) {
    if (isOnboarded(auth.profile, auth.user.email)) redirect(next);
    redirect(`/onboarding?next=${encodeURIComponent(next)}`);
  }

  return <Login initialError={initialError} initialMode={initialMode} isConfigured={auth.isConfigured} next={next} />;
}
