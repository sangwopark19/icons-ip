'use client';

import { useActionState, useId, useState } from 'react';
import { signInWithEmailAction, signUpWithEmailAction, type AuthActionState } from '@/app/login/actions';

type LoginMode = 'signin' | 'signup';

interface LoginProps {
  initialError?: string;
  initialMode: LoginMode;
  isConfigured: boolean;
  next: string;
}

const emptyState: AuthActionState = {};

function Field({
  error,
  label,
  name,
  placeholder,
  type = 'text',
}: {
  error?: string;
  label: string;
  name: string;
  placeholder?: string;
  type?: string;
}) {
  const inputId = useId();
  const errorId = `${inputId}-error`;

  return (
    <label className="col" style={{ gap: 8 }}>
      <span className="mono" style={{ fontSize: 12, color: 'var(--dim)' }}>
        {label}
      </span>
      <input
        aria-describedby={error ? errorId : undefined}
        aria-invalid={Boolean(error)}
        id={inputId}
        name={name}
        type={type}
        placeholder={placeholder}
        style={{
          height: 48,
          borderRadius: 12,
          border: '1px solid var(--line-2)',
          background: 'var(--bg-2)',
          padding: '0 16px',
          color: 'var(--text)',
          fontSize: 15,
          fontFamily: 'inherit',
          outline: 'none',
        }}
        onFocus={(e) => (e.target.style.borderColor = 'var(--violet)')}
        onBlur={(e) => (e.target.style.borderColor = 'var(--line-2)')}
      />
      {error && (
        <span id={errorId} style={{ color: 'var(--pink)', fontSize: 12.5, fontWeight: 600 }}>
          {error}
        </span>
      )}
    </label>
  );
}

export function Login({ initialError, initialMode, isConfigured, next }: LoginProps) {
  const [mode, setMode] = useState<LoginMode>(initialMode);
  const [signInState, signInAction, signInPending] = useActionState(signInWithEmailAction, emptyState);
  const [signUpState, signUpAction, signUpPending] = useActionState(signUpWithEmailAction, emptyState);
  const isSignUp = mode === 'signup';
  const state = isSignUp ? signUpState : signInState;
  const pending = isSignUp ? signUpPending : signInPending;
  const formError = state.errors?.form ?? (state.message ? undefined : initialError);

  return (
    <div className="screen" style={{ display: 'grid', placeItems: 'center', minHeight: '100vh' }}>
      <div className="card rise" style={{ width: 'min(420px, 92vw)', padding: '40px 36px', borderRadius: 'var(--r-lg)', borderColor: 'var(--line-2)' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="brand holo-text" style={{ fontSize: 34, justifyContent: 'center' }}>
            ICONS
          </div>
          <p className="faint mono" style={{ fontSize: 12, marginTop: 8, letterSpacing: '.1em' }}>
            SUBCULTURE FANDOM PLATFORM
          </p>
        </div>

        <div className="row" style={{ gap: 8, marginTop: 28 }}>
          {(['signin', 'signup'] as const).map((item) => (
            <button
              key={item}
              type="button"
              className={mode === item ? 'btn btn-holo' : 'btn btn-ghost'}
              onClick={() => setMode(item)}
              style={{ flex: 1, height: 42 }}
            >
              {item === 'signin' ? '로그인' : '회원가입'}
            </button>
          ))}
        </div>

        <form action={isSignUp ? signUpAction : signInAction} className="col" style={{ gap: 14, marginTop: 18 }}>
          <input type="hidden" name="next" value={next} />
          <Field error={state.errors?.email} label="이메일" name="email" placeholder="you@icons.gg" type="email" />
          <Field error={state.errors?.password} label="비밀번호" name="password" placeholder="비밀번호" type="password" />
          {formError && (
            <div className="card" role="alert" style={{ padding: 12, borderRadius: 12, color: 'var(--pink)', fontSize: 13.5, fontWeight: 700 }}>
              {formError}
            </div>
          )}
          {state.message && (
            <div className="card" role="status" style={{ padding: 12, borderRadius: 12, color: 'var(--mint)', fontSize: 13.5, fontWeight: 700 }}>
              {state.message}
            </div>
          )}
          <button className="btn btn-holo" disabled={!isConfigured || pending} style={{ width: '100%', marginTop: 6 }}>
            {pending ? '처리 중' : isSignUp ? '회원가입' : '로그인'}
          </button>
        </form>

        <div className="row" style={{ gap: 14, margin: '22px 0' }}>
          <div className="divider" style={{ flex: 1 }} />
          <span className="faint" style={{ fontSize: 12 }}>
            또는
          </span>
          <div className="divider" style={{ flex: 1 }} />
        </div>
        <button className="btn btn-ghost" disabled style={{ width: '100%' }}>
          Google로 계속하기
        </button>
        <button className="btn" disabled style={{ width: '100%', marginTop: 10, background: '#FEE500', color: '#191600', opacity: 0.55 }}>
          카카오로 시작하기
        </button>
        <button className="btn btn-ghost" disabled style={{ width: '100%', marginTop: 10 }}>
          Apple로 계속하기
        </button>
      </div>
    </div>
  );
}
