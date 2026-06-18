export type RarityKey = 'N' | 'R' | 'SR' | 'SSR' | 'HOLO';

export interface Rarity {
  label: string;
  color: string;
  foil: boolean;
}

export const RARITY_META: Record<RarityKey, Rarity> = {
  N: { label: 'N', color: '#7E7AA0', foil: false },
  R: { label: 'R', color: '#2DE2FF', foil: false },
  SR: { label: 'SR', color: '#8B5CFF', foil: false },
  SSR: { label: 'SSR', color: '#FF4D9D', foil: true },
  HOLO: { label: 'HOLO', color: '#C6FF3D', foil: true },
};
