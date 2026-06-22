'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { signOutAction } from '@/app/login/actions';
import { nextPathWithSearch } from '@/lib/auth/onboarding';
import { createClient } from '@/lib/supabase/client';
import { getSupabaseConfig } from '@/lib/supabase/config';

export function AuthButton() {
  const router = useRouter();
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    if (!getSupabaseConfig().isConfigured) return;

    const supabase = createClient();
    let mounted = true;

    supabase.auth.getUser().then(({ data }) => {
      if (mounted) setIsSignedIn(Boolean(data.user));
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsSignedIn(Boolean(session?.user));
    });

    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

  if (isSignedIn) {
    return (
      <form action={signOutAction}>
        <button className="btn btn-ghost btn-sm hide-mob" style={{ height: 40 }}>
          로그아웃
        </button>
      </form>
    );
  }

  return (
    <button
      className="btn btn-ghost btn-sm hide-mob"
      onClick={() =>
        router.push(
          `/login?next=${encodeURIComponent(
            nextPathWithSearch(window.location.pathname, new URLSearchParams(window.location.search)),
          )}`,
        )
      }
      style={{ height: 40 }}
    >
      로그인
    </button>
  );
}
