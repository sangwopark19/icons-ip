import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { signUpWithEmailAction } from './actions';

const AUTH_SIGNUP_RESEND_COOKIE_NAME = 'icons_auth_signup_resend';
const AUTH_NEXT_COOKIE_NAME = 'icons_auth_next';
const TEST_SIGNUP_RESEND_SECRET = 'test-signup-resend-secret-with-enough-entropy';
const ORIGINAL_SIGNUP_RESEND_SECRET = process.env.AUTH_SIGNUP_RESEND_SECRET;

const mocks = vi.hoisted(() => ({
  isConfigured: true,
  headers: new Map<string, string>(),
  cookies: new Map<string, string>(),
  cookieSetCalls: [] as Array<{ name: string; value: string; options?: Record<string, unknown> }>,
  signUp: vi.fn(),
  resend: vi.fn(),
}));

vi.mock('@/lib/supabase/config', () => ({
  getSupabaseConfig: () => ({ isConfigured: mocks.isConfigured }),
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: () => ({
    auth: {
      signUp: mocks.signUp,
      resend: mocks.resend,
    },
  }),
}));

vi.mock('@/lib/auth/onboarding', async () => await import('../../lib/auth/onboarding'));

vi.mock('@/lib/auth/server', () => ({
  getProfileForUser: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  redirect: (path: string) => {
    throw new Error(`NEXT_REDIRECT:${path}`);
  },
}));

vi.mock('next/headers', () => ({
  headers: async () => ({
    get: (name: string) => mocks.headers.get(name.toLowerCase()) ?? null,
  }),
  cookies: async () => ({
    get: (name: string) => {
      const value = mocks.cookies.get(name);
      return value === undefined ? undefined : { name, value };
    },
    set: (name: string, value: string, options?: Record<string, unknown>) => {
      mocks.cookieSetCalls.push({ name, value, options });
      if (options?.maxAge === 0) {
        mocks.cookies.delete(name);
        return;
      }
      mocks.cookies.set(name, value);
    },
  }),
}));

function formData(email = 'Fan@Icons.gg') {
  const data = new FormData();
  data.set('email', email);
  data.set('password', 'password1234');
  data.set('next', '/community?sort=hot');
  return data;
}

async function submitSignup(email = 'Fan@Icons.gg') {
  return await signUpWithEmailAction({}, formData(email));
}

function latestCookieSet(name: string) {
  return mocks.cookieSetCalls.findLast((call) => call.name === name);
}

function decodeSignedCookiePayload(value: string) {
  const parts = value.split('.');
  expect(parts).toHaveLength(2);
  expect(parts[0]).toBeTruthy();
  expect(parts[1]).toBeTruthy();
  return JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8')) as Record<string, unknown>;
}

