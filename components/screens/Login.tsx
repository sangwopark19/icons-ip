'use client';

import { useGo } from '@/components/shell/useGo';

function Field({ label, type = 'text', placeholder }: { label: string; type?: string; placeholder?: string }) {
  return (
    <label className="col" style={{ gap: 8 }}>
      <span className="mono" style={{ fontSize: 12, color: 'var(--dim)' }}>{label}</span>
      <input
        type={type}
        placeholder={placeholder}
        style={{ height: 48, borderRadius: 12, border: '1px solid var(--line-2)', background: 'var(--bg-2)', padding: '0 16px', color: 'var(--text)', fontSize: 15, fontFamily: 'inherit', outline: 'none' }}
        onFocus={(e) => (e.target.style.borderColor = 'var(--violet)')}
        onBlur={(e) => (e.target.style.borderColor = 'var(--line-2)')}
      />
    </label>
  );
}

export function Login() {
  const go = useGo();
  return (
    <div className="screen" style={{ display: 'grid', placeItems: 'center', minHeight: '100vh' }}>
      <div className="card rise" style={{ width: 'min(420px, 92vw)', padding: '40px 36px', borderRadius: 'var(--r-lg)', borderColor: 'var(--line-2)' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="brand holo-text" style={{ fontSize: 34, justifyContent: 'center' }}>ICONS</div>
          <p className="faint mono" style={{ fontSize: 12, marginTop: 8, letterSpacing: '.1em' }}>SUBCULTURE FANDOM PLATFORM</p>
        </div>
        <div className="col" style={{ gap: 14, marginTop: 30 }}>
          <Field label="이메일" placeholder="you@icons.gg" />
          <Field label="비밀번호" type="password" placeholder="••••••••" />
          <button className="btn btn-holo" style={{ width: '100%', marginTop: 6 }} onClick={() => go('home')}>로그인</button>
        </div>
        <div className="row" style={{ gap: 14, margin: '22px 0' }}>
          <div className="divider" style={{ flex: 1 }} />
          <span className="faint" style={{ fontSize: 12 }}>또는</span>
          <div className="divider" style={{ flex: 1 }} />
        </div>
        <button className="btn" style={{ width: '100%', background: '#FEE500', color: '#191600' }}>카카오로 시작하기</button>
        <button className="btn btn-ghost" style={{ width: '100%', marginTop: 10 }}>Apple로 계속하기</button>
        <p className="muted" style={{ textAlign: 'center', fontSize: 13.5, marginTop: 24 }}>
          계정이 없으신가요? <span className="holo-text" style={{ fontWeight: 700, cursor: 'pointer' }}>회원가입</span>
        </p>
      </div>
    </div>
  );
}
