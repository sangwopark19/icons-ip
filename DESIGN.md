---
name: ICONS — Holographic Midnight
description: >
  다크 홀로그래픽 K-pop 팬덤·수집·커머스 디자인 시스템.
  base 정체성은 ICONS-오리지널(홀로 스펙트럼 · foil · 글래스모픽)이며 외부에서 이식할 수 없다.
  구조는 표면별로 Shopify(2-고도) · Revolut(돈 규율) · Spotify(앱쉘) · Runway(히어로)에서 차용한다.
  캔버스는 다크 단일이고, 결제·충전·가격 표면의 신뢰는 캔버스를 뒤집지 않고 다크 위 명료함으로 얻는다.

# 상태 범례
#   [구현됨]      코드에 존재 — app/globals.css 등에 근거(file:line). 코드가 진실.
#   [부분구현]    일부만 존재. 나머지는 차용 목표.
#   [차용·미구현]  도너에서 가져온 목표 구조. 아직 코드에 없음 — 에이전트는 클래스 존재를 가정하지 말 것.
#
# 토큰 진실원: app/globals.css 의 @theme 블록. 이 파일의 토큰과 코드가 충돌하면 코드가 진실이다.

canvas: dark-only            # [구현됨] 트랜잭션도 다크 위 명료함으로 신뢰 확보

colors:                      # [구현됨] app/globals.css:9-33
  bg: "#08060F"
  bg-2: "#0C0A18"
  surface: "#15112A"
  surface-2: "#1C1638"
  surface-3: "#261C4D"
  line: "rgba(255,255,255,0.07)"
  line-2: "rgba(255,255,255,0.13)"
  line-3: "rgba(255,255,255,0.22)"
  text: "#F4F1FF"
  dim: "#A9A2CC"
  faint: "#6F688F"
  violet: "#8B5CFF"
  violet-2: "#A981FF"
  pink: "#FF4D9D"
  cyan: "#2DE2FF"
  mint: "#38F0C0"
  lime: "#C6FF3D"
  amber: "#FFB23D"

gradients-effects:           # [구현됨] app/globals.css:82-85,106-118,251-261 — 유틸리티 미노출. 시그니처 하이프 어휘.
  holo: "linear-gradient(115deg,#2DE2FF 0%,#8B5CFF 34%,#FF4D9D 66%,#FFB23D 100%)"
  holo-soft: "linear-gradient(115deg, rgba(45,226,255,.25),rgba(139,92,255,.25),rgba(255,77,157,.25),rgba(255,178,61,.25))"
  shadow: "0 24px 60px -20px rgba(0,0,0,.7)"
  glow-v: "0 0 0 1px rgba(139,92,255,.4), 0 16px 48px -12px rgba(139,92,255,.45)"
  foil: "color-dodge 오버레이 + 220% 배경 스윕 (수집형 카드 시그니처)"
  atmos: "고정 배경 — 3개 radial 스펙트럼 블룸 위 #08060F"
  grain: "180px fractalNoise, overlay, opacity .5"

fonts:                       # [구현됨] app/globals.css:41-44 (next/font + Pretendard CDN)
  display: "Space Grotesk, Pretendard, sans-serif"
  body: "Pretendard, Space Grotesk, sans-serif"
  mono: "Space Mono, Pretendard, monospace"

typography:                  # [구현됨] app/globals.css:133-145,169 — 현행 클래스에서 도출
  h-xxl:   { font: display, size: "clamp(46px,9vw,104px)", weight: 700, lh: 1.05, ls: "-0.04em" }
  h-xl:    { font: display, size: "clamp(30px,4.6vw,52px)", weight: 700, lh: 1.05, ls: "-0.02em" }
  h-lg:    { font: display, size: "clamp(24px,3.2vw,36px)", weight: 700, lh: 1.05, ls: "-0.02em" }
  body:    { font: body,    size: "15–16px", weight: 400, lh: 1.5 }
  eyebrow: { font: mono,    size: "12px", ls: "0.22em", transform: uppercase, color: violet-2 }
  tag:     { font: mono,    size: "11px", ls: "0.04em", transform: uppercase, color: dim }
  btn:     { size: "15px",  weight: 600 }        # btn-sm 13px

