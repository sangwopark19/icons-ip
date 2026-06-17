import type { CSSProperties, ReactNode } from 'react';

export interface PosterProps {
  bg: string;
  glyph?: string;
  ratio?: string;
  radius?: string | number;
  children?: ReactNode;
  style?: CSSProperties;
}

export function Poster({ bg, glyph, ratio = '3 / 4', radius, children, style }: PosterProps) {
  return (
    <div className="poster" style={{ aspectRatio: ratio, background: bg, borderRadius: radius, ...style }}>
      <div className="sheen" />
      {glyph && (
        <div className="glyph" style={{ fontSize: 'clamp(20px,4vw,34px)', whiteSpace: 'pre-line' }}>
          {glyph}
        </div>
      )}
      {children}
    </div>
  );
}
