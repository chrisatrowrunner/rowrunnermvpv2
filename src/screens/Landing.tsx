// Landing.tsx — Screen 1: seat confirmation after the QR scan.
import { Fragment } from 'react'
import { useStore } from '../store/store'
import { VENUE, SEAT } from '../data/menu'
import { Icon } from '../components/Icon'
import { CTA } from '../components/ui'

// Served from public/assets at the site root.
const logoWhite = '/assets/logo-lockup-white.png'

export function LandingScreen() {
  const s = useStore()
  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        background: 'radial-gradient(130% 70% at 50% 0%, #0E3F5E 0%, #072E48 60%, #05263B 100%)',
        color: '#fff',
        overflow: 'hidden',
      }}
    >
      {/* faint stadium glow rings */}
      <div
        style={{
          position: 'absolute',
          top: -120,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 520,
          height: 520,
          borderRadius: '50%',
          border: '1px solid rgba(91,184,212,.12)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: -60,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 360,
          height: 360,
          borderRadius: '50%',
          border: '1px solid rgba(91,184,212,.10)',
        }}
      />

      <div
        className="rr-scroll"
        style={{
          flex: 1,
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '92px 24px 0',
          position: 'relative',
          zIndex: 2,
        }}
      >
        <img src={logoWhite} alt="RowRunner" style={{ width: 208, marginBottom: 14, flexShrink: 0 }} />
        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ice)', letterSpacing: 0.2, marginBottom: 40 }}>
          Skip the Line. Not the Game.
        </div>

        <div style={{ textAlign: 'center', marginBottom: 8 }}>
          <div
            style={{
              fontSize: 12.5,
              fontWeight: 700,
              letterSpacing: 1.6,
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,.55)',
            }}
          >
            You're at
          </div>
          <div style={{ fontSize: 23, fontWeight: 800, lineHeight: 1.2, marginTop: 6 }}>{VENUE.name}</div>
          <div style={{ fontSize: 14.5, color: 'rgba(255,255,255,.7)', marginTop: 4, fontWeight: 600 }}>
            {VENUE.event}
          </div>
        </div>

        {/* seat card */}
        <div
          style={{
            width: '100%',
            background: '#fff',
            color: 'var(--navy)',
            borderRadius: 24,
            marginTop: 26,
            padding: '24px 22px',
            boxShadow: '0 18px 40px rgba(0,0,0,.28)',
            animation: 'rr-rise .5s ease both',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              color: 'var(--ice-deep)',
              fontWeight: 800,
              fontSize: 12.5,
              letterSpacing: 1.2,
              textTransform: 'uppercase',
              justifyContent: 'center',
            }}
          >
            <Icon name="pin" size={15} sw={2.6} /> Your Seat
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: 18 }}>
            {(
              [
                ['Section', SEAT.section],
                ['Row', SEAT.row],
                ['Seat', SEAT.seat],
              ] as const
            ).map(([k, v], i) => (
              <Fragment key={k}>
                {i > 0 && <div style={{ width: 1, background: 'var(--line)' }} />}
                <div style={{ textAlign: 'center', padding: '0 6px' }}>
                  <div
                    style={{
                      fontSize: 11.5,
                      fontWeight: 700,
                      color: 'var(--muted)',
                      letterSpacing: 0.6,
                      textTransform: 'uppercase',
                    }}
                  >
                    {k}
                  </div>
                  <div style={{ fontSize: 38, fontWeight: 800, lineHeight: 1.05, marginTop: 2 }}>{v}</div>
                </div>
              </Fragment>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 16, fontSize: 14.5, color: 'var(--muted)', fontWeight: 600 }}>
            Confirm your seat to start ordering
          </div>
        </div>
      </div>

      <div style={{ padding: '16px 24px max(30px, env(safe-area-inset-bottom))', position: 'relative', zIndex: 2 }}>
        <CTA label="This is my seat" icon="check" onClick={() => s.nav('menu')} />
        <button
          onClick={() => s.toast('Seat editing is disabled in this demo')}
          style={{ width: '100%', marginTop: 14, fontSize: 15, fontWeight: 700, color: 'rgba(255,255,255,.75)' }}
        >
          Change seat
        </button>
      </div>
    </div>
  )
}
