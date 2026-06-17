import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Refreshes the Supabase auth session on every request so it stays valid for
 * Server Components. Intentionally does NOT redirect unauthenticated users —
 * ICONS is a publicly browsable fandom site, so all pages stay open.
 *
 * No-op when Supabase env vars are absent (scaffolding stage), keeping the app
 * fully functional on mock data without a configured backend.
 */
export async function updateSession(request: NextRequest) {
  const supabaseResponse = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return supabaseResponse;

  let response = supabaseResponse;
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  // IMPORTANT: keep getUser() directly after createServerClient — it refreshes the session.
  await supabase.auth.getUser();

  return response;
}
