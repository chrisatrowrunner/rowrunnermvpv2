// Menu.tsx — Screen 2: browse Food / Drinks / Merch, search, allergen chips, quick-add.
import { useState } from 'react'
import { useStore } from '../store/store'
import { MENU, money, SEAT, dietFor, vendorsFor, fastestEta } from '../data/menu'
import { Icon } from '../components/Icon'
import { AppHeader, RoundBtn, SeatPill, FoodTile, Tag } from '../components/ui'
import { AllergenSheet } from '../components/AllergenSheet'
import type { Category, MenuItem } from '../types'

const logoWhite = '/assets/logo-lockup-white.png'

const CATS: [Category, string][] = [
  ['food', 'Food'],
  ['drinks', 'Drinks'],
  ['merch', 'Merch'],
]

export function MenuScreen() {
  const s = useStore()
  const [q, setQ] = useState('')
  const [diets, setDiets] = useState<string[]>([])
  const [sheetOpen, setSheetOpen] = useState(false)
  const [under5, setUnder5] = useState(false)
  const [sortQuickest, setSortQuickest] = useState(false)
  const cat = s.category

  // Allergen filters apply to food & drinks (merch has no dietary tags).
  let items = MENU[cat].filter((it) => {
    if (q && !it.name.toLowerCase().includes(q.toLowerCase())) return false
    if (cat !== 'merch' && diets.length) {
      const d = dietFor(it.id)
      if (!diets.every((x) => d.includes(x))) return false
    }
    if (under5 && fastestEta(it) > 5) return false
    return true
  })
  if (sortQuickest) {
    items = [...items].sort((a, b) => fastestEta(a) - fastestEta(b))
  }
  const toggleDiet = (a: string) =>
    setDiets((ds) => (ds.includes(a) ? ds.filter((x) => x !== a) : [...ds, a]))
  const count = s.cart.reduce((n, l) => n + l.qty, 0)
  const subtotal = s.cart.reduce((acc, l) => acc + l.lineTotal, 0)
  const catLabel = CATS.find((c) => c[0] === cat)![1]

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--offwhite)' }}>
      {/* navy header */}
      <AppHeader>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <RoundBtn icon="back" label="Back" light onClick={() => s.nav('landing')} />
          <img src={logoWhite} alt="RowRunner" style={{ height: 22 }} />
          <span style={{ marginLeft: 'auto' }}>
            <SeatPill seat={SEAT} onClick={() => s.toast('Delivering to Sec ' + SEAT.section + ' · ' + SEAT.row + SEAT.seat)} />
          </span>
        </div>
        {/* category tabs */}
        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          {CATS.map(([k, label]) => (
            <button
              key={k}
              onClick={() => s.setCategory(k)}
              style={{
                flex: 1,
                height: 40,
                borderRadius: 11,
                fontSize: 14.5,
                fontWeight: 800,
                letterSpacing: 0.2,
                background: cat === k ? 'var(--ice)' : 'rgba(255,255,255,.10)',
                color: cat === k ? 'var(--navy)' : 'rgba(255,255,255,.8)',
                transition: 'background .2s, color .2s',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </AppHeader>

      {/* scroll body */}
      <div className="rr-scroll" style={{ flex: 1, overflow: 'auto', padding: '16px 16px 120px' }}>
        {/* search */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            height: 46,
            padding: '0 14px',
            background: '#fff',
            borderRadius: 13,
            boxShadow: 'var(--shadow-card)',
            color: 'var(--faint)',
          }}
        >
          <Icon name="search" size={19} sw={2.4} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={`Search ${catLabel.toLowerCase()}…`}
            style={{
              border: 'none',
              outline: 'none',
              flex: 1,
              fontSize: 15.5,
              fontWeight: 600,
              color: 'var(--ink)',
              background: 'transparent',
            }}
          />
          {q && (
            <button onClick={() => setQ('')} style={{ color: 'var(--faint)' }}>
              <Icon name="x" size={18} />
            </button>
          )}
        </div>

        {/* dietary filter button + active filter chips */}
        <div className="rr-scroll" style={{ display: 'flex', gap: 8, overflowX: 'auto', alignItems: 'center', margin: '14px -16px 4px', padding: '0 16px' }}>
          <button
            onClick={() => setSheetOpen(true)}
            style={{
              flex: '0 0 auto',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              height: 34,
              padding: '0 14px',
              borderRadius: 999,
              fontSize: 13,
              fontWeight: 700,
              whiteSpace: 'nowrap',
              background: diets.length ? 'var(--navy)' : '#fff',
              color: diets.length ? '#fff' : 'var(--muted)',
              boxShadow: diets.length ? 'none' : 'inset 0 0 0 1px var(--line)',
            }}
          >
            <Icon name="leaf" size={15} sw={2.2} />
            Dietary filters
            {diets.length > 0 && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: 18,
                  height: 18,
                  padding: '0 5px',
                  borderRadius: 999,
                  background: 'var(--ice)',
                  color: 'var(--navy)',
                  fontSize: 11.5,
                  fontWeight: 800,
                }}
              >
                {diets.length}
              </span>
            )}
          </button>

          <ToggleChip icon="clock" label="Under 5 min" on={under5} onClick={() => setUnder5((v) => !v)} />
          <ToggleChip icon="spark" label="Quickest to me" on={sortQuickest} onClick={() => setSortQuickest((v) => !v)} />

          {diets.map((a) => (
            <button
              key={a}
              onClick={() => toggleDiet(a)}
              style={{
                flex: '0 0 auto',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                height: 34,
                padding: '0 10px 0 14px',
                borderRadius: 999,
                fontSize: 13,
                fontWeight: 700,
                whiteSpace: 'nowrap',
                background: 'rgba(91,184,212,.16)',
                color: 'var(--ice-deep)',
              }}
            >
              {a}
              <Icon name="x" size={15} sw={2.6} />
            </button>
          ))}
        </div>

        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--faint)', margin: '18px 2px 10px', letterSpacing: 0.3 }}>
          {items.length} item{items.length !== 1 ? 's' : ''}
          {cat !== 'merch' && diets.length ? ` · ${diets.join(' · ')}` : ''}
        </div>

        {/* grid */}
        {items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px 24px', color: 'var(--muted)' }}>
            <div style={{ fontSize: 42, marginBottom: 10 }}>🥗</div>
            <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--navy)' }}>No items match your filters</div>
            <div style={{ fontSize: 13.5, marginTop: 6, fontWeight: 600 }}>Try removing a dietary filter or your search.</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 13 }}>
            {items.map((it) => (
              <MenuCard key={it.id} item={it} />
            ))}
          </div>
        )}
      </div>

      <AllergenSheet
        open={sheetOpen}
        selected={diets}
        onToggle={toggleDiet}
        onClear={() => setDiets([])}
        onClose={() => setSheetOpen(false)}
      />

      {/* floating cart */}
      {count > 0 && (
        <button
          onClick={() => s.nav('cart')}
          style={{
            position: 'absolute',
            left: 16,
            right: 16,
            bottom: 'max(30px, env(safe-area-inset-bottom))',
            height: 58,
            borderRadius: 16,
            background: 'var(--navy)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            padding: '0 8px 0 18px',
            boxShadow: '0 12px 28px rgba(7,46,72,.34)',
            zIndex: 30,
            animation: 'rr-rise .3s ease both',
          }}
        >
          <span
            style={{
              width: 30,
              height: 30,
              borderRadius: '50%',
              background: 'var(--ice)',
              color: 'var(--navy)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: 14.5,
            }}
          >
            {count}
          </span>
          <span style={{ marginLeft: 12, fontWeight: 800, fontSize: 16 }}>View cart</span>
          <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10, fontWeight: 800, fontSize: 16 }}>
            {money(subtotal)}
            <span
              style={{
                width: 42,
                height: 42,
                borderRadius: 12,
                background: 'rgba(255,255,255,.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon name="bag" size={20} />
            </span>
          </span>
        </button>
      )}
    </div>
  )
}

