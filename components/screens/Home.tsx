import Link from 'next/link';
import { DATA, type Ip } from '@/lib/data';
import { hrefFor } from '@/lib/routes';
import { Icon } from '@/components/ui/Icon';
import { Poster } from '@/components/ui/Poster';
import { Collectible } from '@/components/ui/Collectible';
import { SectionHead } from '@/components/ui/SectionHead';
import { GoodsCard } from '@/components/ui/GoodsCard';
import { FeedPreview } from '@/components/ui/FeedPreview';

function Hero() {
  return (
    <header style={{ position: 'relative', paddingTop: 'calc(var(--nav-h) + 40px)', overflow: 'hidden' }}>
      {/* floating cards backdrop */}
      <div className="hide-mob" style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: 150, left: '4%', transform: 'rotate(-12deg)', opacity: 0.8 }}>
          <Collectible card={DATA.CARDS[2]} ip={DATA.ipById(DATA.CARDS[2].ip)} size="sm" />
        </div>
        <div style={{ position: 'absolute', top: 360, left: '-1%', transform: 'rotate(6deg)', opacity: 0.6 }}>
          <Collectible card={DATA.CARDS[4]} ip={DATA.ipById(DATA.CARDS[4].ip)} size="sm" />
        </div>
        <div style={{ position: 'absolute', top: 140, right: '4%', transform: 'rotate(11deg)', opacity: 0.8 }}>
          <Collectible card={DATA.CARDS[0]} ip={DATA.ipById(DATA.CARDS[0].ip)} size="sm" />
        </div>
        <div style={{ position: 'absolute', top: 360, right: '1%', transform: 'rotate(-7deg)', opacity: 0.6 }}>
          <Collectible card={DATA.CARDS[3]} ip={DATA.ipById(DATA.CARDS[3].ip)} size="sm" />
        </div>
      </div>

      <div className="wrap" style={{ position: 'relative', zIndex: 2, textAlign: 'center', paddingBottom: 64 }}>
        <div
          className="rise"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '7px 16px',
            borderRadius: 999,
            border: '1px solid var(--line-2)',
            background: 'rgba(255,255,255,.03)',
            fontSize: 13,
            marginBottom: 30,
          }}
        >
          <span className="dot" style={{ width: 7, height: 7, borderRadius: 99, background: 'var(--mint)', boxShadow: '0 0 10px var(--mint)' }} />
          서브컬처 팬덤 플랫폼 · 89개 라이선스 IP 입점
        </div>
        <h1 className="h-xxl rise" style={{ animationDelay: '.05s' }}>
          <span className="holo-text">ICONS</span>
        </h1>
        <p className="rise" style={{ animationDelay: '.12s', fontSize: 'clamp(17px,2.4vw,22px)', fontWeight: 600, marginTop: 14 }}>
          좋아하는 모든 것을, 하나의 팬덤 허브에서
        </p>
        <p className="muted rise" style={{ animationDelay: '.16s', marginTop: 10, maxWidth: 560, marginInline: 'auto' }}>
          공식 라이선스 굿즈 · 팝업 &amp; 티케팅 · 팬 커뮤니티 · 수집형 카드까지. BL/GL부터 글로벌 IP, 버튜버, 웹툰까지 모든 서브컬처가 모입니다.
        </p>
        <div className="rise" style={{ animationDelay: '.22s', display: 'flex', gap: 12, justifyContent: 'center', marginTop: 32, flexWrap: 'wrap' }}>
          <Link className="btn btn-holo" href={hrefFor('binder')}>지금 시작하기 <Icon name="arrow" size={17} /></Link>
          <Link className="btn btn-ghost" href={hrefFor('shop')}>굿즈샵 둘러보기</Link>
        </div>
        <div className="rise" style={{ animationDelay: '.3s', display: 'flex', gap: 'clamp(20px,5vw,56px)', justifyContent: 'center', marginTop: 52, flexWrap: 'wrap' }}>
          {([[DATA.STATS.fans, '활동 팬'], [DATA.STATS.ips, '라이선스 IP'], [DATA.STATS.goods, '공식 굿즈'], [DATA.STATS.events, '팝업 이벤트']] as const).map(([n, l]) => (
            <div key={l} className="col" style={{ alignItems: 'center' }}>
              <span className="h-lg holo-text" style={{ fontFamily: 'var(--ff-display)' }}>{n}</span>
              <span className="faint mono" style={{ fontSize: 12, marginTop: 4, letterSpacing: '.06em' }}>{l}</span>
            </div>
          ))}
        </div>
      </div>
      {/* mobile card strip */}
      <div className="only-mob mobile-contained-strip" style={{ display: 'flex', gap: 12, overflowX: 'auto', padding: '0 24px 40px', scrollbarWidth: 'none' }}>
        {DATA.CARDS.slice(0, 4).map((c) => (
          <div key={c.id} style={{ flex: '0 0 auto' }}>
            <Collectible card={c} ip={DATA.ipById(c.ip)} size="sm" />
          </div>
        ))}
      </div>
    </header>
  );
}

