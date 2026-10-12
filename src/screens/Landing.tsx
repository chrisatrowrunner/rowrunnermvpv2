// Landing.tsx — Screen 1: welcome after the QR scan.
import { useStore } from '../store/store'
import { VENUE } from '../data/menu'
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
          justifyContent: 'center',
          padding: '48px 24px 0',
          position: 'relative',
          zIndex: 2,
        }}
      >
        <img src={logoWhite} alt="RowRunner" style={{ width: 208, marginBottom: 14, flexShrink: 0 }} />
        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ice)', letterSpacing: 0.2, marginBottom: 44 }}>
          Skip the Line. Not the Game.
        </div>

        <div style={{ textAlign: 'center' }}>
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
          <div style={{ fontSize: 28, fontWeight: 800, lineHeight: 1.15, marginTop: 8 }}>{VENUE.name}</div>
          <div style={{ fontSize: 15, color: 'rgba(255,255,255,.7)', marginTop: 6, fontWeight: 600 }}>{VENUE.event}</div>
        </div>
      </div>

      <div style={{ padding: '16px 24px max(30px, env(safe-area-inset-bottom))', position: 'relative', zIndex: 2 }}>
        <CTA label="Continue" icon="arrowR" onClick={() => s.nav('zone')} />
      </div>
    </div>
  )
}
