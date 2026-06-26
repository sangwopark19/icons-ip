import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();

function readRepoFile(path: string) {
  return readFileSync(join(root, path), 'utf8');
}

describe('home hero layout source contract', () => {
  it('keeps the first viewport hero as a full-bleed art layer instead of a framed card', () => {
    const homeSource = readRepoFile('components/screens/Home.tsx');
    const cssSource = readRepoFile('app/globals.css');

    expect(homeSource).toContain('className="home-hero-art-layer"');
    expect(homeSource).toContain('className="home-hero-content"');
    expect(homeSource).not.toContain('home-stat-row');
    expect(homeSource).not.toContain('home-hero-art"');

    expect(cssSource).toMatch(/\.home-hero\s*{[^}]*position:\s*relative[^}]*overflow:\s*hidden[^}]*display:\s*flex/s);
    expect(cssSource).toMatch(/\.home-hero-art-layer\s*{[^}]*position:\s*absolute[^}]*top:\s*0[^}]*right:\s*0[^}]*bottom:\s*0[^}]*width:\s*54%/s);
    expect(cssSource).not.toMatch(/\.home-hero-art\s*{[^}]*border:/s);
  });

  it('transitions IP selection as a layered opacity crossfade, not a remount scale-pop', () => {
    const homeSource = readRepoFile('components/screens/Home.tsx');
    const cssSource = readRepoFile('app/globals.css');

    // selecting an IP no longer remounts the hero art, label, or world section
    expect(homeSource).not.toContain('key={selectedIp.id}');
    // a two-layer opacity crossfade drives both the hero and the feature art
    expect(homeSource).toContain('<CrossfadeArt bg={selectedIp.bg} className="home-hero-art-bg"');
    expect(homeSource).toContain('<CrossfadeArt bg={ip.bg} className="home-ip-feature-bg"');
    // the scale-pop entrance is gone; layers fade in via a mount-time keyframe
    expect(cssSource).not.toContain('homeArtIn');
    expect(cssSource).toContain('@keyframes homeArtCrossfade');
    expect(cssSource).toMatch(/\.home-hero-art-bg,\s*\.home-ip-feature-bg\s*{[^}]*animation:\s*homeArtCrossfade/s);
  });

  it('keeps the lower home body aligned to the original favorite-first design', () => {
    const homeSource = readRepoFile('components/screens/Home.tsx');
    const cssSource = readRepoFile('app/globals.css');

    expect(homeSource).toContain('className="home-ip-feature-actions"');
    expect(homeSource).toContain('representativePost');
    expect(homeSource).toContain('사요 · 공식 굿즈');
    expect(homeSource).toContain('모아요 · 수집 카드');
    expect(homeSource).toContain('만나요 · 팝업·팬미팅');
    expect(homeSource).toContain('떠들어요 · 팬 커뮤니티');
    expect(homeSource).toContain('가입하고 내 덕질 시작하기');
    expect(homeSource).toContain('공식 라이선스 정품');
    expect(homeSource).toContain('한 곳에서 다');
    expect(homeSource).toContain('안전한 결제');

    expect(cssSource).toContain('.home-selection-stage');
    expect(cssSource).toContain('.home-breadth-band');
    expect(cssSource).toContain('.home-trust-grid');
    expect(cssSource).toContain('@keyframes homeSelectionIn');
    expect(cssSource).toContain('@keyframes pickerPulse');
  });
});
