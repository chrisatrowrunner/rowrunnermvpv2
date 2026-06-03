// Cart.tsx — Screen 4: line items, live fee math, swipe-to-remove.
import { useRef, useState } from 'react'
import { useStore } from '../store/store'
import { money, SEAT } from '../data/menu'
import { Icon } from '../components/Icon'
import { AppHeader, RoundBtn, SeatPill, FoodTile, QtyStepper, BottomDock, CTA } from '../components/ui'
import type { CartLine } from '../types'

export function CartScreen() {
  const s = useStore()
  const t = s.totals()
  const empty = s.cart.length === 0
  const itemCount = s.cart.reduce((n, l) => n + l.qty, 0)

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--offwhite)' }}>
      <AppHeader>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <RoundBtn icon="back" label="Back" onClick={s.back} />
          <h1 style={{ margin: 0, fontSize: 21, fontWeight: 800 }}>Your Order</h1>
          <span style={{ marginLeft: 'auto' }}>
            <SeatPill seat={SEAT} />
          </span>
        </div>
      </AppHeader>

      <div className="rr-scroll" style={{ flex: 1, overflow: 'auto', padding: '16px 16px 28px' }}>
        {/* delivery destination */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, background: '#fff', borderRadius: 16, padding: '14px 16px', boxShadow: 'var(--shadow-card)' }}>
          <span
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: 'rgba(91,184,212,.16)',
              color: 'var(--ice-deep)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flex: '0 0 auto',
            }}
          >
            <Icon name="pin" size={22} />
          </span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11.5, fontWeight: 800, letterSpacing: 0.6, textTransform: 'uppercase', color: 'var(--faint)' }}>
              Delivering to
            </div>
            <div style={{ fontSize: 15.5, fontWeight: 800, color: 'var(--navy)', marginTop: 2 }}>
              Section {SEAT.section} · Row {SEAT.row} · Seat {SEAT.seat}
            </div>
          </div>
        </div>

        {empty ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--muted)' }}>
            <div style={{ fontSize: 46, marginBottom: 10 }}>🛒</div>
            <div style={{ fontWeight: 800, fontSize: 17, color: 'var(--navy)' }}>Your cart is empty</div>
            <div style={{ fontSize: 14, marginTop: 6, fontWeight: 600 }}>Add something tasty to get started.</div>
            <div style={{ marginTop: 18 }}>
              <CTA label="Browse menu" variant="navy" onClick={() => s.nav('menu')} />
            </div>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '20px 2px 10px' }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--faint)', letterSpacing: 0.3 }}>
                {itemCount} ITEM{itemCount !== 1 ? 'S' : ''}
              </span>
              <button onClick={() => s.nav('menu')} style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--ice-deep)' }}>
                + Add more
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {s.cart.map((line) => (
                <CartRow key={line.uid} line={line} />
              ))}
            </div>

            {/* cost breakdown */}
            <div style={{ background: '#fff', borderRadius: 18, padding: '16px 18px', marginTop: 18, boxShadow: 'var(--shadow-card)' }}>
              {(
                [
                  ['Subtotal', t.subtotal],
                  ['Service fee (10.5%)', t.service],
                  ['Delivery fee', t.delivery],
                  ['Taxes', t.tax],
                ] as const
              ).map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', fontSize: 14.5, fontWeight: 600, color: 'var(--muted)' }}>
                  <span>{k}</span>
                  <span>{money(v)}</span>
                </div>
              ))}
              <div style={{ height: 1, background: 'var(--line)', margin: '10px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--navy)' }}>Total</span>
                <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--navy)' }}>{money(t.total)}</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, marginTop: 14, color: 'var(--faint)', fontSize: 12.5, fontWeight: 600 }}>
              <Icon name="info" size={14} /> Swipe an item left to remove it
            </div>
          </>
        )}
      </div>

      {!empty && (
        <BottomDock>
          <CTA label="Proceed to Checkout" sub={`· ${money(t.total)}`} icon="arrowR" onClick={() => s.nav('checkout')} />
        </BottomDock>
      )}
    </div>
  )
}

function CartRow({ line }: { line: CartLine }) {
  const s = useStore()
  const [dx, setDx] = useState(0)
  const start = useRef<number | null>(null)
  const onDown = (e: React.PointerEvent) => {
    start.current = e.clientX
  }
  const onMove = (e: React.PointerEvent) => {
    if (start.current == null) return
    setDx(Math.max(-96, Math.min(0, e.clientX - start.current)))
  }
  const onUp = () => {
    if (dx < -56) setDx(-80)
    else setDx(0)
    start.current = null
  }
  const sub = [line.vendor, line.option, ...line.addons].filter(Boolean).join(' · ')
  return (
    <div style={{ position: 'relative', borderRadius: 'var(--r-card)', overflow: 'hidden' }}>
      {/* delete bg */}
      <button
        onClick={() => s.removeLine(line.uid)}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'var(--red)',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          paddingRight: 28,
          gap: 6,
          fontWeight: 800,
          fontSize: 13,
        }}
      >
        <Icon name="trash" size={20} />
      </button>
      <div
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerLeave={onUp}
        style={{
          position: 'relative',
          background: '#fff',
          borderRadius: 'var(--r-card)',
          padding: '12px',
          display: 'flex',
          gap: 12,
          boxShadow: 'var(--shadow-card)',
          transform: `translateX(${dx}px)`,
          transition: start.current == null ? 'transform .2s' : 'none',
          touchAction: 'pan-y',
          cursor: 'grab',
        }}
      >
        <div style={{ width: 64, height: 64, flex: '0 0 auto' }}>
          <FoodTile emoji={line.item.emoji} tint={line.item.tint} size={64} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--navy)', lineHeight: 1.2 }}>{line.item.name}</div>
          {sub && (
            <div style={{ fontSize: 12.5, color: 'var(--muted)', fontWeight: 600, marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {sub}
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 9 }}>
            <span style={{ fontSize: 15.5, fontWeight: 800, color: 'var(--navy)' }}>{money(line.lineTotal)}</span>
            <QtyStepper qty={line.qty} setQty={(q) => s.setQty(line.uid, q)} />
          </div>
        </div>
      </div>
    </div>
  )
}
