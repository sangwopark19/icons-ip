<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# AGENTS.md

## 기본 작업 원칙

- 기본 답변 언어는 한국어다.
- 사용자가 명시적으로 수정·생성·삭제를 요청하지 않으면 읽기 전용으로 행동한다.
- 변경은 요청 범위 안에서만 최소로 수행한다. 요청받지 않은 기능 추가, 리팩터링, 최적화는 하지 않는다.
- 키, 토큰, 인증 정보, 결제 식별자 같은 민감 정보는 출력하지 않는다.
- 삭제, 덮어쓰기, 외부 API 쓰기, production write처럼 되돌리기 어려운 작업은 먼저 확인한다.
- `gh issue view/list`, `gh pr view`, remote 상태 확인 같은 읽기 작업은 필요 시 수행할 수 있다.
- issue 생성/수정, PR 생성, push, 배포, Supabase remote 적용, 외부 서비스 설정 변경은 사용자가 명시적으로 요청했거나 직전에 확인한 경우에만 수행한다.
- `main` push 또는 `main`으로 merge되는 PR은 GitHub Actions를 통해 Supabase remote migration과 Vercel production deploy를 유발할 수 있으므로 production write로 취급한다.

## 공통 참조 규칙

작업 성격에 맞는 문서를 먼저 읽는다. 모든 작업에 모든 문서를 강제하지는 않는다.

- UI 문구, 도메인 용어, 사용자-facing 이름을 다룰 때는 `CONTEXT.md`를 먼저 읽는다.
- 제품 범위, v1/v2 경계, P0~P3 우선순위가 걸린 작업은 `docs/PRD.md`를 먼저 읽는다.
- DB, Auth, 결제, 권한, 라우팅 구조, mock→real 이전 작업은 `docs/ARCHITECTURE.md`를 먼저 읽는다.
- 가챠, 충전금, RNG, 천장, 확률 공시, 선불 환불이 걸린 작업은 `docs/adr/0001-paid-digital-gacha.md`도 함께 읽는다.
- issue tracker, triage label, agent skill 운영 작업은 `docs/agents/`를 먼저 읽는다.

문서가 서로 충돌하면 조용히 덮어쓰지 말고, 어떤 문서와 충돌하는지 먼저 밝힌다. 코드와 문서가 충돌하면 현재 동작은 코드가 진실이고, 문서는 별도 요청이 있을 때 갱신한다.

## 도메인 언어

- `CONTEXT.md`의 용어를 우선한다.
- 수집형 디지털 `카드`와 실물 `굿즈`를 혼용하지 않는다.
- `팬덤 가입`은 v1에서 무료 `팔로우`다. 유료 `멤버십`과 섞지 않는다.
- `교환`은 카드 C2C, `마켓`은 굿즈 C2C다. 둘 다 v1에서는 플레이스홀더/v2 범위다.
- `충전금`은 가챠 비용으로 소비되는 지갑 잔액이고, 굿즈·티켓은 충전금을 거치지 않고 토스페이먼츠로 직접 결제한다.

## 구현 원칙

- 현재 앱은 Claude Design 핸드오프 기반 시각적 프로토타입에서 출발했다. `lib/data.ts` mock을 시드로 삼아 도메인별로 Supabase fetch/RPC로 점진 이전한다.
- 공개 브라우징을 유지한다. IP·굿즈·카드·이벤트·커뮤니티 읽기는 기본 공개이고, 로그인은 구매·가챠·예매·작성·팔로우 같은 보호 액션 시점에 요구한다.
- 돈, 재고, 가챠 RNG, 천장, 티켓 검표는 클라이언트나 앱 레벨 상태에 맡기지 않는다. Supabase Postgres RPC, RLS, 행 잠금, 멱등 처리를 기준으로 구현한다.
- 결제 확정의 진실원은 토스페이먼츠 웹훅이다. 클라이언트 성공 콜백만으로 주문, 충전, 티켓을 확정하지 않는다.
- 관리자 권한은 `profiles.role`과 RLS 양쪽에서 확인하고, 민감 작업은 감사 가능해야 한다.
- `exchange`와 `market` 화면은 v2 전까지 프로토타입/플레이스홀더로 유지한다.

## 프론트엔드 규칙

- Next.js 16, React 19, Tailwind v4 기준으로 작성한다.
- Next.js API, 라우팅, proxy/middleware, metadata, caching 관련 코드를 쓰기 전에는 `node_modules/next/dist/docs/`에서 현재 버전 문서를 확인한다.
- `app/globals.css`의 "Holographic Midnight" 디자인 시스템과 기존 컴포넌트 패턴을 우선한다.
- 라우트는 `app/**/page.tsx`에서 screen 컴포넌트로 연결하는 현 구조를 존중한다.
- 프로토타입 라우트 id와 실제 경로 매핑은 `lib/routes.ts`를 기준으로 한다.

## 데이터베이스와 Supabase

- 스키마 변경은 `supabase/migrations/`에 기록한다. 이미 공유/적용된 migration은 수정하지 않고 새 migration을 추가한다. 적용 전 DRAFT migration은 일관성을 위해 정리할 수 있다.
- 사용자별 데이터는 RLS로 격리한다. 카탈로그성 데이터는 공개 읽기, 쓰기는 staff/admin 범위로 유지한다.
- service role은 서버 신뢰 경계 안에서만 사용하고, 클라이언트 번들에 노출하지 않는다.
- 가챠 확률 공시값, 지갑 장부, 결제 raw payload, 감사 로그는 추적 가능성을 해치지 않도록 다룬다.

