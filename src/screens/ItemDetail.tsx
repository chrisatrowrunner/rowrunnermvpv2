// ItemDetail.tsx — Screen 3: options, add-ons, quantity, add to cart.
import { useState, type ReactNode } from 'react'
import { useStore } from '../store/store'
import { money, vendorsFor, optionsFor, extrasFor } from '../data/menu'
import { Icon } from '../components/Icon'
import { RoundBtn, FoodTile, Tag, QtyStepper, BottomDock, CTA } from '../components/ui'
import type { MenuItem } from '../types'

export function ItemScreen({ item }: { item: MenuItem }) {
  const s = useStore()
  const vendors = vendorsFor(item)
  const [vendorIdx, setVendorIdx] = useState(0) // fastest by default
  const [opt, setOpt] = useState<number | null>(item.options ? 0 : null)
  const [addons, setAddons] = useState<Record<number, boolean>>({})
  const [qty, setQty] = useState(1)

  const vendor = vendors[vendorIdx]
  // Flavors + extras are the chosen restaurant's, not the item's.
  const options = vendor ? optionsFor(item, vendor.id) : item.options
  const extras = vendor ? extrasFor(item, vendor.id) : item.addons

  const optDelta = options && opt !== null ? options.choices[opt].d : 0
  const addDelta = extras.reduce((acc, a, i) => acc + (addons[i] ? a.d : 0), 0)
  const unit = item.price + optDelta + addDelta
  const total = unit * qty

  // Switching restaurants changes the available flavors/extras — reset the picks.
  const selectVendor = (i: number) => {
    setVendorIdx(i)
    setOpt(item.options ? 0 : null)
    setAddons({})
  }

  const submit = () => {
    s.addToCart({
      item,
      qty,
      vendor: vendor ? vendor.name : '',
      etaMin: vendor ? vendor.etaMin : 0,
      option: options && opt !== null ? options.choices[opt].name : null,
      addons: extras.filter((_, i) => addons[i]).map((a) => a.name),
      lineTotal: total,
    })
    s.nav('cart')
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#fff' }}>
      {/* hero */}
      <div style={{ flex: '0 0 auto', position: 'relative', height: 268 }}>
        <FoodTile emoji={item.emoji} tint={item.tint} size={268} radius={0} big />
        <div style={{ position: 'absolute', top: 'var(--status-pad)', left: 16 }}>
          <RoundBtn icon="back" label="Back" onClick={s.back} />
        </div>
        <div style={{ position: 'absolute', top: 'var(--status-pad)', right: 16 }}>
          <RoundBtn icon="heart" label="Save" onClick={() => s.toast('Saved to favorites')} />
        </div>
        {item.tag && (
          <div style={{ position: 'absolute', left: 18, bottom: 18 }}>
            <Tag tone="navy">{item.tag}</Tag>
          </div>
        )}
      </div>

      <div className="rr-scroll" style={{ flex: 1, overflow: 'auto', padding: '20px 18px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
          <h1 style={{ margin: 0, fontSize: 25, fontWeight: 800, lineHeight: 1.15, color: 'var(--navy)' }}>{item.name}</h1>
          <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--navy)', whiteSpace: 'nowrap' }}>{money(item.price)}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, color: 'var(--ice-deep)', fontSize: 13.5, fontWeight: 700 }}>
          <Icon name="clock" size={15} sw={2.4} /> {vendors.length} spots nearby · from {vendors[0].etaMin} min
        </div>
        <p style={{ marginTop: 12, fontSize: 15, lineHeight: 1.55, color: 'var(--muted)', fontWeight: 500, textWrap: 'pretty' }}>
          {item.desc}
        </p>

        {/* where to order from — restaurants serving this item, each with its ETA */}
        <Section title="Where to order from" required>
          {vendors.map((v, i) => (
            <Row key={v.id} onClick={() => selectVendor(i)}>
              <span style={{ minWidth: 0 }}>
                <span style={{ display: 'block', fontWeight: 800, color: 'var(--navy)', fontSize: 15.5 }}>{v.name}</span>
                <span style={{ display: 'block', color: 'var(--muted)', fontWeight: 600, fontSize: 12.5, marginTop: 1 }}>{v.loc}</span>
              </span>
              <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12, flex: '0 0 auto' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    fontSize: 12.5,
                    fontWeight: 800,
                    color: 'var(--ice-deep)',
                    background: 'rgba(91,184,212,.16)',
                    padding: '5px 9px',
                    borderRadius: 999,
                  }}
                >
                  <Icon name="clock" size={13} sw={2.6} /> {v.etaMin} min
                </span>
                <Radio on={vendorIdx === i} />
              </span>
            </Row>
          ))}
        </Section>

        {/* options — flavors are the chosen restaurant's */}
        {options && (
          <Section title={options.label} required>
            {options.choices.map((c, i) => (
              <Row key={i} onClick={() => setOpt(i)}>
                <span style={{ fontWeight: 700, color: 'var(--navy)', fontSize: 15.5 }}>{c.name}</span>
                <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
                  {c.d > 0 && <span style={{ color: 'var(--muted)', fontWeight: 700, fontSize: 14 }}>+{money(c.d)}</span>}
                  <Radio on={opt === i} />
                </span>
              </Row>
            ))}
          </Section>
        )}

        {/* addons — extras are the chosen restaurant's */}
        {extras.length > 0 && (
          <Section title={`Extras from ${vendor ? vendor.name : 'this spot'}`} optional>
            {extras.map((a, i) => (
              <Row key={i} onClick={() => setAddons((s2) => ({ ...s2, [i]: !s2[i] }))}>
                <span style={{ fontWeight: 700, color: 'var(--navy)', fontSize: 15.5 }}>{a.name}</span>
                <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ color: 'var(--muted)', fontWeight: 700, fontSize: 14 }}>+{money(a.d)}</span>
                  <Check on={!!addons[i]} />
                </span>
              </Row>
            ))}
          </Section>
        )}

        {/* qty */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 26 }}>
          <span style={{ fontWeight: 800, fontSize: 16, color: 'var(--navy)' }}>Quantity</span>
          <QtyStepper qty={qty} setQty={setQty} big />
        </div>
      </div>

      <BottomDock>
        <CTA label="Add to Cart" sub={`· ${money(total)}`} icon="bag" onClick={submit} />
      </BottomDock>
    </div>
  )
}

