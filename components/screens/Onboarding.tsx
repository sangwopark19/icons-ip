'use client';

import { useActionState } from 'react';
import { completeOnboardingAction, type OnboardingActionState } from '@/app/onboarding/actions';

interface OnboardingProps {
  birthDate: string;
  email: string;
  followedIpIds: string[];
  initialMarketing: boolean;
  isConfigured: boolean;
  next: string;
  nickname: string;
  recommendedIps: {
    color: string;
    fans: number;
    id: string;
    sub: string;
    tagline: string;
    title: string;
  }[];
}

const emptyState: OnboardingActionState = {};

function ErrorText({ children, id }: { children?: string; id: string }) {
  if (!children) return null;
  return (
    <span id={id} style={{ color: 'var(--pink)', fontSize: 12.5, fontWeight: 600 }}>
      {children}
    </span>
  );
}

export function Onboarding({
  birthDate,
  email,
  followedIpIds,
  initialMarketing,
  isConfigured,
  next,
  nickname,
  recommendedIps,
}: OnboardingProps) {
  const [state, action, pending] = useActionState(completeOnboardingAction, emptyState);
  const initiallyFollowed = new Set(followedIpIds);

  return (
    <div className="screen" style={{ display: 'grid', placeItems: 'center', minHeight: '100vh' }}>
      <div className="card rise" style={{ width: 'min(520px, 92vw)', padding: '40px 36px', borderRadius: 'var(--r-lg)', borderColor: 'var(--line-2)' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="brand holo-text" style={{ fontSize: 32, justifyContent: 'center' }}>
            ICONS
          </div>
          <p className="faint mono" style={{ fontSize: 12, marginTop: 8, letterSpacing: '.1em' }}>
            PROFILE SETUP
          </p>
        </div>

        <form action={action} className="col" style={{ gap: 16, marginTop: 28 }}>
          <input type="hidden" name="next" value={next} />

          <label className="col" style={{ gap: 8 }}>
            <span className="mono" style={{ fontSize: 12, color: 'var(--dim)' }}>
              이메일
            </span>
            <input
              disabled
              value={email}
              style={{ height: 48, borderRadius: 12, border: '1px solid var(--line-2)', background: 'var(--bg-2)', padding: '0 16px', color: 'var(--dim)', fontSize: 15, fontFamily: 'inherit' }}
            />
          </label>

          <label className="col" style={{ gap: 8 }}>
            <span className="mono" style={{ fontSize: 12, color: 'var(--dim)' }}>
              닉네임
            </span>
            <input
              aria-describedby={state.errors?.nickname ? 'nickname-error' : undefined}
              aria-invalid={Boolean(state.errors?.nickname)}
              defaultValue={nickname}
              id="nickname"
              name="nickname"
              style={{ height: 48, borderRadius: 12, border: '1px solid var(--line-2)', background: 'var(--bg-2)', padding: '0 16px', color: 'var(--text)', fontSize: 15, fontFamily: 'inherit', outline: 'none' }}
            />
            <ErrorText id="nickname-error">{state.errors?.nickname}</ErrorText>
          </label>

          <label className="col" style={{ gap: 8 }}>
            <span className="mono" style={{ fontSize: 12, color: 'var(--dim)' }}>
              생년월일
            </span>
            <input
              aria-describedby={state.errors?.birthDate ? 'birth-date-error' : undefined}
              aria-invalid={Boolean(state.errors?.birthDate)}
              defaultValue={birthDate}
              id="birthDate"
              name="birthDate"
              type="date"
              style={{ height: 48, borderRadius: 12, border: '1px solid var(--line-2)', background: 'var(--bg-2)', padding: '0 16px', color: 'var(--text)', fontSize: 15, fontFamily: 'inherit', outline: 'none' }}
            />
            <ErrorText id="birth-date-error">{state.errors?.birthDate}</ErrorText>
          </label>

          <div className="col" style={{ gap: 10 }}>
            <label className="row" style={{ gap: 10, justifyContent: 'flex-start', fontSize: 14 }}>
              <input
                aria-describedby={state.errors?.terms ? 'terms-error' : undefined}
                aria-invalid={Boolean(state.errors?.terms)}
                name="terms"
                type="checkbox"
              />
              필수 약관 동의
            </label>
            <ErrorText id="terms-error">{state.errors?.terms}</ErrorText>
            <label className="row" style={{ gap: 10, justifyContent: 'flex-start', fontSize: 14 }}>
              <input
                aria-describedby={state.errors?.privacy ? 'privacy-error' : undefined}
                aria-invalid={Boolean(state.errors?.privacy)}
                name="privacy"
                type="checkbox"
              />
              개인정보 처리방침 동의
            </label>
            <ErrorText id="privacy-error">{state.errors?.privacy}</ErrorText>
            <label className="row" style={{ gap: 10, justifyContent: 'flex-start', fontSize: 14 }}>
              <input defaultChecked={initialMarketing} name="marketing" type="checkbox" />
              마케팅 정보 수신 동의
            </label>
          </div>

          {recommendedIps.length > 0 && (
            <fieldset style={{ border: '1px solid var(--line)', borderRadius: 12, padding: 14 }}>
              <legend className="mono" style={{ padding: '0 6px', fontSize: 12, color: 'var(--dim)' }}>
                관심 IP
              </legend>
              <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
                {recommendedIps.map((ip) => (
                  <label
                    key={ip.id}
                    style={{
                      border: '1px solid var(--line)',
                      borderRadius: 10,
                      cursor: 'pointer',
                      display: 'grid',
                      gap: 6,
                      minHeight: 104,
                      padding: 12,
                    }}
                  >
                    <span className="row" style={{ alignItems: 'flex-start', gap: 10, justifyContent: 'space-between' }}>
                      <span className="col" style={{ gap: 3, minWidth: 0 }}>
                        <span style={{ fontSize: 14, fontWeight: 800 }}>{ip.title}</span>
                        <span className="faint" style={{ fontSize: 12 }}>{ip.sub}</span>
                      </span>
                      <input defaultChecked={initiallyFollowed.has(ip.id)} name="followIpIds" type="checkbox" value={ip.id} />
                      <input name="recommendedIpIds" type="hidden" value={ip.id} />
                    </span>
                    <span className="muted" style={{ fontSize: 12.5 }}>{ip.tagline}</span>
                    <span className="mono" style={{ color: ip.color, fontSize: 11 }}>{new Intl.NumberFormat('ko-KR').format(ip.fans)} 팬</span>
                  </label>
                ))}
              </div>
            </fieldset>
          )}

          {state.errors?.form && (
            <div className="card" role="alert" style={{ padding: 12, borderRadius: 12, color: 'var(--pink)', fontSize: 13.5, fontWeight: 700 }}>
              {state.errors.form}
            </div>
          )}

          <button className="btn btn-holo" disabled={!isConfigured || pending} style={{ width: '100%', marginTop: 4 }}>
            {pending ? '저장 중' : '완료'}
          </button>
        </form>
      </div>
    </div>
  );
}
