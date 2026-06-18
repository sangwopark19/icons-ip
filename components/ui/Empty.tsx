import { Icon } from './Icon';

export interface EmptyProps {
  icon: string;
  text: string;
  sub?: string;
  action?: string;
  onAction?: () => void;
}

export function Empty({ icon, text, sub, action, onAction }: EmptyProps) {
  return (
    <div className="col" style={{ alignItems: 'center', textAlign: 'center', padding: '72px 20px', gap: 12 }}>
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 20,
          display: 'grid',
          placeItems: 'center',
          background: 'var(--surface)',
          border: '1px solid var(--line-2)',
          color: 'var(--violet-2)',
        }}
      >
        <Icon name={icon} size={28} />
      </div>
      <div style={{ fontWeight: 600, fontSize: 16, marginTop: 4 }}>{text}</div>
      {sub && <div className="muted" style={{ fontSize: 14 }}>{sub}</div>}
      {action && (
        <button className="btn btn-holo btn-sm" style={{ marginTop: 8 }} onClick={onAction}>
          {action}
        </button>
      )}
    </div>
  );
}
