// Track.tsx — Screen 7: live order tracking with counting-down ETA + runner card.
import { useStore } from '../store/store'
import { Icon } from '../components/Icon'
import { AppHeader, RoundBtn } from '../components/ui'
import { StatusTracker, STEPS, LOCS, toStep } from '../components/StatusTracker'

export function TrackScreen() {
  const s = useStore()
  const stage = s.orderStage
  const mins = Math.floor(s.etaSec / 60)
  const secs = s.etaSec % 60
  const arrived = stage >= 4
  // Per-stand live countdown: faster stands arrive before the whole order does.
  const stands = s.stands()
  const maxSec = stands.reduce((m, st) => Math.max(m, st.etaMin * 60), 0)
  const elapsed = maxSec - s.etaSec
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--offwhite)' }}>
      <AppHeader>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <RoundBtn icon="back" label="Back" onClick={() => s.nav('menu')} />
          <div>
            <h1 style={{ margin: 0, fontSize: 19, fontWeight: 800 }}>Order #{s.orderNo}</h1>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: 'rgba(255,255,255,.6)' }}>{STEPS[toStep(stage)]?.label}</div>
          </div>
          <span
            style={{
              marginLeft: 'auto',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 12.5,
              fontWeight: 800,
              color: 'var(--ice)',
              background: 'rgba(91,184,212,.16)',
              padding: '6px 11px',
              borderRadius: 999,
            }}
          >
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--ice)', animation: 'rr-pulse 1.6s infinite' }} /> LIVE
          </span>
        </div>
      </AppHeader>

      <div className="rr-scroll" style={{ flex: 1, overflow: 'auto', padding: '18px 16px 24px' }}>
        {/* big ETA */}
        <div style={{ background: 'var(--navy)', borderRadius: 22, padding: '26px 22px', color: '#fff', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', right: -30, top: -30, width: 160, height: 160, borderRadius: '50%', border: '1.5px solid rgba(91,184,212,.16)' }} />
          <div style={{ fontSize: 12.5, fontWeight: 800, letterSpacing: 0.8, textTransform: 'uppercase', color: 'rgba(255,255,255,.6)' }}>
            {arrived ? 'Your order is here' : 'Arriving in'}
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
            <span style={{ fontSize: 58, fontWeight: 800, lineHeight: 1, color: 'var(--ice)', fontVariantNumeric: 'tabular-nums' }}>
              {arrived ? '🎉' : mins > 0 ? mins : secs}
            </span>
            {!arrived && <span style={{ fontSize: 22, fontWeight: 800, color: 'rgba(255,255,255,.85)' }}>{mins > 0 ? 'min' : 'sec'}</span>}
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, marginTop: 14, fontSize: 13.5, fontWeight: 700, background: 'rgba(255,255,255,.10)', padding: '7px 12px', borderRadius: 999 }}>
            <span style={{ animation: 'rr-run 1s infinite' }}>🏃</span> {LOCS[toStep(stage)]}
          </div>
        </div>

        {/* runner card — populated once a runner claims the order */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, background: '#fff', borderRadius: 18, padding: '14px 16px', marginTop: 14, boxShadow: 'var(--shadow-card)' }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              background: s.runnerName ? 'linear-gradient(135deg,#5BB8D4,#3AA3C2)' : 'var(--offwhite)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: s.runnerName ? '#fff' : 'var(--faint)',
              fontWeight: 800,
              fontSize: 20,
              flex: '0 0 auto',
            }}
          >
            {s.runnerName ? s.runnerName[0].toUpperCase() : '🏃'}
          </div>
          <div style={{ flex: 1 }}>
            {s.runnerName ? (
              <>
                <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--navy)' }}>{s.runnerName} · Your runner</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2, color: 'var(--muted)', fontSize: 13, fontWeight: 700 }}>
                  <Icon name="star" size={14} style={{ color: 'var(--amber)' }} /> On the way to you
                </div>
              </>
            ) : (
              <>
                <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--navy)' }}>Finding your runner…</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--muted)', marginTop: 2 }}>We'll assign one shortly</div>
              </>
            )}
          </div>
        </div>

        {/* handoff code — guest reads this to the runner at delivery */}
        {s.orderCode && !arrived && (
          <div style={{ background: 'var(--navy)', borderRadius: 18, padding: '16px 18px', marginTop: 14, textAlign: 'center' }}>
            <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: 0.8, textTransform: 'uppercase', color: 'rgba(255,255,255,.6)' }}>
              Your pickup code
            </div>
            <div style={{ fontSize: 40, fontWeight: 800, letterSpacing: 8, color: 'var(--ice)', fontVariantNumeric: 'tabular-nums', marginTop: 4 }}>
              {s.orderCode}
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,.7)', marginTop: 2 }}>
              Give this to your runner to confirm delivery
            </div>
          </div>
        )}

        {/* per-stand live ETAs — faster stands land before the full order */}
        {stands.length > 1 && (
          <div style={{ background: '#fff', borderRadius: 20, padding: '16px 18px', marginTop: 14, boxShadow: 'var(--shadow-card)' }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--faint)', letterSpacing: 0.4, marginBottom: 12 }}>
              FROM {stands.length} STANDS
            </div>
            {stands.map((st, i) => {
              const remaining = Math.max(0, st.etaMin * 60 - elapsed)
              const here = arrived || remaining <= 0
              return (
                <div
                  key={st.vendor}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '10px 0',
                    borderTop: i === 0 ? 'none' : '1px solid var(--line)',
                  }}
                >
                  <span
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: '50%',
                      flex: '0 0 auto',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: here ? 'var(--green)' : 'rgba(91,184,212,.16)',
                      color: here ? '#fff' : 'var(--ice-deep)',
                    }}
                  >
                    {here ? <Icon name="check" size={16} sw={3} /> : <Icon name="bag" size={16} />}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14.5, fontWeight: 800, color: 'var(--navy)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{st.vendor}</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)' }}>{st.items} item{st.items !== 1 ? 's' : ''}</div>
                  </div>
                  <span style={{ fontSize: 13.5, fontWeight: 800, color: here ? 'var(--green)' : 'var(--ice-deep)', flex: '0 0 auto' }}>
                    {here ? 'Arrived' : `~${Math.max(1, Math.ceil(remaining / 60))} min`}
                  </span>
                </div>
              )
            })}
          </div>
        )}

        {/* tracker */}
        <div style={{ background: '#fff', borderRadius: 20, padding: '20px 18px 8px', marginTop: 14, boxShadow: 'var(--shadow-card)' }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--faint)', letterSpacing: 0.4, marginBottom: 16 }}>ORDER PROGRESS</div>
          <StatusTracker stage={arrived ? 5 : stage} />
        </div>

        <button onClick={() => s.toast('Connecting you with stadium support…')} style={{ width: '100%', marginTop: 16, fontSize: 14.5, fontWeight: 800, color: 'var(--ice-deep)' }}>
          Need help?
        </button>
      </div>
    </div>
  )
}
