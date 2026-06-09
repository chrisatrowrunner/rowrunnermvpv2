// Checkout.tsx — Screen 5: order summary, tip, payment.
import { useState, type CSSProperties, type ReactNode } from 'react'
import { useStore } from '../store/store'
import { money } from '../data/menu'
import { Icon } from '../components/Icon'
import { AppHeader, RoundBtn, BottomDock, CTA } from '../components/ui'

const TIPS = [0.15, 0.2, 0.25]

type TipSel = number | 'custom'

export function CheckoutScreen() {
  const s = useStore()
  const [openSummary, setOpenSummary] = useState(false)
  const [tipSel, setTipSel] = useState<TipSel>(1) // index into TIPS, or 'custom'
  const [customTip, setCustomTip] = useState('')
  const [card, setCard] = useState('')

  const base = s.totals()
  const tipAmt = tipSel === 'custom' ? parseFloat(customTip) || 0 : base.subtotal * TIPS[tipSel]
  const grand = base.total + tipAmt
  const itemCount = s.cart.reduce((n, l) => n + l.qty, 0)

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--offwhite)' }}>
      <AppHeader>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <RoundBtn icon="back" label="Back" onClick={s.back} />
          <h1 style={{ margin: 0, fontSize: 21, fontWeight: 800 }}>Checkout</h1>
        </div>
      </AppHeader>

      <div className="rr-scroll" style={{ flex: 1, overflow: 'auto', padding: '16px 16px 24px' }}>
        {/* who's it for — shown to the runner */}
        <SectionCard title="Your name" sub="So your runner knows who they're delivering to">
          <input
            value={s.customerName}
            onChange={(e) => s.setCustomerName(e.target.value)}
            placeholder="e.g. Alex"
            autoComplete="given-name"
            style={{ ...fieldStyle, width: '100%', height: 50 }}
          />
        </SectionCard>

        {/* collapsible order summary */}
        <div style={{ background: '#fff', borderRadius: 16, boxShadow: 'var(--shadow-card)', overflow: 'hidden' }}>
          <button onClick={() => setOpenSummary((o) => !o)} style={{ width: '100%', display: 'flex', alignItems: 'center', padding: '15px 16px', textAlign: 'left' }}>
            <span style={{ width: 38, height: 38, borderRadius: 11, background: 'var(--offwhite)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--navy)' }}>
              <Icon name="bag" size={19} />
            </span>
            <div style={{ marginLeft: 12, flex: 1 }}>
              <div style={{ fontSize: 15.5, fontWeight: 800, color: 'var(--navy)' }}>Order summary</div>
              <div style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 600 }}>
                {itemCount} items · {money(base.total)}
              </div>
            </div>
            <span style={{ color: 'var(--muted)', transform: openSummary ? 'rotate(180deg)' : 'none', transition: '.2s' }}>
              <Icon name="chevD" size={20} />
            </span>
          </button>
          {openSummary && (
            <div style={{ padding: '0 16px 14px' }}>
              {s.cart.map((l) => (
                <div key={l.uid} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', fontSize: 14, fontWeight: 600 }}>
                  <span style={{ color: 'var(--navy)' }}>
                    {l.qty}× {l.item.name}
                  </span>
                  <span style={{ color: 'var(--muted)' }}>{money(l.lineTotal)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* tip */}
        <SectionCard title="Tip your runner" sub="100% goes to Sarah & the runner crew">
          <div style={{ display: 'flex', gap: 9 }}>
            {TIPS.map((p, i) => (
              <button key={i} onClick={() => setTipSel(i)} style={tipBtn(tipSel === i)}>
                <div style={{ fontSize: 17, fontWeight: 800 }}>{Math.round(p * 100)}%</div>
                <div style={{ fontSize: 12, fontWeight: 700, opacity: 0.7 }}>{money(base.subtotal * p)}</div>
              </button>
            ))}
            <button onClick={() => setTipSel('custom')} style={tipBtn(tipSel === 'custom')}>
              <div style={{ fontSize: 15, fontWeight: 800 }}>Custom</div>
            </button>
          </div>
          {tipSel === 'custom' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, background: 'var(--offwhite)', borderRadius: 12, padding: '0 14px', height: 48 }}>
              <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--navy)' }}>$</span>
              <input
                value={customTip}
                onChange={(e) => setCustomTip(e.target.value.replace(/[^0-9.]/g, ''))}
                inputMode="decimal"
                placeholder="0.00"
                autoFocus
                style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 17, fontWeight: 800, color: 'var(--navy)', width: '100%' }}
              />
            </div>
          )}
        </SectionCard>

        {/* special instructions / dietary notes */}
        <SectionCard title="Special instructions" sub="Allergies, dietary needs, or a note for your runner">
          <textarea
            value={s.orderNotes}
            onChange={(e) => s.setOrderNotes(e.target.value.slice(0, 200))}
            placeholder="e.g. nut allergy — no peanuts; extra napkins please"
            rows={3}
            style={{
              width: '100%',
              resize: 'none',
              border: 'none',
              outline: 'none',
              background: 'var(--offwhite)',
              borderRadius: 12,
              padding: '12px 14px',
              fontSize: 15,
              fontWeight: 600,
              fontFamily: 'inherit',
              color: 'var(--navy)',
              lineHeight: 1.4,
            }}
          />
          <div style={{ textAlign: 'right', fontSize: 11.5, fontWeight: 700, color: 'var(--faint)', marginTop: 4 }}>
            {s.orderNotes.length}/200
          </div>
        </SectionCard>

        {/* payment */}
        <SectionCard title="Payment">
          <button
            onClick={() => s.placeOrder()}
            style={{ width: '100%', height: 52, borderRadius: 13, background: '#000', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, fontWeight: 700, fontSize: 18 }}
          >
            <svg width="17" height="21" viewBox="0 0 384 512" fill="#fff" style={{ marginTop: -2 }}>
              <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
            </svg>
            Pay
          </button>
          <button
            onClick={() => s.placeOrder()}
            style={{ width: '100%', height: 52, borderRadius: 13, marginTop: 10, background: '#fff', boxShadow: 'inset 0 0 0 1.5px var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, fontWeight: 700, fontSize: 16, color: '#3c4043' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.5 12.2c0-.8-.1-1.5-.2-2.2H12v4.2h5.9c-.3 1.4-1 2.5-2.2 3.3v2.8h3.6c2.1-1.9 3.2-4.7 3.2-8.1z" />
              <path fill="#34A853" d="M12 23c2.9 0 5.4-1 7.2-2.6l-3.6-2.8c-1 .7-2.3 1.1-3.6 1.1-2.8 0-5.1-1.9-6-4.4H2.3v2.9C4.1 20.8 7.8 23 12 23z" />
              <path fill="#FBBC05" d="M6 14.3c-.2-.7-.4-1.4-.4-2.3s.1-1.6.4-2.3V6.8H2.3C1.5 8.3 1 10.1 1 12s.5 3.7 1.3 5.2L6 14.3z" />
              <path fill="#EA4335" d="M12 5.3c1.6 0 3 .5 4.1 1.6l3.1-3.1C17.4 2 14.9 1 12 1 7.8 1 4.1 3.2 2.3 6.8L6 9.7c.9-2.5 3.2-4.4 6-4.4z" />
            </svg>
            Pay
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '16px 0' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
            <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--faint)' }}>or pay with card</span>
            <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--offwhite)', borderRadius: 12, padding: '0 14px', height: 50 }}>
            <svg width="26" height="18" viewBox="0 0 26 18">
              <rect width="26" height="18" rx="3" fill="#1A2A6C" opacity=".12" />
              <rect y="3.5" width="26" height="3.5" fill="var(--navy)" opacity=".5" />
            </svg>
            <input
              value={card}
              onChange={(e) => setCard(formatCard(e.target.value))}
              inputMode="numeric"
              placeholder="Card number"
              maxLength={19}
              style={{ border: 'none', outline: 'none', background: 'transparent', flex: 1, fontSize: 15.5, fontWeight: 700, color: 'var(--navy)' }}
            />
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
            <input placeholder="MM / YY" style={fieldStyle} />
            <input placeholder="CVC" inputMode="numeric" maxLength={4} style={fieldStyle} />
          </div>
        </SectionCard>
      </div>

      <BottomDock>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--muted)' }}>
            Total {tipAmt > 0 ? `(incl. ${money(tipAmt)} tip)` : ''}
          </span>
          <span style={{ fontSize: 21, fontWeight: 800, color: 'var(--navy)' }}>{money(grand)}</span>
        </div>
        <CTA label="Place Order" sub={`· ${money(grand)}`} icon="check" onClick={() => s.placeOrder()} />
      </BottomDock>
    </div>
  )
}

