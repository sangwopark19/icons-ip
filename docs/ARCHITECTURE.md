# ICONS — 아키텍처

> 상태: Draft · 최종 수정 2026-06-18 · 짝 문서: [`PRD.md`](./PRD.md)
> 이 문서는 **어떻게 만들 것인가**를 정의한다. 현재 코드베이스(프로토타입)에서 출발해 목표 아키텍처와 이전 경로를 기술한다.
>
> ⚠️ 이 프로젝트의 Next.js 16은 학습 데이터와 API/관례가 다를 수 있다(`AGENTS.md`). 실제 코드 작성 전 `node_modules/next/dist/docs/`를 확인한다. 본 문서가 코드 디테일과 어긋나면 코드를 따른다.

---

## 1. 설계 원칙

1. **공개 우선 브라우징**: 카탈로그·피드는 비로그인 공개. 보호는 액션 단위(결제·가챠·작성·팔로우).
2. **돈·재고는 DB에서 지킨다**: 가챠·티켓 재고·주문·지갑의 원자성은 Postgres 함수(RPC)+행 잠금으로 보장. 앱 레벨 동시성에 의존하지 않는다.
3. **결제는 웹훅이 확정한다**: 클라이언트 성공 신호는 UX용. 주문/충전 확정은 토스페이먼츠 웹훅 + 멱등 처리.
4. **데이터 격리는 RLS로**: 사용자 데이터는 소유자 범위, 카탈로그는 공개 읽기, 관리자는 역할 + 감사 로그.
5. **점진 이전**: `lib/data.ts` mock을 시드로 삼아 도메인별로 DB·페치로 교체. 프로토타입 화면을 버리지 않는다.

---

## 2. 현재 스택 (as-built)

| 레이어 | 구현 | 위치 |
|---|---|---|
| 프레임워크 | Next.js **16** (App Router, Turbopack) | `next.config.ts` (`turbopack.root` 고정) |
| UI | React **19**, TypeScript strict | `app/`, `components/` |
| 스타일 | Tailwind **v4** + "Holographic Midnight" 디자인 시스템 | `app/globals.css`, `postcss.config.mjs` |
| 화면 | 11개 라우트 ↔ screen 컴포넌트 | `app/**/page.tsx` → `components/screens/*` |
| 셸 | Nav · MobNav · SiteFooter · CartProvider · `useGo` | `components/shell/*` |
| 라우팅 맵 | 프로토타입 route-id ↔ 경로 | `lib/routes.ts` |
| 데이터 | **mock** (IP·굿즈·카드·이벤트·포스트·교환·마켓) | `lib/data.ts` |
| 인증 | Supabase SSR **스캐폴딩**(세션 갱신, 리다이렉트 없음, env 없으면 no-op) | `lib/supabase/{client,server,middleware}.ts`, 루트 `proxy.ts` |
| CI/CD | GitHub Actions `CI/CD Pipeline`: PR/merge queue 검증, `main` push production 배포. Actions 앱 빌드 Node는 26 | `.github/workflows/pipeline.yml` |
| Production 배포 | Supabase linked migration push 후 Vercel prebuilt production deploy. Vercel Git 자동 배포는 비활성화 | GitHub Secrets + `.github/workflows/pipeline.yml`, `vercel.json` |
| Production runtime | Vercel project/runtime Node.js Version은 공식 지원 범위인 24.x 유지 | Vercel Project Settings |

**요청 프록시 주의**: 루트 `proxy.ts`가 `export function proxy()` + `config.matcher`로 동작한다(Next 16에서 미들웨어가 이 형태). `lib/supabase/middleware.ts`의 `updateSession`을 호출하며 **로그인 리다이렉트는 하지 않는다**(공개 브라우징 정책).

화면↔라우트 매핑(현재):
`/`·`/ip`·`/ip/[id]`·`/shop`·`/binder`·`/exchange`·`/community`·`/events`·`/market`·`/search`·`/login`

---

## 3. 목표 아키텍처

```
┌────────────────────────── Vercel (Next.js 16) ───────────────────────────┐
│  Server Components  ──read──▶ Supabase (anon, RLS)                         │
│  Server Actions     ──rpc──▶ Supabase (인증 사용자 컨텍스트)               │
│  Route Handlers                                                           │
│    └ /api/webhooks/tosspayments  ◀── 결제 확정 (멱등)                      │
│    └ /api/cron/*                  (경매 마감·예약 정리 등, v2 포함)         │
│  /admin (role-gated)                                                      │
└──────────────┬───────────────────────────────────────────┬──────────────┘
               │                                             │
        ┌──────▼──────┐                              ┌───────▼────────┐
        │ TossPayments │  결제/충전/환불               │   Supabase     │
        │  결제창/위젯  │                              │  Postgres+RLS  │
        │  + 웹훅       │                              │  RPC(SECDEF)   │
        └─────────────┘                               │  Auth          │
                                                      │  Storage       │
                                                      └────────────────┘
```

