'use client';

import { useEffect, type ReactNode } from 'react';
import { Icon } from './Icon';

export interface ModalProps {
  children: ReactNode;
  onClose: () => void;
  narrow?: boolean;
}

export function Modal({ children, onClose, narrow }: ModalProps) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', k);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', k);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'rgba(4,3,10,.74)',
        backdropFilter: 'blur(8px)',
        display: 'grid',
        placeItems: 'center',
        padding: 20,
        animation: 'rise .3s ease',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="card"
        style={{
          width: narrow ? 'min(420px, 94vw)' : 'min(720px, 94vw)',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '26px 28px',
          borderRadius: 'var(--r-lg)',
          borderColor: 'var(--line-2)',
          boxShadow: 'var(--shadow)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: -8 }}>
          <button className="icon-btn" onClick={onClose}>
            <Icon name="close" size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
