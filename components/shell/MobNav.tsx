'use client';

import { usePathname } from 'next/navigation';
import { MOB_ITEMS, isActive } from '@/lib/routes';
import { Icon } from '@/components/ui/Icon';
import { useGo } from './useGo';

export function MobNav() {
  const pathname = usePathname();
  const go = useGo();
  return (
    <div className="mobnav">
      {MOB_ITEMS.map((n) => (
        <button key={n.id} className={isActive(n.id, pathname) ? 'on' : ''} onClick={() => go(n.id)}>
          <Icon name={n.icon!} size={22} />
          <span>{n.label}</span>
        </button>
      ))}
    </div>
  );
}