핵심: **읽기**는 Server Component가 RLS 하에서 직접 조회. **상태 변경**은 Server Action이 검증 후 **RPC 함수** 호출. **돈 확정**은 토스 웹훅(Route Handler) → RPC.

---

## 4. 기술 스택 (목표)

| 영역 | 선택 | 비고 |
|---|---|---|
| 호스팅 | **Vercel** (Fluid Compute) | Next 16, Route Handler 웹훅·Cron |
| DB/Auth/Storage | **Supabase** (Postgres + Auth + Storage) | 스캐폴딩 이미 존재 |
| 인증 | Supabase Auth: **이메일/PW + Google + Apple + Kakao** | 소셜도 온보딩에서 프로필 완성 |
| 결제 | **토스페이먼츠** 직접(결제창/위젯 + 웹훅) | 단일 PG. 굿즈·티켓·지갑 충전 공용 |
| 검색 | **Postgres** pg_trgm + ILIKE | 외부 검색엔진 없음(v1) |
| 미디어 | **Supabase Storage** | public(카탈로그/아트워크) + authed(업로드) |
| 무결성 | **Postgres RPC**(SECURITY DEFINER) + RLS | 가챠·티켓·주문·지갑 |

---

## 5. 데이터 모델

`lib/data.ts`의 타입을 출발점으로 한다. 도메인별 핵심 테이블(키 컬럼만):

### 5.1 신원 & 사용자
- `profiles` (id=auth.users.id, email, nickname, birth_date, **role** `user|staff|admin`, consents jsonb, created_at)
- `ip_follows` (user_id, ip_id) — 관심 IP

### 5.2 카탈로그 (공개 읽기)
- `verticals` (key, label, color) — BL/GL·로판·글로벌·버튜버·스트리머
- `ips` (id, title, sub, vertical_key, glyph, bg, tagline, synopsis, featured, fans/goods/cards 집계)
- `goods` (id, ip_id, name, type, price, badge, stock, image_path)
- `events` (id, ip_id?, title, mode, status, starts_at, ends_at, location, accent, image_path)

### 5.3 가챠 & 카드 (P2)
- `card_pools` (id, ip_id, name, active_from/to) — 풀(픽업/한정 포함)
- `cards` (id, ip_id, pool_id, name, no, rarity `N|R|SR|SSR|HOLO`, image_path)
- `pool_odds` (pool_id, rarity, probability) — **확률 공시 원천**
- `wallets` (user_id, balance) — 충전 잔액
- `wallet_ledger` (id, user_id, delta, reason `charge|pull|refund`, ref_id, created_at) — 장부
- `pulls` (id, user_id, pool_id, cost, pity_before/after, created_at)
- `pull_results` (pull_id, card_id, rarity)
- `user_cards` (user_id, card_id, qty, acquired_at) — 바인더(보유)

### 5.4 커머스 (P1)
- `carts` / `cart_items` (user_id, good_id, qty)
- `orders` (id, user_id, status `pending|paid|shipping|done|canceled`, total, address jsonb, created_at)
- `order_items` (order_id, good_id, qty, unit_price)
- `payments` (id, provider `toss`, order_id?/charge_id?, amount, status, payment_key, **idempotency_key**, raw jsonb)
- `refunds` (id, payment_id, amount, reason, status)

### 5.5 티케팅 (P3)
- `ticket_types` (id, event_id, name, price, capacity, sold) — 회차/종류
- `ticket_orders` (id, user_id, event_id, status)
- `tickets` (id, ticket_order_id, ticket_type_id, qr_token, status `valid|used|refunded`)
- `check_ins` (ticket_id, checked_at, by_staff)

### 5.6 커뮤니티 (P0)
- `posts` (id, user_id, ip_id?, text, image_path?, tag, status `visible|hidden`, created_at)
- `comments` (id, post_id, user_id, text)
- `likes` (post_id, user_id)
- `reports` (id, target_type `post|comment|user`, target_id, reporter_id, reason, status)
- `blocks` (user_id, blocked_user_id)