rounded:                     # [구현됨] app/globals.css:35-39 (+ pill 999px)
  xs: "8px"
  sm: "12px"
  md: "18px"
  lg: "26px"
  xl: "36px"
  pill: "999px"

spacing:                     # [차용·미구현] 현재 비토큰(ad-hoc px + Tailwind). 실사용값 기반 제안 스케일.
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "24px"
  xl: "40px"
  section: "52px(mobile) / 76px(desktop)"       # app/globals.css:131,746 실측

layout:                      # [구현됨] app/globals.css:47,86-87
  maxw: "1240px"
  nav-h: "68px"
  breakpoint-nav: "1041px"

components:
  # ---- [구현됨] ----
  btn:            { status: 구현됨, ref: "globals.css:153-169", note: "pill. primary=white on ink, holo=애니 CTA, ghost=hairline, sm=38px" }
  chip:           { status: 구현됨, ref: "globals.css:172-181", note: "필터 pill. .on=반전, .on.accent=violet" }
  tag:            { status: 구현됨, ref: "globals.css:183-187", note: "mono 대문자 메타 라벨(희귀도·카테고리)" }
  card:           { status: 구현됨, ref: "globals.css:196-203", note: "surface→bg-2 그라데, hairline, .lift=hover -6px" }
  nav:            { status: 구현됨, ref: "globals.css:206-238", note: "글래스모픽 상단바 + <1041px 바텀바(.mobnav)" }
  poster:         { status: 구현됨, ref: "globals.css:241-254", note: "IP 키아트 플레이스홀더 + .sheen 스윕" }
  foil:           { status: 구현됨, ref: "globals.css:257-261", note: "수집형 카드 홀로 foil 오버레이 — 빌려올 수 없는 시그니처" }
  money-caption:  { status: 구현됨, ref: "globals.css:189-193; Binder.tsx:226", donor: Revolut, note: "가챠 확률공시·규제 문구. mono, faint" }
  hero-cinematic: { status: 구현됨, ref: "globals.css:596-612; IpDetail.tsx:115", donor: Runway, note: "IP 상세 풀블리드 시네마틱 히어로(art+shade+텍스트 오버레이). 이벤트·팝업 확장 가능" }
  # ---- [차용·미구현] 표면별 도너 ----
  tier-card:      { status: 차용·미구현, donor: Revolut, note: "충전금 tier. featured 변형은 violet 반전 강조" }
  input-lg:       { status: 차용·미구현, donor: Revolut, note: "결제/충전 입력 ≥52px, 명확한 focus 링" }
---

# ICONS — Holographic Midnight

> K-pop / IP 팬덤을 위한 수집형 카드 · 굿즈 · 가챠 · 예매 · 커뮤니티 플랫폼의 디자인 시스템.
> 이 문서는 에이전트가 코드를 만들 때 읽는 기계 판독용 스펙이다. 용어는 `CONTEXT.md`를 따른다.

## 1. Overview / 정체성

**Holographic Midnight**은 자정에 가까운 다크 캔버스 위에서 홀로그래픽 스펙트럼이 빛나는 시스템이다. 정서적 핵심은 **팬덤 하이프와 수집**이다 — 유저는 지갑을 쓰러 오는 게 아니라 자신이 좋아하는 IP 세계를 소비하러 온다. `{gradients-effects.holo}`, `{gradients-effects.foil}`, `{gradients-effects.atmos}`는 이 하이프를 만드는 엔진이며, **외부 어느 디자인 시스템에서도 이식할 수 없는 ICONS-오리지널 자산이다.** (분석 결과 Shopify·Revolut·Spotify·Runway·ElevenLabs 중 네온·foil·홀로그래픽·시머를 가진 시스템은 없었다. 오히려 다수가 장식적 그라데이션을 명시적으로 금지한다.)

구조(레이아웃·컴포넌트 규율)는 검증된 외부 시스템에서 **표면별로 차용**한다. 정체성은 유지하고 구조만 수입한다.