function ToggleChip({
  icon,
  label,
  on,
  onClick,
}: {
  icon: 'clock' | 'spark'
  label: string
  on: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: '0 0 auto',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        height: 34,
        padding: '0 14px',
        borderRadius: 999,
        fontSize: 13,
        fontWeight: 700,
        whiteSpace: 'nowrap',
        background: on ? 'var(--navy)' : '#fff',
        color: on ? '#fff' : 'var(--muted)',
        boxShadow: on ? 'none' : 'inset 0 0 0 1px var(--line)',
        transition: 'all .15s',
      }}
    >
      <Icon name={icon} size={15} sw={2.2} />
      {label}
    </button>
  )
}

function MenuCard({ item }: { item: MenuItem }) {
  const s = useStore()
  const [added, setAdded] = useState(false)
  const spots = vendorsFor(item)
  const quickAdd = (e: React.MouseEvent) => {
    e.stopPropagation()
    s.quickAdd(item)
    setAdded(true)
    setTimeout(() => setAdded(false), 900)
  }
  return (
    <div
      onClick={() => s.openItem(item)}
      style={{
        background: '#fff',
        borderRadius: 'var(--r-card)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-card)',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform .12s',
      }}
      onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(.98)')}
      onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
    >
      <div style={{ position: 'relative' }}>
        <FoodTile emoji={item.emoji} tint={item.tint} size={120} radius={0} big />
        {item.tag && (
          <div style={{ position: 'absolute', top: 9, left: 9 }}>
            <Tag tone={item.tint === 'navy' ? 'ice' : 'navy'}>{item.tag}</Tag>
          </div>
        )}
        <button
          onClick={quickAdd}
          style={{
            position: 'absolute',
            right: 9,
            bottom: -16,
            width: 38,
            height: 38,
            borderRadius: '50%',
            background: added ? 'var(--green)' : 'var(--ice)',
            color: 'var(--navy)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 6px 14px rgba(7,46,72,.22)',
            transition: 'transform .15s, background .2s',
            transform: added ? 'scale(1.12)' : 'scale(1)',
          }}
        >
          <Icon name={added ? 'check' : 'plus'} size={20} sw={3} style={{ color: added ? '#fff' : 'var(--navy)' }} />
        </button>
      </div>
      <div style={{ padding: '12px 12px 14px' }}>
        <div style={{ fontSize: 14.5, fontWeight: 800, lineHeight: 1.2, color: 'var(--navy)', minHeight: 35, textWrap: 'pretty' }}>
          {item.name}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3, color: 'var(--muted)', fontSize: 12.5, fontWeight: 600 }}>
          <Icon name="clock" size={13} sw={2.4} /> {spots.length} spots · from {spots[0].etaMin} min
        </div>
        <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--navy)', marginTop: 7 }}>{money(item.price)}</div>
      </div>
    </div>
  )
}
