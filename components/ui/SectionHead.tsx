import Link from 'next/link';
import { Icon } from './Icon';

export interface SectionHeadProps {
  eyebrow?: string;
  title: string;
  desc?: string;
  action?: string;
  href?: string;
  onAction?: () => void;
}

export function SectionHead({ eyebrow, title, desc, action, href, onAction }: SectionHeadProps) {
  return (
    <div className="between" style={{ marginBottom: 28, alignItems: 'flex-end', flexWrap: 'wrap', gap: 18 }}>
      <div>
        {eyebrow && <div className="eyebrow" style={{ marginBottom: 14 }}>{eyebrow}</div>}
        <h2 className="h-lg">{title}</h2>
        {desc && <p className="muted" style={{ marginTop: 10, maxWidth: 520 }}>{desc}</p>}
      </div>
      {action && href && (
        <Link className="btn btn-ghost btn-sm" href={href}>
          {action} <Icon name="arrow" size={15} />
        </Link>
      )}
      {action && !href && (
        <button className="btn btn-ghost btn-sm" onClick={onAction}>
          {action} <Icon name="arrow" size={15} />
        </button>
      )}
    </div>
  );
}