### 3원칙
- **공개 브라우징.** IP·굿즈·카드·이벤트·커뮤니티 읽기는 기본 공개. 로그인은 구매·가챠·예매·작성·팔로우 시점에만 요구. `[구현됨]`
- **다크 몰입 단일 캔버스.** 앱 전체가 다크다. 결제·충전조차 캔버스를 밝게 뒤집지 않는다. 신뢰는 다크 위 명료함으로 얻는다(§8·§9). `[구현됨]`
- **하이프와 신뢰의 고도 분리.** 같은 다크 위에서 두 고도가 공존한다 — 몰입 히어로(하이프)와 명료 트랜잭션(신뢰)은 톤·밀도·모션이 다르다. Shopify의 2-트랙 아이디어를 캔버스 반전 없이 차용. `[부분구현]`

## 2. Colors `[구현됨]`

> 토큰 진실원: `app/globals.css:9-33`. 아래는 역할 설명이다.

### 캔버스 사다리 (어두운 → 밝은 표면)
| 토큰 | 값 | 역할 |
|---|---|---|
| `{colors.bg}` | `#08060F` | 앱 바탕. `.bg-atmos`가 그 위에 스펙트럼 블룸을 깐다 |
| `{colors.bg-2}` | `#0C0A18` | 밴드/섹션 구분 바탕, 카드 그라데 하단 |
| `{colors.surface}` | `#15112A` | 카드/패널 기본 표면 |
| `{colors.surface-2}` | `#1C1638` | 한 단계 올라온 표면(포스터·활성 채널) |
| `{colors.surface-3}` | `#261C4D` | 최상단 표면·스크롤바 thumb |
| `{colors.line}`/`line-2`/`line-3` | white α .07/.13/.22 | hairline 3단계(기본·hover·강조) |

### 텍스트
| 토큰 | 값 | 역할 |
|---|---|---|
| `{colors.text}` | `#F4F1FF` | 본문·제목 |
| `{colors.dim}` | `#A9A2CC` | 보조 텍스트(`.muted`) |
| `{colors.faint}` | `#6F688F` | 3차·메타·규제 캡션(`.faint`) |

### 스펙트럼 (6색 + violet-2)
`{colors.violet}` `#8B5CFF` · `{colors.violet-2}` `#A981FF` · `{colors.pink}` `#FF4D9D` · `{colors.cyan}` `#2DE2FF` · `{colors.mint}` `#38F0C0` · `{colors.lime}` `#C6FF3D` · `{colors.amber}` `#FFB23D`

**언제 쓰고 언제 아끼는가:** 스펙트럼은 하이프의 연료다. **홀로 그라데(`{gradients-effects.holo}`)로 뭉쳐 쓸 때** 가장 강하다 — 브랜드 dot, `.holo-text`, `.btn-holo`, foil. **단색으로 흩뿌리면** 힘이 약해진다. 상태색으로는 `mint`=성공/확인(`.home-trust-check`), `pink`=알림 배지, `violet`=활성/포커스만 관습적으로 쓴다. 넓은 면을 스펙트럼으로 칠하지 말 것(§9).

## 3. Typography `[구현됨]`

3-패밀리 역할 분담. 진실원 `app/globals.css:41-44`.

- **Space Grotesk** (`{fonts.display}`) — 모든 디스플레이/헤드라인(`.h-xxl`/`.h-xl`/`.h-lg`, `.brand`). 기하학적 에너지가 하이프와 맞는다.
- **Pretendard** (`{fonts.body}`) — 모든 한글 본문·UI 텍스트. 한국어 가독성의 기준.
- **Space Mono** (`{fonts.mono}`) — `.eyebrow`, `.tag`, 숫자/가격/확률/카운트. 대문자 트래킹(`.22em`)이 테크·수집 메타의 목소리(Spotify식 대문자 라벨 관습과 정렬).

