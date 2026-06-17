import { DATA, type RarityKey } from '@/lib/data';

export function RarityBadge({ r }: { r: RarityKey }) {
  const info = DATA.RARITY[r];
  return (
    <span
      className="mono"
      style={{
        fontSize: 10.5,
        fontWeight: 700,
        letterSpacing: '.06em',
        padding: '3px 7px',
        borderRadius: 6,
        color: '#0A0813',
        background: info.color,
        boxShadow: `0 0 12px ${info.color}88`,
      }}
    >
      {info.label}
    </span>
  );
}