function VerticalCard({ ip }: { ip: Ip }) {
  return (
    <Link className="card lift" href={hrefFor('ip', ip.id)} style={{ display: 'block', padding: 0, overflow: 'hidden', textAlign: 'left', position: 'relative', cursor: 'pointer' }}>
      <Poster bg={ip.bg} glyph={ip.glyph} ratio="4 / 3" radius={0}>
        <div style={{ position: 'absolute', top: 12, left: 12, zIndex: 4 }}>
          <span className="tag" style={{ borderColor: ip.v.color, color: '#fff', background: 'rgba(0,0,0,.35)' }}>{ip.v.label}</span>
        </div>
      </Poster>
      <div style={{ padding: '16px 18px 18px' }}>
        <div className="between">
          <div style={{ fontWeight: 700, fontSize: 17 }}>{ip.title}</div>
          <span className="mono" style={{ fontSize: 11, color: ip.v.color }}>{(ip.fans / 1000).toFixed(1)}K 팬</span>
        </div>
        <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>{ip.tagline}</div>
        <div className="row" style={{ marginTop: 14, gap: 8 }}>
          <span className="tag">굿즈 {ip.goods}</span>
          <span className="tag">카드 {ip.cards}</span>
        </div>
      </div>
    </Link>
  );
}

function EventStrip() {
  return (
    <div style={{ display: 'flex', gap: 18, overflowX: 'auto', paddingBottom: 8, scrollbarWidth: 'none' }}>
      {DATA.EVENTS.map((e) => (
        <Link key={e.id} className="card lift" href={hrefFor('events')} style={{ flex: '0 0 320px', padding: 0, overflow: 'hidden', textAlign: 'left', cursor: 'pointer' }}>
          <Poster bg={e.img} ratio="16 / 9" radius={0}>
            <div style={{ position: 'absolute', top: 12, left: 12, zIndex: 4, display: 'flex', gap: 6 }}>
              <span className="tag" style={{ color: '#0A0813', background: e.accent, border: 'none', fontWeight: 700 }}>{e.mode}</span>
              <span className="tag" style={{ color: '#fff', background: 'rgba(0,0,0,.4)' }}>{e.status}</span>
            </div>
          </Poster>
          <div style={{ padding: '15px 17px 18px' }}>
            <div style={{ fontWeight: 700, fontSize: 15.5 }}>{e.title}</div>
            <div className="row" style={{ marginTop: 10, gap: 14, fontSize: 12.5 }}>
              <span className="muted row" style={{ gap: 6 }}><Icon name="event" size={14} /> {e.date}</span>
              <span className="muted row" style={{ gap: 6 }}><Icon name="globe" size={14} /> {e.loc}</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

export function Home() {
  const featured = DATA.IPS.filter((i) => i.featured).slice(0, 4);
  return (
    <div>
      <Hero />

      {/* fan verticals */}
      <section className="section">
        <div className="wrap">
          <SectionHead
            eyebrow="Fan Verticals"
            title="당신의 팬덤을 찾아보세요"
            desc="모든 서브컬처가 하나의 플랫폼에. 좋아하는 IP의 굿즈·카드·이벤트·커뮤니티를 한 곳에서."
            action="IP 허브 전체보기"
            href={hrefFor('iphub')}
          />
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
            {featured.map((ip) => <VerticalCard key={ip.id} ip={ip} />)}
          </div>
        </div>
      </section>

      {/* goods */}
      <section className="section" style={{ background: 'var(--bg-2)', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
        <div className="wrap">
          <SectionHead
            eyebrow="Official Goods"
            title="공식 라이선스 굿즈"
            desc="IP 파트너와 직접 계약한 정품 굿즈만. 아크릴 스탠드, 포토카드, 피규어, 한정 세트까지."
            action="굿즈샵 바로가기"
            href={hrefFor('shop')}
          />
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
            {DATA.GOODS.slice(0, 8).map((g) => <GoodsCard key={g.id} g={g} />)}
          </div>
        </div>
      </section>

      {/* collectible cards highlight */}
      <section className="section" style={{ overflow: 'hidden' }}>
        <div className="wrap">
          <div className="grid mobile-stack" style={{ gridTemplateColumns: 'minmax(280px, 0.9fr) 1.1fr', alignItems: 'center', gap: 48 }}>
            <div>
              <div className="eyebrow" style={{ marginBottom: 16 }}>Collectible Cards</div>
              <h2 className="h-xl">참여할수록 모이는<br /><span className="holo-text">홀로그램 카드</span></h2>
              <p className="muted" style={{ marginTop: 16, maxWidth: 420 }}>
                팝업 참여, 굿즈 구매, 미션 달성마다 IP 기념 디지털 카드가 발급됩니다. N부터 SSR·HOLO까지 — 등급이 높을수록 시장에서 가치가 달라져요.
              </p>
              <div className="wrapgap" style={{ marginTop: 22 }}>
                {['오프라인 팝업', '굿즈 구매', 'IP 미션', '데일리 가챠'].map((t) => (
                  <span key={t} className="chip" style={{ pointerEvents: 'none' }}>{t}</span>
                ))}
              </div>
              <div className="row" style={{ marginTop: 28, gap: 12, flexWrap: 'wrap' }}>
                <Link className="btn btn-holo" href={hrefFor('binder')}>내 수집 바인더 <Icon name="card" size={16} /></Link>
                <Link className="btn btn-ghost" href={hrefFor('exchange')}>카드 교환 마켓</Link>
              </div>
            </div>
            <div className="mobile-card-fan" style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
              {[DATA.CARDS[0], DATA.CARDS[2], DATA.CARDS[8]].map((c, i) => (
                <div key={c.id} style={{ marginTop: i === 1 ? -28 : i === 2 ? 18 : 0 }}>
                  <Link href={hrefFor('binder')}>
                    <Collectible card={{ ...c, owned: true }} ip={DATA.ipById(c.ip)} />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* events */}
      <section className="section" style={{ background: 'var(--bg-2)', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
        <div className="wrap">
          <SectionHead
            eyebrow="Popup & Ticketing"
            title="현장에서 만나는 팬덤"
            desc="오프라인 팝업, 온라인 팬미팅, 단독 쇼케이스 — 티켓팅과 입장 인증까지 한 번에."
            action="모든 이벤트"
            href={hrefFor('events')}
          />
          <EventStrip />
        </div>
      </section>

      {/* community */}
      <section className="section">
        <div className="wrap">
          <div className="grid mobile-stack" style={{ gridTemplateColumns: '0.85fr 1.15fr', gap: 44, alignItems: 'start' }}>
            <div className="mobile-unstick" style={{ position: 'sticky', top: 96 }}>
              <div className="eyebrow" style={{ marginBottom: 16 }}>Community</div>
              <h2 className="h-xl">같은 취향의<br /><span className="holo-text">팬들과 함께</span></h2>
              <p className="muted" style={{ marginTop: 16, maxWidth: 380 }}>
                굿즈 인증샷, 팝업 후기, 최애 토론까지. IP별 채널에서 취향이 맞는 팬들과 실시간으로 소통하세요.
              </p>
              <Link className="btn btn-primary" href={hrefFor('community')} style={{ marginTop: 24 }}>커뮤니티 참여하기 <Icon name="arrow" size={16} /></Link>
              <div className="wrapgap" style={{ marginTop: 28 }}>
                {DATA.TRENDING.slice(0, 6).map((t) => <span key={t} className="chip btn-sm" style={{ pointerEvents: 'none' }}>{t}</span>)}
              </div>
            </div>
            <div className="col" style={{ gap: 14 }}>
              {DATA.POSTS.map((p) => <FeedPreview key={p.id} p={p} />)}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