| 토큰 | 크기 | 용도 |
|---|---|---|
| `{typography.h-xxl}` | clamp(46→104px) | 히어로 헤드라인 |
| `{typography.h-xl}` | clamp(30→52px) | 섹션 오프너 |
| `{typography.h-lg}` | clamp(24→36px) | 카드/서브섹션 제목 |
| `{typography.body}` | 15–16px | 기본 본문 |
| `{typography.eyebrow}` | 12px mono | 섹션 위 아이브로(violet-2) |
| `{typography.tag}` | 11px mono | 희귀도·카테고리 태그 |

**원칙:** 디스플레이는 Space Grotesk, 본문은 Pretendard. 역할을 교차시키지 말 것. 숫자(가격·충전금·확률)는 mono로 정렬성을 확보한다(§8).

## 4. Spacing · Layout · Grid

- **컨테이너** `{layout.maxw}` 1240px, `.wrap` 좌우 24px 패딩. `[구현됨]`
- **내비 높이** `{layout.nav-h}` 68px. `[구현됨]`
- **섹션 리듬** `{spacing.section}` 데스크톱 76px / 모바일 52px. `[구현됨 app/globals.css:131,746]`
- **spacing 스케일** `{spacing.*}` — 현재 코드는 ad-hoc px + Tailwind 기본이다. 위 스케일(8/12/16/24/40)은 실사용값에서 도출한 **제안**이며 아직 토큰이 아니다. `[차용·미구현]`

레이아웃 그리드는 홈(`.home-world-layout`, `.home-action-grid`), 커뮤니티(`.community-layout`), 굿즈(`.shop-rail`) 등 표면별 grid 유틸이 `globals.css`에 이미 있다. `[구현됨]`

## 5. Shapes / Radius `[구현됨]`

`{rounded.xs}` 8 · `{rounded.sm}` 12 · `{rounded.md}` 18 · `{rounded.lg}` 26 · `{rounded.xl}` 36 · `{rounded.pill}` 999.

**버튼은 항상 `{rounded.pill}`.** 이 pill 어휘는 Shopify에서 차용한 것과 우연히 일치하며, 브랜드 규율로 고정한다 — 버튼을 둥근 사각형으로 만들지 말 것(§9). 카드는 `{rounded.lg}`, 포스터/썸네일은 `{rounded.md}` 계열.

## 6. Elevation & Depth — 시그니처 `[구현됨]`

이 섹션이 **빌려올 수 없는 하이프 엔진**이다. 진실원 `app/globals.css:82-85,106-118,251-261`.

| 효과 | 값/근거 | 용도 |
|---|---|---|
| `{gradients-effects.shadow}` | `globals.css:84` | 카드/모달 드롭 섀도 |
| `{gradients-effects.glow-v}` | `globals.css:85` | violet 글로우(홀로 CTA hover, 강조 표면) |
| `{gradients-effects.holo}` | `globals.css:82` | 스펙트럼 그라데 — dot·`.holo-text`·`.btn-holo` |
| `{gradients-effects.foil}` | `globals.css:257-261` | 수집형 카드 color-dodge 홀로 오버레이 |
| `.sheen` | `globals.css:251-254` | 포스터 대각 광택 스윕 |
| `.bg-atmos` / `.bg-grain` | `globals.css:106-118` | 고정 대기 배경 + 필름 그레인 |

깊이는 그림자만이 아니라 **빛(글로우·foil·sheen)**으로 만든다. 이것이 Spotify(무거운 그림자)·Revolut(색블록)·Runway(그림자 0)와 결정적으로 다른 지점이다.

## 7. Components `[구현됨]` / `[차용·미구현]`

frontmatter `components` 블록이 정본 인덱스다. 핵심 요약:

**[구현됨]**
- **버튼** `.btn` + `-primary`(white on ink) / `-holo`(홀로 애니 CTA) / `-ghost`(hairline) / `-sm`. `globals.css:153-169`
- **칩/태그** `.chip`(필터 pill, `.on` 반전, `.on.accent` violet) · `.tag`(mono 대문자). `globals.css:172-187`
- **공시 캡션** `.money-caption`(가챠 확률·충전금 규정 문구, mono/faint). `globals.css:189-193` · 소비처 `Binder.tsx:226`
- **카드** `.card`(surface→bg-2 그라데 + hairline) + `.lift`(hover −6px). `globals.css:196-203`
- **내비** `.nav`(글래스모픽 blur+saturate) + `.mobnav`(<1041px 바텀바) + `.icon-btn`(+`.badge`). `globals.css:206-238,729-811`
- **포스터/카드아트** `.poster`/`.glyph`/`.sheen` + 수집형 `.foil`. `globals.css:241-261`
- **시네마틱 히어로** `.hero-cinematic`(풀블리드 키아트 + shade + 텍스트 오버레이). `globals.css:596-612` · 소비처 `IpDetail.tsx:115`