### 5.7 운영
- `audit_log` (id, actor_id, action, target, diff jsonb, created_at)

> v2(연기) 테이블: `listings`/`offers`/`trades`/`escrow`/`payouts`(마켓·교환), `memberships`/`subscriptions`(유료 팬덤). 스키마 자리만 예약.

---

## 6. 권한 모델 (RLS)

| 테이블군 | 읽기 | 쓰기 |
|---|---|---|
| 카탈로그(verticals/ips/goods/events/cards/pool_odds) | **공개(anon)** | staff/admin only |
| profiles/ip_follows/carts/orders/wallets/user_cards/tickets | **본인만** | 본인만(+RPC) |
| posts/comments/likes | 공개 읽기(visible) | 작성자 본인, 신고/숨김은 본인+운영 |
| reports/blocks | 본인+운영 | 본인 |
| audit_log | admin only | RPC만 |

- 돈/재고가 걸린 INSERT/UPDATE는 테이블 직접 쓰기 대신 **RPC(SECURITY DEFINER)** 로만 허용.
- 관리자 권한은 `profiles.role`로 판정, `/admin` 라우트와 RLS 양쪽에서 검사.

---

## 7. 트랜잭션 & 무결성 (RPC)

핵심 원자 연산은 `SECURITY DEFINER` Postgres 함수로 구현하고, Server Action에서 인증 컨텍스트로 호출한다.

- **`pull_gacha(pool_id, count)`** — 1 트랜잭션:
  1) 지갑 잔액 `FOR UPDATE` 잠금·차감 검증
  2) `pool_odds` 기반 RNG 추첨 (+ **천장**: `pulls.pity` 누계로 보장 발동)
  3) `pulls`/`pull_results` 기록, `user_cards` 적립(중복 시 정책 처리)
  4) `wallet_ledger`에 `pull` 기록
- **`reserve_tickets(ticket_type_id, qty)`** — `ticket_types.sold`를 `FOR UPDATE`로 잠그고 `capacity` 초과 검증 후 차감, `ticket_orders` 생성(상태 `pending`). 결제 확정 시 `tickets`(QR) 발급.
- **`place_order(cart)`** — 굿즈 재고 검증·차감, `orders`/`order_items` 생성(`pending`).
- **`charge_wallet(amount)` / `confirm_payment(payment_key, ...)`** — 충전·결제 확정. 웹훅에서 호출, **멱등 키**로 중복 방지.
- **`cancel/refund_*`** — 환불 시 재고/잔액 원복 + `refunds`/`wallet_ledger` 기록.

규칙: 천장·확률 로직은 DB(또는 DB가 호출하는 신뢰 경로)에만 둔다(클라이언트 신뢰 금지). 모든 금전 RPC는 멱등·감사 가능.

---

## 8. 인증 & 온보딩 흐름

1. 진입: 보호 액션 클릭 → `/login`.
2. 수단: 이메일/PW 또는 Google/Apple/Kakao(OAuth, Supabase Auth).
   - Supabase는 Google/Apple 네이티브 지원. **Kakao**는 커스텀 OAuth/OIDC 설정으로 연동.
3. 콜백 → 세션 수립(쿠키). `proxy.ts`가 매 요청 세션 갱신(현행 유지).
4. **온보딩 게이트**: `profiles` 미완성(이메일/닉네임/생년월일/동의 누락) 시 온보딩 폼으로. 소셜 가입도 동일.
5. 완료 후 관심 IP 팔로우 추천.

본인확인: 자가신고 생년월일 + 결제 시 결제사 위임. (게임물 연령등급이 요구하면 §PRD 5.1대로 PASS 본인인증을 가챠/고액 결제 게이트에 추가.)

---

## 9. 결제 통합 (토스페이먼츠)

- 클라이언트: 결제창/위젯으로 결제 요청(주문·티켓·충전 공용).
- 서버: **웹훅 `/api/webhooks/tosspayments`(Route Handler)** 가 결제 확정의 단일 진실원. 서명 검증 → `confirm_payment` RPC(멱등 키=토스 paymentKey/주문키).
- 흐름: ① RPC로 `pending` 생성(재고·잔액 선점) → ② 토스 결제 → ③ 웹훅 확정(`paid`, 티켓 QR 발급/주문 확정/지갑 적립) → ④ 실패·만료 시 선점 복원.
- 환불: `refunds` + 토스 취소 API, 재고/충전금 원복.
- 단일 PG 가정. 멀티 PG 필요 시 `payments.provider` + 어댑터 계층 도입.