## 검증

- 코드 변경 후 가능한 범위에서 `npm run lint`와 `npm run build`를 실행한다.
- Supabase migration을 변경한 경우 Supabase CLI가 설정되어 있으면 로컬 DB에 적용 검증을 수행한다.
- 실행하지 못한 검증은 최종 응답에 명시한다.

## 작업 계획과 Git

- 여러 파일을 바꾸는 작업은 수정 전에 범위와 순서를 짧게 공유한다.
- 사용자가 명시적으로 요청하지 않으면 branch 생성, staging, commit, push, PR 생성을 하지 않는다.
- `main`에 push하거나 PR을 merge하는 작업은 production 배포 경로를 시작할 수 있으므로, 단순 Git 정리로 취급하지 말고 사용자 요청/확인 범위 안에서만 수행한다.
- branch를 만들 때 사용자가 별도 prefix를 지정하지 않으면 `ps/` prefix를 사용한다.
- branch 이름은 반드시 영어로 작성한다. 한글, 공백, non-ASCII 문자를 사용하지 않는다.
- branch 이름은 `ps/<type>/<short-kebab-summary>` 형식을 따른다. `<type>`은 commit type과 맞추고, `<short-kebab-summary>`는 소문자 영어 kebab-case로 짧게 쓴다. 예: `ps/docs/agent-rules`, `ps/feat/icons-prototype`, `ps/feat/supabase-draft-schema`, `ps/fix/gacha-pity-counter`.
- staging 전에는 `git status --short`로 변경 범위를 확인한다.
- repo에 unrelated/untracked 파일이 있을 수 있으므로 `git add .` 같은 broad staging을 피하고, 의도한 파일만 명시적으로 stage한다.
- commit은 하나의 논리적 변경 단위로 만들고, Conventional Commits 형식을 따른다: `<type>(<scope>): <summary>`.
- commit type은 `feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `build`, `ci`, `style`, `perf`만 사용한다.
- `feat`는 사용자-facing 기능, 화면, 플로우, DB 기능 추가에 사용한다. 초기 구현도 실제 제품 기능이면 `feat`를 사용한다.
- `chore`는 설정, repo 운영, agent 규칙, 의존성, 순수 스캐폴딩에 사용한다.
- commit scope는 `app`, `ui`, `db`, `auth`, `commerce`, `gacha`, `ticketing`, `community`, `docs`, `agents`, `build`, `ci` 중에서 고른다.
- commit summary는 한국어로 쓰고 마침표를 붙이지 않는다. Conventional Commits의 구조 토큰(`feat`, `fix`, `docs`, scope 등)은 그대로 사용한다.
- PR title도 Conventional Commits 형식을 따른다: `<type>(<scope>): <summary>`.
- PR title의 summary는 한국어로 쓴다.
- PR에 여러 commit이 있어도 PR title은 PR 전체 목적을 대표하는 하나의 Conventional Commit 제목으로 쓴다.
- PR body는 `요약`, `배경`, `검증`, `참고` 섹션을 기본으로 쓴다.
- PR body 내용은 한국어로 쓴다.
- PR body에 patch notes는 기본 포함하지 않는다. 사용자가 명시적으로 요청할 때만 추가한다.
- PR은 기본적으로 바로 review 가능한 PR로 생성한다. draft PR은 사용자가 명시적으로 요청할 때만 사용한다.
- PR merge는 squash merge를 기본으로 한다. 커밋 히스토리 자체가 리뷰/추적 단위로 의미 있을 때만 사용자가 명시적으로 요청해 merge commit을 사용한다.
- 초기 또는 큰 변경을 단위별로 나눌 때는 다음처럼 레이어를 분리한다: `chore(build): 프로젝트 도구 초기화`, `feat(app): 프로토타입 라우트와 화면 추가`, `docs(docs): 제품과 아키텍처 문서 정의`, `feat(db): Supabase 초안 스키마와 RPC 추가`, `docs(agents): Codex 작업 규칙 추가`.
- 사용자 변경으로 보이는 파일은 되돌리지 않는다. 같은 파일을 수정해야 하면 현재 내용을 기준으로 필요한 부분만 좁게 편집한다.

## 문서 운영

- `CONTEXT.md`는 용어집만 담는다. 구현 세부사항, 스펙, 작업 메모를 넣지 않는다.
- `README.md`는 사람을 위한 개발/온보딩 문서다. `AGENTS.md`는 에이전트 작업 규칙만 담는다.
- 되돌리기 어렵고, 맥락 없이는 의아하며, 실제 trade-off가 있었던 결정만 `docs/adr/`에 기록한다.
- 제품 범위 변경은 `docs/PRD.md`, 구현 방향 변경은 `docs/ARCHITECTURE.md`, 에이전트 작업 규칙 변경은 이 파일에 기록한다.
- 코드 변경이 `CONTEXT.md`, `docs/PRD.md`, `docs/ARCHITECTURE.md`, `docs/adr/`의 명시 원칙을 바꾸는 경우에만 관련 문서를 함께 갱신한다. 단순 구현, 버그 수정, UI 조정은 문서를 자동 갱신하지 않는다.
- Codex용 durable instruction surface는 `AGENTS.md`다. `CLAUDE.md`는 필요한 경우 `@AGENTS.md` 포인터로만 둔다.

## Agent skills

### Issue tracker

GitHub Issues (`sangwopark19/icons-ip`) via the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Canonical defaults (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context — `CONTEXT.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.