**[차용·미구현]** (§8에서 표면별로 상술)
- `tier-card`/`tier-card-featured`(Revolut) · `input-lg`(Revolut)

## 8. 표면별 플레이북 ⭐

각 표면이 어느 도너에서 무엇을 가져오는지, 그리고 구현 상태를 명기한다. **하이프 표면과 신뢰 표면은 같은 다크 위에서 고도가 다르다.**

### IP 히어로 (하이프 고도) — 도너: Runway `[구현됨: IP상세 · 부분구현: 이벤트/팝업]`
- IP 상세는 `.hero-cinematic`으로 구현 — 풀블리드 키아트 위에 IP 정보·스탯·팔로우가 shade와 함께 놓인다. `[구현됨: globals.css:596-612, 소비처 IpDetail.tsx:115]` Home은 별도 `.home-hero`(`globals.css:273-383`). 이벤트·팝업 랜딩으로의 확장은 `[차용·미구현]`.
- 색은 키아트가 낸다. 스펙트럼은 아이브로·CTA에만.

### 수집형 foil 카드 (하이프 고도) — ICONS-오리지널 `[구현됨]`
- `.poster` + `.foil` + `.sheen`. color-dodge 홀로 오버레이가 희귀도/수집 쾌감을 만든다. **이건 도너가 없다.** 유지·확장만 한다.
- 희귀도는 `.tag`(mono 대문자)로 표기.

### 가챠 리빌 · 확률공시 (하이프 → 신뢰 전환) — 도너: ICONS(리빌) + Revolut(공시) `[부분구현]`
- **리빌 순간**은 하이프 최대치 — `{gradients-effects.holo}` 스윕 + `{gradients-effects.glow-v}` + foil. `[구현됨 어휘 재사용]`
- **확률공시·천장·회차 정보**는 신뢰 고도로 즉시 전환 — `money-caption`(mono, `{colors.faint}`)로 규제 문구를 또렷하게. `[구현됨: .money-caption globals.css:189-193 · 소비처 Binder.tsx:226]` 확률 공시 수치·천장 카운터 등 데이터 표시는 카드풀 오픈 시. `[차용·미구현]` 확률 공시값 진실원은 `docs/adr/0001-paid-digital-gacha.md`이며 UI는 숨기거나 축소하지 않는다.

### 충전금 지갑 · 결제 (신뢰 고도) — 도너: Revolut `[차용·미구현]`
- **다크 위에서** Revolut식 규율을 표현한다(캔버스 반전 없음).
  - `tier-card` — 충전금 충전 tier. 추천 tier는 `tier-card-featured`(violet 반전)로 강조.
  - `input-lg` — 결제/충전 입력 ≥52px, 또렷한 violet focus 링.
  - `money-caption` — 통화·수수료·환불 규정 문구.
- **금액·잔액은 mono**로 정렬. 결제 확정의 진실원은 토스페이먼츠 웹훅이며(§AGENTS), UI 성공 콜백만으로 확정 표기하지 않는다.

### 커뮤니티 / 팬덤 (몰입 고도) — 도너: Spotify `[대부분 구현됨]`
- "UI는 물러나고 콘텐츠가 빛난다" 앱쉘 — 카드그리드 + 모바일 바텀바. `.community-*`(`globals.css:517-589`), `.mobnav`가 이미 이 모델이다. **현재 방향이 Spotify 분석으로 검증됨.** 대문자-트래킹 라벨(`.community-rail-label`) 유지.
- 도메인 주의: `팬덤 가입`은 v1 무료 `팔로우`다. 유료 `멤버십`으로 표기하지 말 것.