function Section({ title, required, optional, children }: { title: string; required?: boolean; optional?: boolean; children: ReactNode }) {
  return (
    <div style={{ marginTop: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <h3 style={{ margin: 0, fontSize: 16.5, fontWeight: 800, color: 'var(--navy)' }}>{title}</h3>
        {required && <Tag tone="amber">Required</Tag>}
        {optional && <span style={{ fontSize: 13, color: 'var(--faint)', fontWeight: 600 }}>Optional</span>}
      </div>
      <div style={{ background: 'var(--offwhite)', borderRadius: 16, overflow: 'hidden' }}>{children}</div>
    </div>
  )
}

function Row({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{ width: '100%', display: 'flex', alignItems: 'center', padding: '14px 16px', borderBottom: '1px solid var(--line)', textAlign: 'left' }}
    >
      {children}
    </button>
  )
}

function Radio({ on }: { on: boolean }) {
  return (
    <span
      style={{
        width: 22,
        height: 22,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: on ? 'none' : 'inset 0 0 0 2px var(--line)',
        background: on ? 'var(--ice)' : 'transparent',
        transition: '.15s',
      }}
    >
      {on && <span style={{ width: 9, height: 9, borderRadius: '50%', background: 'var(--navy)' }} />}
    </span>
  )
}

function Check({ on }: { on: boolean }) {
  return (
    <span
      style={{
        width: 22,
        height: 22,
        borderRadius: 7,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: on ? 'none' : 'inset 0 0 0 2px var(--line)',
        background: on ? 'var(--navy)' : 'transparent',
        color: '#fff',
        transition: '.15s',
      }}
    >
      {on && <Icon name="check" size={15} sw={3} />}
    </span>
  )
}
