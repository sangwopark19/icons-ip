'use client';

import { useEffect, useRef, type CSSProperties, type PointerEvent } from 'react';
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
  const shellRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const foilRef = useRef<HTMLDivElement>(null);
  const rotationYRef = useRef(0);
  const draggingRef = useRef(false);
  const velocityRef = useRef(0);
  const lastDragRef = useRef({ x: 0, t: 0 });
  const settleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dragAbortRef = useRef<AbortController | null>(null);
  const info = RARITY_META[card.rarity];
  const canInspect = size === 'lg' && card.owned;
  const canFoil = card.owned && info.foil;

  const reducedMotion = () =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

  const setTransform = (rotateX: number, rotateY: number, lift = 0, transition = 'transform .18s ease-out') => {
    const el = cardRef.current;
    if (!el) return;
    el.style.transition = reducedMotion() ? 'none' : transition;
    el.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(${lift}px)`;
  };

  const setFoil = (px: number, py: number, visible: boolean) => {
    const foil = foilRef.current;
    if (!foil) return;
    foil.style.opacity = visible && canFoil ? '0.9' : '0';
    foil.style.backgroundPosition = `${px * 100}% ${py * 100}%`;
  };

  const pointInCard = (e: PointerEvent<HTMLDivElement>) => {
    const el = shellRef.current;
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return {
      px: clamp((e.clientX - r.left) / r.width, 0, 1),
      py: clamp((e.clientY - r.top) / r.height, 0, 1),
    };
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const p = pointInCard(e);
    if (!p) return;

    if (canInspect && draggingRef.current) {
      if (e.cancelable) e.preventDefault();
      const now = e.timeStamp;
      const dx = e.clientX - lastDragRef.current.x;
      const dt = Math.max(now - lastDragRef.current.t, 16);
      const nextY = rotationYRef.current + dx * 0.58;
      velocityRef.current = (nextY - rotationYRef.current) / dt;
      rotationYRef.current = nextY;
      lastDragRef.current = { x: e.clientX, t: now };
      setTransform((0.5 - p.py) * 14, rotationYRef.current, -4, 'none');
      setFoil(p.px, p.py, true);
      return;
    }

    const hoverY = canInspect ? rotationYRef.current + (p.px - 0.5) * 12 : (p.px - 0.5) * 16;
    const hoverX = (0.5 - p.py) * 16;
    setTransform(hoverX, hoverY, -4);
    setFoil(p.px, p.py, true);
  };

  const reset = () => {
    if (draggingRef.current) return;
    setTransform(0, canInspect ? rotationYRef.current : 0, 0, 'transform .25s ease');
    setFoil(0.5, 0.5, false);
  };

  const settleRotation = () => {
    const current = rotationYRef.current;
    const velocity = velocityRef.current;
    const projectedExtra = reducedMotion() ? 0 : clamp(velocity * 420, -630, 630);
    let snapped = Math.round((current + projectedExtra) / 180) * 180;
    const delta = snapped - current;
    if (Math.abs(delta) > 720) snapped = current + Math.sign(delta) * 720;
    snapped = Math.round(snapped / 180) * 180;
    const distance = Math.abs(snapped - current);
    const duration = reducedMotion() ? 0 : clamp(distance * 1.1, 260, 1000);

    rotationYRef.current = snapped;
    setTransform(0, snapped, 0, duration ? `transform ${duration}ms cubic-bezier(.16,.9,.24,1)` : 'none');
    setFoil(0.5, 0.5, false);

    if (settleTimerRef.current) clearTimeout(settleTimerRef.current);
    settleTimerRef.current = setTimeout(() => {
      const normalized = ((rotationYRef.current % 360) + 360) % 360;
      rotationYRef.current = normalized === 180 ? 180 : 0;
      setTransform(0, rotationYRef.current, 0, 'none');
    }, duration);
  };

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (!canInspect) return;
    draggingRef.current = true;
    velocityRef.current = 0;
    lastDragRef.current = { x: e.clientX, t: e.timeStamp };
    if (settleTimerRef.current) clearTimeout(settleTimerRef.current);
    dragAbortRef.current?.abort();
    dragAbortRef.current = new AbortController();
    window.addEventListener('pointerup', finishWindowDrag, { signal: dragAbortRef.current.signal });
    window.addEventListener('pointercancel', finishWindowDrag, { signal: dragAbortRef.current.signal });
    window.addEventListener('blur', finishWindowDrag, { signal: dragAbortRef.current.signal });
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  function finishWindowDrag() {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    dragAbortRef.current?.abort();
    dragAbortRef.current = null;
    settleRotation();
  }

  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    dragAbortRef.current?.abort();
    dragAbortRef.current = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
    settleRotation();
  };

  useEffect(() => {
    return () => dragAbortRef.current?.abort();
  }, []);

  const w = size === 'lg' ? 'min(300px, 78vw)' : size === 'sm' ? 132 : 184;
  const faceStyle: CSSProperties = {
    position: 'absolute',
    inset: 0,
    borderRadius: 16,
    overflow: 'hidden',
    background: card.bg,
    border: `1.5px solid ${info.color}`,
    boxShadow: card.owned ? `0 16px 40px -14px ${info.color}77` : '0 12px 30px -16px #000',
    filter: card.owned ? 'none' : 'grayscale(.85) brightness(.5)',
    backfaceVisibility: 'hidden',
    WebkitBackfaceVisibility: 'hidden',
  };

  return (
    <div
      ref={shellRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onPointerLeave={reset}
      onClick={onClick}
      style={{
        width: w,
        maxWidth: '100%',
        perspective: canInspect ? 980 : 800,
        cursor: onClick ? 'pointer' : canInspect ? 'grab' : 'inherit',
        transformStyle: 'preserve-3d',
        touchAction: canInspect ? 'none' : 'manipulation',
        userSelect: 'none',
      }}
    >
      <div
        ref={cardRef}
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '3 / 4.2',
          transition: 'transform .25s ease',
          transformStyle: 'preserve-3d',
          willChange: 'transform',
        }}
      >
        <div style={faceStyle}>
          <div className="sheen" />
          <div ref={foilRef} className="foil" style={{ opacity: 0 }} />
          {ip?.glyph && (
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                inset: '16% 10% 24%',
                display: 'grid',
                placeItems: 'center',
                zIndex: 2,
                pointerEvents: 'none',
                color: 'rgba(255,255,255,.92)',
                fontFamily: 'var(--ff-display)',
                fontSize: size === 'lg' ? 42 : size === 'sm' ? 24 : 30,
                fontWeight: 700,
                lineHeight: 0.92,
                textAlign: 'center',
                whiteSpace: 'pre-line',
                opacity: card.owned ? 0.24 : 0.42,
                mixBlendMode: 'screen',
                textShadow: '0 4px 24px rgba(0,0,0,.42)',
              }}
            >
              {ip.glyph}
            </div>
          )}
          {/* top */}
          <div style={{ position: 'absolute', top: 10, left: 10, right: 10, display: 'flex', justifyContent: 'space-between', zIndex: 4 }}>
            <RarityBadge r={card.rarity} />
            <span className="mono" style={{ fontSize: 10, color: 'rgba(255,255,255,.85)' }}>{card.no}</span>
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

        {canInspect && (
          <div
            style={{
              ...faceStyle,
              transform: 'rotateY(180deg)',
              background:
                'radial-gradient(circle at 30% 20%, rgba(255,255,255,.16), transparent 28%), linear-gradient(135deg, rgba(45,226,255,.24), rgba(139,92,255,.35), rgba(255,77,157,.22)), #0A0813',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <div className="sheen" />
            <div
              style={{
                position: 'absolute',
                inset: 14,
                border: '1px solid rgba(255,255,255,.24)',
                borderRadius: 12,
              }}
            />
            <div style={{ position: 'relative', zIndex: 3, textAlign: 'center', padding: 18 }}>
              <div className="mono" style={{ fontSize: 10, color: info.color, letterSpacing: '.16em', fontWeight: 700 }}>
                {info.label} DIGITAL CARD
              </div>
              <div className="holo-text" style={{ fontFamily: 'var(--ff-display)', fontSize: 32, fontWeight: 700, marginTop: 18 }}>
                ICONS
              </div>
              <div style={{ fontWeight: 700, fontSize: 14, marginTop: 18 }}>{ip?.title}</div>
              <div className="mono muted" style={{ fontSize: 11, marginTop: 6 }}>No.{card.no}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
