# ICONS

ICONS는 서브컬처 팬덤을 위한 슈퍼앱 프로토타입이다. 공식 라이선스 **굿즈** 커머스, 수집형 디지털 **카드**(가챠), 팝업 티케팅, 커뮤니티, IP 허브를 하나의 "Holographic Midnight" 경험으로 묶는다.

## 현재 상태

- Next.js 16, React 19, Tailwind v4 기반 App Router 프로젝트다.
- Claude Design 핸드오프를 옮긴 시각적 프로토타입에서 출발했다.
- 화면은 `app/**/page.tsx`가 `components/screens/*` 컴포넌트를 렌더링하는 구조다.
- 데이터는 아직 `lib/data.ts`의 mock을 사용한다.
- Supabase Auth/SSR은 스캐폴딩 상태이며, 환경변수가 없으면 no-op으로 동작한다.
- 결제, 주문 확정, 가챠 RNG, 티케팅 검표는 아직 실제 서비스에 연결되지 않았다.

## 빠른 시작

```bash
npm install
cp .env.local.example .env.local # 선택: Supabase를 연결할 때만 값 입력
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 연다.

Supabase 환경변수를 입력하지 않아도 앱은 mock 데이터로 실행된다.

## 환경변수

`.env.local.example`을 `.env.local`로 복사한 뒤 필요한 값만 채운다.

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

- `NEXT_PUBLIC_SUPABASE_URL`: Supabase 프로젝트 URL.
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: Supabase publishable public key. 새 프로젝트는 이 값을 우선 사용한다.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: legacy Supabase anon public key. `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`가 없을 때 fallback으로만 사용한다.

URL과 public key 둘 중 하나라도 없으면 인증 미들웨어는 세션 갱신을 건너뛰고, 현재 프로토타입은 mock 데이터만 사용한다.

## 주요 스크립트

```bash
npm run dev    # 개발 서버
npm run lint   # ESLint
npm run build  # production build
npm run start  # build 결과 실행
```

## CI/CD

GitHub Actions는 `CI/CD Pipeline` workflow 하나로 PR 검증과 production 배포를 모두 처리한다.

- `pull_request`와 `merge_group`: `validate` job만 실행한다.
- `push` to `main`: `validate` 통과 후 `deploy-supabase`를 실행하고, 그 다음 `deploy-vercel`을 실행한다.
- `workflow_dispatch`: 수동 실행용 trigger다. 현재 배포 job 조건은 `push` to `main`에만 걸려 있다.

`deploy-supabase`는 linked Supabase project에 migration을 push한다. 이 단계가 Vercel 배포보다 먼저 실행되므로, 이후 `deploy-vercel` secret preflight나 Vercel 배포가 실패해도 Supabase migration은 이미 적용됐을 수 있다.

배포 workflow에는 다음 GitHub Secrets가 필요하다.

```bash
SUPABASE_ACCESS_TOKEN
SUPABASE_PROJECT_ID
SUPABASE_DB_PASSWORD
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID
```

- PR에서는 `npm run lint`, `npm run build`, local Supabase migration reset/lint만 실행한다.
- production 배포는 `main` push에서만 실행한다.
- deployment secret 검사는 각 deploy job 안에서 수행한다. 누락 시 job이 즉시 실패하며, 필요한 GitHub Secret을 설정한 뒤 rerun해야 한다.
- `.vercel/` 연결 파일은 commit하지 않고, workflow가 `VERCEL_ORG_ID`와 `VERCEL_PROJECT_ID`로 production 환경을 가져온다.

## 프로젝트 지도

- `app/`: Next.js App Router 라우트.
- `components/screens/`: 라우트별 화면 컴포넌트.
- `components/shell/`: 전역 내비게이션, 모바일 내비게이션, 푸터, 장바구니 provider.
- `components/ui/`: 화면에서 재사용하는 UI 단위.
- `lib/data.ts`: 현재 프로토타입의 mock 데이터와 도메인 타입 출발점.
- `lib/routes.ts`: 프로토타입 route-id와 실제 Next.js 경로 매핑.
- `lib/supabase/`: Supabase client/server/middleware 스캐폴딩.
- `supabase/migrations/`: 목표 DB 스키마, RLS, RPC 초안.
- `docs/`: 제품 요구사항, 아키텍처, ADR, agent 운영 문서.

## 핵심 문서

- [CONTEXT.md](./CONTEXT.md): 도메인 용어집. 카드/굿즈, 팔로우/팬덤 가입, 교환/마켓 같은 용어 경계를 정의한다.
- [docs/PRD.md](./docs/PRD.md): v1 제품 범위, 출시 단계, 규제/법무 요구사항.
- [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md): 목표 아키텍처, Supabase/TossPayments/RPC 경계, mock에서 real로 가는 이전 경로.
- [docs/adr/0001-paid-digital-gacha.md](./docs/adr/0001-paid-digital-gacha.md): 디지털 유료 가챠 채택과 규제 의무 수용 결정.
- [AGENTS.md](./AGENTS.md): Codex/agent 작업 규칙.

## 작업 경계

- 공개 브라우징이 기본이다. IP, 굿즈, 카드, 이벤트, 커뮤니티 읽기는 로그인 없이 접근 가능해야 한다.
- 보호 액션은 구매, 가챠, 예매, 작성, 팔로우 시점에 로그인 게이트를 둔다.
- `/exchange`와 `/market`은 v2 전까지 프로토타입/플레이스홀더로 유지한다.
- 돈, 재고, 가챠 RNG, 천장, 티켓 검표는 클라이언트 상태에 맡기지 않는다. Supabase Postgres RPC, RLS, 행 잠금, 멱등 처리를 기준으로 구현한다.
- 결제 확정의 진실원은 토스페이먼츠 웹훅이다. 클라이언트 성공 콜백만으로 주문, 충전, 티켓을 확정하지 않는다.
- Next.js 16 관련 API, 라우팅, proxy/middleware, metadata, caching 코드를 수정하기 전에는 `node_modules/next/dist/docs/`의 현재 버전 문서를 확인한다.
