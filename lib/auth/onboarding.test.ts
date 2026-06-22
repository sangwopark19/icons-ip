import { describe, expect, it } from 'vitest';
import { isOnboarded, nextPathWithSearch, safeNextPath, type ProfileForOnboarding } from './onboarding';

const completeProfile = (overrides: Partial<ProfileForOnboarding> = {}): ProfileForOnboarding => ({
  email: 'fan@icons.gg',
  nickname: 'neonfan',
  birth_date: '2000-01-01',
  consents: {
    terms: true,
    privacy: true,
    marketing: false,
  },
  onboarded_at: '2026-06-22T00:00:00.000Z',
  ...overrides,
});

describe('isOnboarded', () => {
  it('returns false when profile is missing', () => {
    expect(isOnboarded(null)).toBe(false);
  });

  it.each([
    ['email', { email: null }],
    ['nickname', { nickname: '   ' }],
    ['birth date', { birth_date: null }],
    ['onboarded timestamp', { onboarded_at: null }],
    ['terms consent', { consents: { terms: false, privacy: true, marketing: false } }],
    ['privacy consent', { consents: { terms: true, privacy: false, marketing: false } }],
  ])('returns false when %s is missing', (_label, overrides) => {
    expect(isOnboarded(completeProfile(overrides))).toBe(false);
  });

  it('returns false when birth date is in the future', () => {
    expect(isOnboarded(completeProfile({ birth_date: '2999-01-01' }))).toBe(false);
  });

  it('accepts the authenticated user email when the profile email is missing', () => {
    expect(isOnboarded(completeProfile({ email: null }), 'fan@icons.gg')).toBe(true);
  });

  it('returns true when required fields are complete and marketing consent is false', () => {
    expect(isOnboarded(completeProfile())).toBe(true);
  });
});

describe('safeNextPath', () => {
  it('keeps safe relative paths', () => {
    expect(safeNextPath('/community')).toBe('/community');
  });

  it('keeps safe relative paths with query and hash', () => {
    expect(safeNextPath('/community?sort=hot#feed')).toBe('/community?sort=hot#feed');
  });

  it.each([
    'https://evil.example',
    '//evil.example',
    '/\\\\evil.example',
    '/%5C%5Cevil.example',
    '/%2f%2fevil.example',
    '',
    null,
    undefined,
  ])('falls back for unsafe path %s', (value) => {
    expect(safeNextPath(value)).toBe('/');
  });
});

describe('nextPathWithSearch', () => {
  it('returns the pathname when search params are empty', () => {
    expect(nextPathWithSearch('/community', new URLSearchParams())).toBe('/community');
  });

  it('keeps the current query string for auth redirects', () => {
    expect(nextPathWithSearch('/community', new URLSearchParams({ channel: '전체', sort: '인기순' }))).toBe(
      '/community?channel=%EC%A0%84%EC%B2%B4&sort=%EC%9D%B8%EA%B8%B0%EC%88%9C',
    );
  });
});