---

## 10. 미디어 / 스토리지

- **Supabase Storage**
  - `public/` 버킷: 굿즈·카드·IP·이벤트 아트워크 (프로토타입의 그라디언트+글리프 플레이스홀더를 실제 이미지로 교체).
  - `authed/` 버킷: 커뮤니티 업로드·프로필 이미지 (RLS·소유자 범위, 업로드 검증).
- 카탈로그 테이블은 경로(`image_path`)만 저장, 렌더 시 URL 변환. 이미지 변환/최적화 활용.

---

## 11. 검색

- Postgres `pg_trgm` 확장 + ILIKE/유사도 정렬. 대상: `ips`·`goods`·`cards`·`posts`·태그.
- 구현은 검색용 RPC 또는 뷰. 한국어 형태소 한계는 v1 규모에서 수용, 확장 시 외부 인덱스 검토.

---

## 12. 운영 백오피스 `/admin`

- 같은 Next 앱의 라우트 그룹. 진입 시 `profiles.role ∈ {staff, admin}` 검사(라우트 + RLS 이중).
- 기능: 카탈로그 CRUD, **카드풀·확률 공시값** 관리, 이벤트·티켓 회차, 주문/티켓/환불 처리, 커뮤니티 신고 처리.
- 모든 민감 작업은 `audit_log` 기록.

---

## 13. mock → real 이전 경로

1. **스키마**: §5 테이블을 Supabase 마이그레이션으로 생성, RLS·RPC 적용.
2. **시드**: `lib/data.ts`의 IP/굿즈/카드/이벤트/포스트를 시드 스크립트로 적재(타입 이미 정의됨 → 매핑 단순).
3. **읽기 교체**: screen 컴포넌트의 `DATA.*` 접근을 Server Component 페치로 점진 교체. `'use client'` 화면은 데이터를 props로 받도록 분리.
4. **액션 도입**: 장바구니/팔로우/작성 등은 Server Action으로, 돈/재고는 RPC로.
5. **결제 연결**: 토스 위젯 + 웹훅.
6. 단계는 [PRD §9](./PRD.md#9-출시-단계)의 P0→P3 순서를 따른다.

`lib/routes.ts`의 라우트 맵·`useGo`는 유지(프로토타입 네비게이션 자산 재사용). 프로토타입의 `/exchange`·`/market` 화면은 v2까지 읽기/플레이스홀더로 둔다.

---

## 14. 목표 디렉토리 (증분)

```
app/
  (existing screens)                  # 점진적으로 서버 페치 + 액션 연결
  admin/                              # 역할 게이트 백오피스
  api/
    webhooks/tosspayments/route.ts    # 결제 확정 웹훅
    cron/*                            # 예약 정리 등
lib/
  data.ts                             # → 시드 소스로 격하, 점진 제거
  supabase/{client,server,middleware} # 유지
  db/                                 # 쿼리·RPC 래퍼
supabase/
  migrations/                         # 스키마 + RLS + RPC 함수
  seed.sql                            # data.ts 기반 시드
docs/
  PRD.md  ARCHITECTURE.md
```

---

## 15. 규제의 기술적 매핑

| 규제(요구사항) | 기술 반영 |
|---|---|
| 확률형 아이템 공시 | `pool_odds`를 가챠 화면에 노출, 변경 이력 `audit_log` |
| 게임물 등급분류(연령) | 분류 결과에 따라 가챠 라우트에 연령 게이트(자가신고→필요 시 PASS) |
| 전자금융(선불 충전 환불) | `wallets`/`wallet_ledger` + 환불 RPC, 미사용분 환불 경로 |
| 전자상거래(청약철회) | `orders`/`refunds` 상태기계 + 환불 RPC |
| PIPA/청소년보호 | `profiles.consents`·`birth_date`, 최소수집·동의·파기 |
| UGC 안전 | `reports`/`blocks` + `/admin` 모더레이션 + 게시물 `status` |

---

## 16. 미해결 결정

- **디지털 유료 가챠 채택 + 규제 스탠스** — 채택 완료. 결정 배경과 결과는 `docs/adr/0001-paid-digital-gacha.md`에 기록되어 있다.
- 단일 PG(토스페이먼츠) vs 멀티 PG 추상화 시점.
- 천장/중복카드 환원 등 가챠 세부 규칙.
- 한국어 검색 품질이 임계 넘는 시점의 외부 검색엔진 도입.
