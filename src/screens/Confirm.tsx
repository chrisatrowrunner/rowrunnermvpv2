// Confirm.tsx — Screen 6: order confirmed, ETA, and the live tracker preview.
import { useStore } from '../store/store'
import { Icon } from '../components/Icon'
import { CTA } from '../components/ui'
import { StatusTracker } from '../components/StatusTracker'

export function ConfirmScreen() {
  const s = useStore()
  const itemCount = s.cart.reduce((n, l) => n + l.qty, 0)
  const stands = s.stands()
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
      <div className="rr-scroll" style={{ flex: 1, overflow: 'auto', padding: '78px 24px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* checkmark */}
        <div style={{ position: 'relative', width: 96, height: 96, marginBottom: 6, flexShrink: 0 }}>
          <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid rgba(91,184,212,.4)', animation: 'rr-pop .5s ease both' }} />
          <div
            style={{
              position: 'absolute',
              inset: 14,
              borderRadius: '50%',
              background: 'var(--ice)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--navy)',
              boxShadow: '0 10px 30px rgba(91,184,212,.5)',
              animation: 'rr-pop .5s .1s ease both',
            }}
          >
            <Icon name="check" size={40} sw={3.4} />
          </div>
        </div>
        <h1 style={{ margin: '10px 0 0', fontSize: 27, fontWeight: 800 }}>Order Confirmed!</h1>
        <div style={{ fontSize: 15, fontWeight: 600, color: 'rgba(255,255,255,.7)', marginTop: 6 }}>
          Order #{s.orderNo} · {itemCount} items
        </div>

        {/* ETA card */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, background: 'rgba(91,184,212,.14)', border: '1px solid rgba(91,184,212,.3)', borderRadius: 18, padding: '14px 20px', marginTop: 22 }}>
          <Icon name="clock" size={26} style={{ color: 'var(--ice)' }} />
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', color: 'rgba(255,255,255,.6)' }}>
              {stands.length > 1 ? 'Everything delivered by' : 'Estimated delivery'}
            </div>
            <div style={{ fontSize: 21, fontWeight: 800, color: '#fff' }}>~{Math.max(1, Math.ceil(s.etaSec / 60))} minutes</div>
          </div>
        </div>

        {/* per-stand breakdown when the order spans multiple stands */}
        {stands.length > 1 && (
          <div style={{ width: '100%', background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.10)', borderRadius: 18, padding: '14px 16px', marginTop: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: 0.6, textTransform: 'uppercase', color: 'rgba(255,255,255,.55)', marginBottom: 4 }}>
              Coming from {stands.length} stands
            </div>
            {stands.map((st) => (
              <div key={st.vendor} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: '1px solid rgba(255,255,255,.08)' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 800, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{st.vendor}</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,.55)' }}>{st.items} item{st.items !== 1 ? 's' : ''}</div>
                </div>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 13, fontWeight: 800, color: 'var(--ice)', background: 'rgba(91,184,212,.16)', padding: '5px 10px', borderRadius: 999, flex: '0 0 auto' }}>
                  <Icon name="clock" size={13} sw={2.6} /> ~{st.etaMin} min
                </span>
              </div>
            ))}
          </div>
        )}

        {/* tracker */}
        <div style={{ width: '100%', background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.10)', borderRadius: 20, padding: '22px 20px 12px', marginTop: 24 }}>
          <StatusTracker stage={s.orderStage} dark />
        </div>

        <div style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--ice)', marginTop: 20, textAlign: 'center' }}>
          You won't miss a thing. We'll bring it right to you.
        </div>
      </div>

      <div style={{ padding: '12px 24px max(30px, env(safe-area-inset-bottom))' }}>
        <CTA label="Track your order" icon="pin" onClick={() => s.nav('track')} />
        <button onClick={() => s.nav('track')} style={{ width: '100%', marginTop: 13, fontSize: 14.5, fontWeight: 700, color: 'rgba(255,255,255,.7)' }}>
          View order details
        </button>
      </div>
    </div>
  )
}