const tipBtn = (on: boolean): CSSProperties => ({
  flex: 1,
  padding: '11px 4px',
  borderRadius: 13,
  lineHeight: 1.2,
  background: on ? 'var(--ice)' : '#fff',
  color: 'var(--navy)',
  boxShadow: on ? '0 6px 14px rgba(91,184,212,.35)' : 'inset 0 0 0 1.5px var(--line)',
  transition: '.15s',
})

const fieldStyle: CSSProperties = {
  flex: 1,
  height: 50,
  border: 'none',
  outline: 'none',
  background: 'var(--offwhite)',
  borderRadius: 12,
  padding: '0 14px',
  fontSize: 15.5,
  fontWeight: 700,
  color: 'var(--navy)',
}

const formatCard = (v: string): string =>
  v
    .replace(/\D/g, '')
    .slice(0, 16)
    .replace(/(.{4})/g, '$1 ')
    .trim()

function SectionCard({ title, sub, children }: { title: string; sub?: string; children: ReactNode }) {
  return (
    <div style={{ background: '#fff', borderRadius: 18, padding: '16px 16px', marginTop: 14, boxShadow: 'var(--shadow-card)' }}>
      <div style={{ marginBottom: 13 }}>
        <h3 style={{ margin: 0, fontSize: 16.5, fontWeight: 800, color: 'var(--navy)' }}>{title}</h3>
        {sub && <div style={{ fontSize: 12.5, color: 'var(--muted)', fontWeight: 600, marginTop: 3 }}>{sub}</div>}
      </div>
      {children}
    </div>
  )
}