## 9. Do's & Don'ts

### Do
- 다크 단일 캔버스를 유지한다 — 결제·충전도 다크 위 명료함으로 신뢰를 얻는다.
- 하이프 표면과 신뢰 표면의 **고도**를 구분한다(톤·밀도·모션).
- 스펙트럼은 홀로 그라데로 **뭉쳐** 강조 지점에만 쓴다.
- 버튼은 항상 pill. 숫자·가격·확률·충전금은 mono.
- foil/홀로 리빌은 하이프 최대치로, 확률공시·규제 문구는 즉시 신뢰 고도로.

### Don't
- 결제·충전·가격 화면을 밝은 캔버스로 뒤집지 않는다(듀얼 트랙 미채택).
- 스펙트럼으로 넓은 면을 칠하거나 본문 텍스트 색으로 쓰지 않는다.
- `foil`을 수집형 카드 밖(일반 굿즈·UI 크롬)에 남발하지 않는다.
- 버튼을 둥근 사각형으로 만들지 않는다.
- 외부 도너의 **정체성**(예: Shopify 파스텔 그린, Revolut 코발트, Spotify 그린)을 브랜드색으로 들여오지 않는다 — 구조만 차용한다.
- 카드(수집형 디지털)와 굿즈(실물), 교환(카드 C2C)과 마켓(굿즈 C2C)을 시각적으로 혼용하지 않는다(`CONTEXT.md`).

## 10. Responsive / 모바일 우선 `[구현됨]`

- **<1041px**에서 상단 `.nav-links`가 사라지고 하단 `.mobnav`(4-탭 바텀바)로 전환. `globals.css:729-811`
- safe-area inset 대응(`env(safe-area-inset-bottom)`), 터치 타깃 pill ≥44px.
- 히어로·레일·그리드는 620px/360px 브레이크포인트에서 1열로 붕괴. `globals.css:813-893`
- 모션은 `prefers-reduced-motion`을 존중(`globals.css:688-723`). 캡처 환경 대비 opacity 애니메이션은 쓰지 않는다(`.rise` 주석 참조).

## 11. 도너 출처표 · Iteration Guide

| 표면 | 도너 | 가져온 것 | 상태 |
|---|---|---|---|
| IP 상세 히어로 | Runway | 풀블리드 시네마틱 히어로(.hero-cinematic) | 구현됨(이벤트/팝업 확장 미구현) |
| 수집형 foil 카드 | ICONS-오리지널 | holo/foil/sheen(이식 불가) | 구현됨 |
| 가챠 리빌 | ICONS-오리지널 | 스펙트럼·glow·foil 리빌 | 어휘 구현됨 |
| 가챠 확률공시 | Revolut | 규제 캡션 규율(.money-caption) | 구현됨 |
| 충전금·결제 | Revolut | tier·input-lg·숫자 규율(다크 위) | 차용·미구현 |
| 커뮤니티/팬덤 | Spotify | 다크 몰입 앱쉘·카드그리드·바텀바 | 대부분 구현됨 |
| 2-고도 규율 | Shopify | 몰입↔명료 고도 분리 + pill 어휘 | 부분구현 |

**기각:** ElevenLabs — 유일하게 그라데 토큰 계열을 갖지만 파스텔·라이트 캔버스 한정이고, 우리 스펙트럼이 더 채도 높고 우월하다. 색 도너로도 불필요.

### Iteration
1. 한 번에 한 컴포넌트/표면만 다룬다.
2. 토큰·컴포넌트를 `{colors.violet}`, `{rounded.pill}`, `hero-cinematic`처럼 이름으로 참조한다.
3. `[차용·미구현]`을 구현하면 상태를 `[구현됨]`으로 바꾸고 `file:line` 근거를 단다.
4. 새 변형은 별도 항목으로 추가한다. 버튼 변형은 **모양(pill)이 아니라 채움/테두리/캔버스**로만 달라진다.
5. 토큰 값 자체는 `app/globals.css`의 `@theme`에서 바꾸고, 이 문서는 그 뒤 동기화한다(코드가 진실).
