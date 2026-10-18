// Checkout.tsx — Screen 5: order summary, tip, payment.
import { useState, type CSSProperties, type ReactNode } from 'react'
import { useStore } from '../store/store'
import { money } from '../data/menu'
import { Icon } from '../components/Icon'
import { AppHeader, RoundBtn, BottomDock, CTA } from '../components/ui'
import { StripeCheckout } from '../components/StripeCheckout'
import { hasStripe } from '../lib/payments'
import { seatLines } from '../lib/seat'

const TIPS = [0.15, 0.2, 0.25]

type TipSel = number | 'custom'

export function CheckoutScreen() {
  const s = useStore()
  const [openSummary, setOpenSummary] = useState(false)
  const [tipSel, setTipSel] = useState<TipSel>(1) // index into TIPS, or 'custom'
  const [customTip, setCustomTip] = useState('')

  const base = s.totals()
  const tipAmt = tipSel === 'custom' ? parseFloat(customTip) || 0 : base.subtotal * TIPS[tipSel]
  const grand = base.total + tipAmt
  const itemCount = s.cart.reduce((n, l) => n + l.qty, 0)

  // what the server needs to price + charge the order (name drives the items summary)
  const payLines = s.cart.map((l) => ({
    itemId: l.item.id,
    name: l.item.name,
    option: l.option,
    addons: l.addons,
    qty: l.qty,
  }))
  const tipCents = Math.round(tipAmt * 100)
  const amountCents = Math.round(grand * 100)
  const canPay = s.customerName.trim().length > 0 && s.cart.length > 0
  // seat/customer/notes → stamped on the payment for the vendor + records
  const ctx = {
    seatText: s.seat ? seatLines(s.seat).text : '',
    customerName: s.customerName.trim(),
    notes: s.orderNotes.trim(),
  }

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
        <SectionCard title="Tip your runner" sub="100% goes to your runner">
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
        <SectionCard title="Payment" sub={hasStripe ? 'Apple Pay, Google Pay, or card' : undefined}>
          {hasStripe ? (
            canPay ? (
              <StripeCheckout
                lines={payLines}
                tipCents={tipCents}
                amountCents={amountCents}
                ctx={ctx}
                onPaid={(pi) => s.placeOrder(pi)}
              />
            ) : (
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--muted)' }}>
                Enter your name above to continue to payment.
              </div>
            )
          ) : (
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--muted)', marginBottom: 12 }}>
                Demo mode — no live payments configured. You can place the order directly.
              </div>
              <CTA label="Place order (demo)" icon="check" disabled={!canPay} onClick={() => s.placeOrder()} />
            </div>
          )}
        </SectionCard>
      </div>

      <BottomDock>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--muted)' }}>
            Total {tipAmt > 0 ? `(incl. ${money(tipAmt)} tip)` : ''}
          </span>
          <span style={{ fontSize: 21, fontWeight: 800, color: 'var(--navy)' }}>{money(grand)}</span>
        </div>
        {hasStripe && (
          <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--faint)', textAlign: 'center', marginTop: 8 }}>
            Complete payment above to place your order
          </div>
        )}
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
