// Done.tsx — Screen 8: delivery celebration + runner rating.
import { useState } from 'react'
import { useStore } from '../store/store'
import { Icon } from '../components/Icon'
import { CTA, Confetti } from '../components/ui'

export function DoneScreen() {
  const s = useStore()
  const [stars, setStars] = useState(0)
  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'radial-gradient(120% 60% at 50% 0%, #0E3F5E, #072E48 70%)',
        color: '#fff',
        position: 'relative',
      }}
    >
      {s.tweaks.confetti && <Confetti />}
      <div className="rr-scroll" style={{ flex: 1, overflow: 'auto', padding: '84px 26px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 2 }}>
        <div style={{ position: 'relative', width: 104, height: 104, flexShrink: 0 }}>
          <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'rgba(91,184,212,.18)', animation: 'rr-pop .5s ease both' }} />
          <div
            style={{
              position: 'absolute',
              inset: 16,
              borderRadius: '50%',
              background: 'var(--ice)',
              color: 'var(--navy)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 12px 34px rgba(91,184,212,.55)',
              animation: 'rr-pop .5s .1s ease both',
            }}
          >
            <Icon name="check" size={46} sw={3.4} />
          </div>
        </div>
        <h1 style={{ margin: '18px 0 0', fontSize: 28, fontWeight: 800, textAlign: 'center' }}>Your order has arrived!</h1>
        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--ice)', marginTop: 8 }}>Enjoy the game! 🏟️</div>

        {/* rating */}
        <div style={{ width: '100%', background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 20, padding: '20px', marginTop: 30, textAlign: 'center' }}>
          <div style={{ fontSize: 15, fontWeight: 800 }}>How was Sarah's service?</div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 14 }}>
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                onClick={() => {
                  setStars(n)
                  s.toast(n >= 4 ? 'Thanks for the love!' : 'Thanks for the feedback')
                }}
                style={{ transition: 'transform .12s', transform: n <= stars ? 'scale(1.12)' : 'scale(1)' }}
              >
                <Icon name="star" size={40} sw={1.6} style={{ color: n <= stars ? 'var(--amber)' : 'rgba(255,255,255,.25)', fill: n <= stars ? 'var(--amber)' : 'transparent' }} />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ padding: '12px 26px max(30px, env(safe-area-inset-bottom))', position: 'relative', zIndex: 2 }}>
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={s.exit}
            style={{
              flex: 1,
              height: 58,
              borderRadius: 16,
              fontSize: 16.5,
              fontWeight: 800,
              color: '#fff',
              boxShadow: 'inset 0 0 0 1.5px rgba(255,255,255,.45)',
            }}
          >
            Exit
          </button>
          <span style={{ flex: 1.4 }}>
            <CTA label="Order Again" icon="arrowR" onClick={s.reset} />
          </span>
        </div>
        <button
          onClick={() => s.toast('Added an extra tip for Sarah — thank you!')}
          style={{ width: '100%', marginTop: 12, fontSize: 14.5, fontWeight: 700, color: 'rgba(255,255,255,.7)' }}
        >
          Add a tip for your runner
        </button>
      </div>
    </div>
  )
}