describe('signUpWithEmailAction signup confirmation resend', () => {
  beforeEach(() => {
    process.env.AUTH_SIGNUP_RESEND_SECRET = TEST_SIGNUP_RESEND_SECRET;
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-23T00:00:00.000Z'));
    mocks.isConfigured = true;
    mocks.headers = new Map<string, string>([['origin', 'https://icons-ip.vercel.app']]);
    mocks.cookies.clear();
    mocks.cookieSetCalls.length = 0;
    mocks.signUp.mockReset();
    mocks.resend.mockReset();
    mocks.signUp.mockResolvedValue({ data: { user: { id: 'user-1' }, session: null }, error: null });
    mocks.resend.mockResolvedValue({ data: { user: null, session: null }, error: null });
  });

  afterEach(() => {
    vi.useRealTimers();
    if (ORIGINAL_SIGNUP_RESEND_SECRET === undefined) {
      delete process.env.AUTH_SIGNUP_RESEND_SECRET;
    } else {
      process.env.AUTH_SIGNUP_RESEND_SECRET = ORIGINAL_SIGNUP_RESEND_SECRET;
    }
  });

  it('starts the resend window with a signed cookie after the initial signup without storing the raw email', async () => {
    const state = await submitSignup('Fan@Icons.gg');

    expect(state.message).toContain('가입 확인 메일');
    expect(mocks.signUp).toHaveBeenCalledOnce();
    expect(mocks.resend).not.toHaveBeenCalled();

    const resendCookie = latestCookieSet(AUTH_SIGNUP_RESEND_COOKIE_NAME);
    expect(resendCookie?.value).toBeTruthy();
    expect(resendCookie?.options).toMatchObject({
      httpOnly: true,
      maxAge: 24 * 60 * 60,
      path: '/login',
      sameSite: 'lax',
      secure: true,
    });

    const payload = decodeSignedCookiePayload(resendCookie?.value ?? '');
    expect(Object.keys(payload).sort()).toEqual(['emailHash', 'resendCount', 'windowStartedAt']);
    expect(payload.emailHash).toEqual(expect.any(String));
    expect(payload.emailHash).not.toBe('fan@icons.gg');
    expect(payload.resendCount).toBe(0);
    expect(payload.windowStartedAt).toBe(Date.now());
    expect(JSON.stringify(payload)).not.toContain('Fan@Icons.gg');
    expect(JSON.stringify(payload)).not.toContain('fan@icons.gg');
  });

  it('resends the signup confirmation for the same email inside the resend window', async () => {
    await submitSignup('Fan@Icons.gg');
    mocks.signUp.mockClear();

    const state = await submitSignup('fan@icons.gg');

    expect(state.message).toContain('새 확인 메일');
    expect(mocks.signUp).not.toHaveBeenCalled();
    expect(mocks.resend).toHaveBeenCalledWith({
      type: 'signup',
      email: 'fan@icons.gg',
      options: {
        emailRedirectTo: 'https://icons-ip.vercel.app/auth/callback',
      },
    });

    const nextCookie = latestCookieSet(AUTH_NEXT_COOKIE_NAME);
    expect(nextCookie).toMatchObject({
      name: AUTH_NEXT_COOKIE_NAME,
      value: encodeURIComponent('/community?sort=hot'),
      options: expect.objectContaining({
        httpOnly: true,
        path: '/auth/callback',
        sameSite: 'lax',
        secure: true,
      }),
    });
  });

  it('blocks further resend attempts for 10 minutes after three resends', async () => {
    await submitSignup();
    await submitSignup();
    await submitSignup();
    await submitSignup();
    mocks.signUp.mockClear();
    mocks.resend.mockClear();

    const state = await submitSignup();

    expect(state.errors?.form).toContain('10분 후');
    expect(mocks.signUp).not.toHaveBeenCalled();
    expect(mocks.resend).not.toHaveBeenCalled();
  });

  it('resends instead of calling signup again after the 10 minute cooldown expires', async () => {
    await submitSignup();
    await submitSignup();
    await submitSignup();
    await submitSignup();
    mocks.signUp.mockClear();
    mocks.resend.mockClear();

    vi.advanceTimersByTime(10 * 60 * 1000);

    const state = await submitSignup();

    expect(state.message).toContain('새 확인 메일');
    expect(mocks.signUp).not.toHaveBeenCalled();
    expect(mocks.resend).toHaveBeenCalledOnce();
    const payload = decodeSignedCookiePayload(latestCookieSet(AUTH_SIGNUP_RESEND_COOKIE_NAME)?.value ?? '');
    expect(payload.resendCount).toBe(1);
    expect(payload.windowStartedAt).toBe(Date.now());
  });

  it('ignores a tampered resend cookie and falls back to the signup path', async () => {
    await submitSignup();
    const validCookie = latestCookieSet(AUTH_SIGNUP_RESEND_COOKIE_NAME)?.value;
    expect(validCookie).toBeTruthy();
    mocks.cookies.set(AUTH_SIGNUP_RESEND_COOKIE_NAME, `${validCookie}tampered`);
    mocks.signUp.mockClear();
    mocks.resend.mockClear();

    const state = await submitSignup();

    expect(state.message).toContain('가입 확인 메일');
    expect(mocks.signUp).toHaveBeenCalledOnce();
    expect(mocks.resend).not.toHaveBeenCalled();
  });

  it('maps resend rate-limit errors to the existing Korean signup guidance', async () => {
    await submitSignup();
    mocks.signUp.mockClear();
    mocks.resend.mockResolvedValueOnce({
      data: { user: null, session: null },
      error: { code: 'over_email_send_rate_limit', message: 'rate limit' },
    });

    const state = await submitSignup();

    expect(state.errors?.form).toContain('확인 메일 요청이 너무 많습니다');
    expect(mocks.signUp).not.toHaveBeenCalled();
    const payload = decodeSignedCookiePayload(latestCookieSet(AUTH_SIGNUP_RESEND_COOKIE_NAME)?.value ?? '');
    expect(payload.resendCount).toBe(1);
  });

  it('blocks locally after three resend attempts even when Supabase returns resend errors', async () => {
    await submitSignup();
    mocks.signUp.mockClear();
    mocks.resend.mockResolvedValue({
      data: { user: null, session: null },
      error: { code: 'over_email_send_rate_limit', message: 'rate limit' },
    });

    await submitSignup();
    await submitSignup();
    await submitSignup();
    mocks.resend.mockClear();

    const state = await submitSignup();

    expect(state.errors?.form).toContain('10분 후');
    expect(mocks.signUp).not.toHaveBeenCalled();
    expect(mocks.resend).not.toHaveBeenCalled();
  });

  it('attempts a resend and returns a success-like message for existing-account signup errors', async () => {
    mocks.signUp.mockResolvedValueOnce({
      data: { user: null, session: null },
      error: { code: 'user_already_exists', message: 'User already registered' },
    });

    const state = await submitSignup('Fan@Icons.gg');

    expect(state.message).toContain('확인 메일');
    expect(state.errors).toBeUndefined();
    expect(mocks.resend).toHaveBeenCalledWith({
      type: 'signup',
      email: 'fan@icons.gg',
      options: {
        emailRedirectTo: 'https://icons-ip.vercel.app/auth/callback',
      },
    });
    const payload = decodeSignedCookiePayload(latestCookieSet(AUTH_SIGNUP_RESEND_COOKIE_NAME)?.value ?? '');
    expect(payload.resendCount).toBe(1);
  });
});
