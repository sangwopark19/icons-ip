'use client';

import { useRef, type MouseEvent } from 'react';
import type { Card, Ip } from '@/lib/data';
import { RARITY_META } from '@/lib/rarity';
import { Icon } from './Icon';
import { RarityBadge } from './RarityBadge';

export interface CollectibleProps {
  card: Card;
  ip?: Pick<Ip, 'title' | 'glyph'> | null;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

export function Collectible({ card, ip, size = 'md', onClick }: CollectibleProps) {
  const ref = useRef<HTMLDivElement>(null);
  const info = RARITY_META[card.rarity];

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    el.style.transform = `perspective(800px) rotateY(${(px - 0.5) * 16}deg) rotateX(${(0.5 - py) * 16}deg) translateY(-4px)`;
    const foil = el.querySelector<HTMLDivElement>('.foil');
    if (foil && info.foil) {
      foil.style.opacity = '0.9';
      foil.style.backgroundPosition = `${px * 100}% ${py * 100}%`;
    }
  };

  const reset = () => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = '';
    const foil = el.querySelector<HTMLDivElement>('.foil');
    if (foil) foil.style.opacity = '0';
  };

  const w = size === 'lg' ? 'min(300px, 78vw)' : size === 'sm' ? 132 : 'min(184px, 100%)';

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={reset}
      onClick={onClick}
      style={{ width: w, transition: 'transform .25s ease', cursor: onClick ? 'pointer' : 'inherit', transformStyle: 'preserve-3d' }}
    >
      <div
        style={{
          position: 'relative',
          aspectRatio: '3 / 4.2',
          borderRadius: 16,
          overflow: 'hidden',
          background: card.bg,
          border: `1.5px solid ${info.color}`,
          boxShadow: card.owned ? `0 16px 40px -14px ${info.color}77` : '0 12px 30px -16px #000',
          filter: card.owned ? 'none' : 'grayscale(.85) brightness(.5)',
        }}
      >
        <div className="sheen" />
        <div className="foil" style={{ opacity: 0 }} />
        {/* top */}
        <div style={{ position: 'absolute', top: 10, left: 10, right: 10, display: 'flex', justifyContent: 'space-between', zIndex: 4 }}>
          <RarityBadge r={card.rarity} />
          <span className="mono" style={{ fontSize: 10, color: 'rgba(255,255,255,.85)' }}>{card.no}</span>
        </div>
        {/* glyph */}
        <div className="glyph" style={{ fontSize: size === 'lg' ? 42 : 26, whiteSpace: 'pre-line', opacity: 0.95 }}>
          {ip?.glyph}
        </div>
        {/* bottom */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            padding: '22px 12px 11px',
            zIndex: 4,
            background: 'linear-gradient(transparent, rgba(0,0,0,.78))',
          }}
        >
          <div style={{ fontWeight: 700, fontSize: size === 'lg' ? 15 : 12.5, lineHeight: 1.2 }}>{card.name}</div>
          <div className="mono" style={{ fontSize: 10, color: 'rgba(255,255,255,.7)', marginTop: 3 }}>{ip?.title}</div>
        </div>
        {!card.owned && (
          <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', zIndex: 5 }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                fontSize: 11,
                fontWeight: 600,
                padding: '5px 10px',
                borderRadius: 99,
                background: 'rgba(0,0,0,.55)',
                border: '1px solid var(--line-2)',
              }}
            >
              <Icon name="lock" size={12} /> 미보유
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
