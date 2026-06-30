'use client';

import { useState } from 'react';
import type { CatalogSnapshot } from '@/lib/catalog';
import type { FandomEvent, Ip } from '@/lib/data';
import { ALL_IPS, ALL_MODES, ALL_STATUSES, eventModeOptions, eventStatusOptions, selectFandomEvents } from '@/lib/events-catalog';
import { Icon } from '@/components/ui/Icon';
import { Poster } from '@/components/ui/Poster';
import { Empty } from '@/components/ui/Empty';

function FeaturedEvent({ e, ip }: { e: FandomEvent; ip: Ip | null }) {
  return (
    <div className="card lift" style={{ marginTop: 28, padding: 0, overflow: 'hidden', textAlign: 'left', width: '100%', position: 'relative' }}>
      <div className="event-featured-layout" style={{ position: 'relative', minHeight: 300, display: 'grid', gridTemplateColumns: '1.1fr 0.9fr' }}>
        <div className="event-featured-copy" style={{ padding: '40px 44px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
            {ip && <span className="tag" style={{ color: ip.v.color, borderColor: 'var(--line-2)' }}>{ip.title}</span>}
            <span className="tag" style={{ color: '#0A0813', background: e.accent, border: 'none', fontWeight: 700 }}>{e.mode}</span>
            <span className="tag" style={{ color: '#fff' }}>{e.status}</span>
            {e.status === '진행중' && <span className="tag" style={{ color: 'var(--lime)', borderColor: 'var(--line-2)' }}>NOW</span>}
          </div>
          <h2 className="h-lg" style={{ marginTop: 18 }}>{e.title}</h2>
          <div className="muted row" style={{ gap: 18, marginTop: 14, flexWrap: 'wrap' }}>
            <span className="row" style={{ gap: 7 }}><Icon name="event" size={16} /> {e.date || '일정 공개 예정'}</span>
            <span className="row" style={{ gap: 7 }}><Icon name="globe" size={16} /> {e.loc || '장소 공개 예정'}</span>
          </div>
          <div className="row" style={{ gap: 10, marginTop: 24, flexWrap: 'wrap' }}>
            <button className="btn btn-holo">티켓 예매 <Icon name="arrow" size={15} /></button>
          </div>
        </div>
        <div className="event-featured-art" style={{ position: 'relative', background: e.img }}>
          <div className="sheen" />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, var(--surface), transparent 40%)' }} />
        </div>
      </div>
    </div>
  );
}

function EventCard({ e, ip }: { e: FandomEvent; ip: Ip | null }) {
  return (
    <button className="card lift" style={{ padding: 0, overflow: 'hidden', textAlign: 'left', cursor: 'pointer' }}>
      <Poster bg={e.img} ratio="16 / 9" radius={0}>
        <div style={{ position: 'absolute', top: 12, left: 12, zIndex: 4, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <span className="tag" style={{ color: '#0A0813', background: e.accent, border: 'none', fontWeight: 700 }}>{e.mode}</span>
          <span className="tag" style={{ color: '#fff', background: 'rgba(0,0,0,.4)' }}>{e.status}</span>
        </div>
      </Poster>
      <div style={{ padding: '16px 18px 18px' }}>
        {ip && <div className="mono" style={{ fontSize: 11, color: ip.v.color, marginBottom: 6 }}>{ip.title}</div>}
        <div style={{ fontWeight: 700, fontSize: 15.5 }}>{e.title}</div>
        <div className="muted row" style={{ gap: 14, marginTop: 10, fontSize: 12.5, flexWrap: 'wrap' }}>
          <span className="row" style={{ gap: 6 }}><Icon name="event" size={14} /> {e.date || '일정 공개 예정'}</span>
          <span className="row" style={{ gap: 6 }}><Icon name="globe" size={14} /> {e.loc || '장소 공개 예정'}</span>
        </div>
      </div>
    </button>
  );
}

export function Events({
  catalog,
  initialIpId,
}: {
  catalog: Pick<CatalogSnapshot, 'ips' | 'events'>;
  initialIpId?: string;
}) {
  const [ipF, setIpF] = useState(initialIpId ?? ALL_IPS);
  const [modeF, setModeF] = useState(ALL_MODES);
  const [statusF, setStatusF] = useState(ALL_STATUSES);

  const ipsById = new Map(catalog.ips.map((ip) => [ip.id, ip]));
  const ipsWithEvents = catalog.ips.filter((ip) => catalog.events.some((e) => e.ip === ip.id));
  const modes = eventModeOptions(catalog.events);
  const statuses = eventStatusOptions(catalog.events);

  const list = selectFandomEvents(catalog.events, { ipId: ipF, mode: modeF, status: statusF });
  const featured = list[0];
  const rest = list.slice(1);
  const contextIp = ipF !== ALL_IPS ? ipsById.get(ipF) ?? null : null;

  return (
    <div className="screen">
      <div className="wrap" style={{ paddingTop: 48, paddingBottom: 80 }}>
        <div>
          <div className="eyebrow" style={{ marginBottom: 14 }}>Popup &amp; Ticketing</div>
          <h1 className="h-xl">
            {contextIp ? (
              <>
                <span style={{ color: contextIp.v.color }}>{contextIp.title}</span>의 팝업 · 이벤트
              </>
            ) : (
              '팝업 · 이벤트'
            )}
          </h1>
          <p className="muted" style={{ marginTop: 10 }}>
            {contextIp
              ? `${contextIp.title}의 팝업스토어 · 팬미팅 · 쇼케이스. 티켓 예매부터 현장 입장까지.`
              : '공식 팝업스토어 · 팬미팅 · 쇼케이스. 온·오프라인 이벤트를 발견하고 예매로 진입하세요.'}
          </p>
        </div>

        <div className="col" style={{ gap: 12, marginTop: 24 }}>
          <div className="wrapgap">
            <button className={'chip' + (ipF === ALL_IPS ? ' on' : '')} aria-pressed={ipF === ALL_IPS} onClick={() => setIpF(ALL_IPS)}>전체 IP</button>
            {ipsWithEvents.map((ip) => (
              <button
                key={ip.id}
                className={'chip' + (ipF === ip.id ? ' on accent' : '')}
                aria-pressed={ipF === ip.id}
                onClick={() => setIpF(ip.id)}
                style={ipF === ip.id ? { background: ip.v.color, borderColor: ip.v.color, color: '#0A0813' } : {}}
              >
                {ip.title}
              </button>
            ))}
          </div>
          {statuses.length > 0 && (
            <div className="wrapgap">
              <button className={'chip btn-sm' + (statusF === ALL_STATUSES ? ' on' : '')} aria-pressed={statusF === ALL_STATUSES} onClick={() => setStatusF(ALL_STATUSES)}>전체 상태</button>
              {statuses.map((s) => (
                <button key={s} className={'chip btn-sm' + (statusF === s ? ' on' : '')} aria-pressed={statusF === s} onClick={() => setStatusF(s)}>{s}</button>
              ))}
            </div>
          )}
          {modes.length > 0 && (
            <div className="wrapgap">
              <button className={'chip btn-sm' + (modeF === ALL_MODES ? ' on' : '')} aria-pressed={modeF === ALL_MODES} onClick={() => setModeF(ALL_MODES)}>전체 모드</button>
              {modes.map((m) => (
                <button key={m} className={'chip btn-sm' + (modeF === m ? ' on' : '')} aria-pressed={modeF === m} onClick={() => setModeF(m)}>{m}</button>
              ))}
            </div>
          )}
        </div>

        {featured ? (
          <FeaturedEvent e={featured} ip={featured.ip ? ipsById.get(featured.ip) ?? null : null} />
        ) : (
          <Empty
            icon="event"
            text={catalog.events.length ? '조건에 맞는 이벤트가 없어요' : '등록된 이벤트가 아직 없습니다'}
            sub={catalog.events.length ? '필터를 바꿔보세요' : 'Supabase 카탈로그 seed 또는 admin 등록 후 이벤트 목록에 공개됩니다.'}
          />
        )}

        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', marginTop: 24 }}>
          {rest.map((e) => (
            <EventCard key={e.id} e={e} ip={e.ip ? ipsById.get(e.ip) ?? null : null} />
          ))}
        </div>
      </div>
    </div>
  );
}
