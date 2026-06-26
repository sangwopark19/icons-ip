# Frontend Home Redesign Plan

## Purpose

ICONS 홈을 개발자 관점의 기능 나열 화면에서 사용자 관점의 최애 중심 진입 화면으로 재설계한다. 백엔드와 Supabase 기반 데이터 계약은 유지하고, Claude Design 시안의 정보구조와 분위기를 현재 Next.js 앱 구조에 맞게 재해석한다.

## Source Design

- Handoff bundle: `docs/claude-design/`
- Primary design: `docs/claude-design/project/ICONS 첫 페이지 (최애 중심).dc.html`

이 시안은 픽셀 퍼펙트 복제 대상이 아니라 UX 방향과 시각 언어의 기준이다.

## GitHub Tracking

- Project: `ICONS v1 Frontend UX` — https://github.com/users/sangwopark19/projects/4
- Epic: #35 `[Frontend UX] ICONS v1 출시 전 프론트 개편`
- First implementation issue: #36 `홈을 최애 중심 첫 경험으로 재설계`

Issue breakdown:

- #36 `홈을 최애 중심 첫 경험으로 재설계` — `Dependency=Unblocked`
- #37 `IP 상세 화면을 최애 세계관 중심으로 개편` — `Dependency=Blocked`
- #38 `굿즈샵 구매 흐름 UX 개편` — `Dependency=Blocked`
- #39 `카드·바인더·가챠 진입 UX 개편` — `Dependency=Blocked`
- #40 `커뮤니티 화면을 팬덤 채널 중심으로 개편` — `Dependency=Blocked`
- #41 `전역 내비게이션 IA 정리` — `Dependency=Blocked`
- #42 `모바일 QA와 출시 전 프론트 polish` — `Dependency=Blocked`

## Fixed Decisions

- 소셜 로그인 연결은 대기한다.
- 첫 작업 범위는 홈 화면으로 제한한다.
- 백엔드 기능과 현재 데이터 계약은 보존한다.
- `app/page.tsx`는 `getCatalogSnapshot()` 기반으로 유지한다.
- Claude Design의 하드코딩 데이터는 production 데이터로 복사하지 않는다.
- 홈 렌더링은 `CatalogSnapshot`에서 선택 IP, 굿즈, 카드, 이벤트, 커뮤니티 표시 모델을 파생한다.
- Claude Design assets는 시각 레퍼런스로만 사용한다.
- production 홈 이미지는 현재 catalog image source를 우선한다.
- 버튼 문구는 출시 기준 실제 액션처럼 둔다.
- 이번 홈 PR에서는 새 결제, 가챠, 예매 backend를 만들지 않는다.
- 아직 없는 액션은 현재 존재하는 route/action까지만 연결하고, 최종 동작 계약은 후속 작업으로 남긴다.

## Success Criteria

처음 방문한 사용자가 5초 안에 ICONS가 "내 최애 IP를 중심으로 굿즈, 카드, 팝업, 커뮤니티를 연결하는 서비스"라는 점을 이해하고, 하나의 IP를 선택해 다음 행동으로 넘어갈 수 있어야 한다.

## UX Direction

홈의 중심 질문은 "누구의 팬이세요?"다.

사용자는 먼저 최애 IP를 고르고, 선택된 IP 세계 안에서 다음 행동을 본다.

- 사요: 공식 굿즈
- 모아요: 수집 카드
- 만나요: 팝업, 이벤트, 팬미팅
- 떠들어요: 팬 커뮤니티

## CTA Contract

출시 기준 문구는 실제 액션처럼 유지한다. 단, 이번 홈 PR의 구현은 현재 존재하는 경로와 상태까지만 연결한다.

- `팬덤 가입 - 무료`: 로그인, 온보딩, IP 팔로우 흐름으로 이어져야 한다.
- `IP 허브 보기`: 선택 IP 상세 또는 IP 허브로 이동한다.
- `장바구니 담기`: 선택 IP의 대표 굿즈를 카트에 담는 최종 동작을 목표로 한다.
- `지금 뽑기`: 선택 IP의 활성 카드풀 또는 가챠 화면으로 진입하는 최종 동작을 목표로 한다.
- `예매하기`: 선택 IP의 진행 또는 예정 이벤트 예매 흐름으로 진입하는 최종 동작을 목표로 한다.
- `팬덤 들어가기`: 선택 IP 커뮤니티 채널로 진입하는 최종 동작을 목표로 한다.

## Implementation Boundary

첫 PR에서 할 일:

- 홈 화면을 최애 중심 구조로 재작성한다.
- `CatalogSnapshot`에서 홈 표시 모델을 파생한다.
- 기존 app shell, nav, footer, route mapping을 존중한다.
- 전역 `Nav`, `SiteFooter`, `MobNav`는 유지하고 Home 내부에 별도 nav/footer를 만들지 않는다.
- Claude Design의 nav/footer는 구조 참고로만 사용한다.
- 홈에 필요한 최소 shared style 또는 helper만 추가한다.
- `components/screens/Home.tsx`는 최애 중심 구조에 맞게 통째로 재구성할 수 있다.
- 다른 screen 컴포넌트는 첫 PR에서 건드리지 않는다.
- 데스크톱과 모바일 레이아웃을 함께 검증한다.

첫 PR에서 하지 않을 일:

- 소셜 로그인 연결
- 결제 backend 구현
- 가챠 backend 구현
- 티켓 예매 backend 구현
- 전체 화면 디자인 일괄 교체
- 전역 navigation IA 개편
- Claude Design 정적 데이터를 production 데이터로 복사

## Home Selection Rules

- 선택 가능한 IP는 featured IP를 최대 5개까지 우선 노출한다.
- 기본 선택 IP는 첫 featured IP로 한다.
- featured IP가 없으면 전체 IP 중 앞에서 5개를 fallback으로 사용한다.
- 선택 IP, 대표 굿즈, 대표 카드, 대표 이벤트는 `CatalogSnapshot`에서 파생한다.
- 운영자가 admin/Supabase에서 featured 또는 카탈로그 데이터를 바꾸면 홈 표시도 따라 바뀌어야 한다.

## Community Preview Scope

- 첫 홈 PR에서는 `getCommunitySnapshot()` 또는 별도 커뮤니티 feed loader를 추가하지 않는다.
- 커뮤니티 tile은 선택 IP와 catalog 정보 기반의 문구와 CTA로 구성한다.
- `팬덤 들어가기`는 현재 존재하는 `/community` 경로로 연결한다.
- 실제 IP별 커뮤니티 preview는 후속 PR에서 별도 loader와 실패 경로를 설계한 뒤 연결한다.

## Verification

홈 구현 PR에서는 최소 다음을 확인한다.

- `npm run test`
- `npm run lint`
- `npm run build`
- 데스크톱 홈 시각 검증
- 모바일 홈 시각 검증
- 주요 CTA가 현재 의도한 route/action으로 연결되는지 확인
