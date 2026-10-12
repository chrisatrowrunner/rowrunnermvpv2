// Menu.tsx — Screen 3: Pam's Grill menu, dietary filters, quick-add.
import { useState } from 'react'
import { useStore } from '../store/store'
import { MENU, RESTAURANT, money, dietFor, etaRange } from '../data/menu'
import { Icon } from '../components/Icon'
import { AppHeader, RoundBtn, SeatPill, FoodTile, Tag } from '../components/ui'
import { AllergenSheet } from '../components/AllergenSheet'
import type { MenuItem } from '../types'

const logoWhite = '/assets/logo-lockup-white.png'

export function MenuScreen() {
  const s = useStore()
  const [diets, setDiets] = useState<string[]>([])
  const [sheetOpen, setSheetOpen] = useState(false)

  const items = MENU.filter((it) => {
    if (!diets.length) return true
    const d = dietFor(it.id)
    return diets.every((x) => d.includes(x))
  })
  const toggleDiet = (a: string) =>
    setDiets((ds) => (ds.includes(a) ? ds.filter((x) => x !== a) : [...ds, a]))
  const count = s.cart.reduce((n, l) => n + l.qty, 0)
  const subtotal = s.cart.reduce((acc, l) => acc + l.lineTotal, 0)

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--offwhite)' }}>
      {/* navy header */}
      <AppHeader>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <RoundBtn icon="back" label="Back" light onClick={() => s.nav('zone')} />
          <img src={logoWhite} alt="RowRunner" style={{ height: 22 }} />
          {s.seat && (
            <span style={{ marginLeft: 'auto' }}>
              <SeatPill seat={s.seat} onClick={() => s.nav('zone')} />
            </span>
          )}
        </div>
      </AppHeader>

      {/* scroll body */}
      <div className="rr-scroll" style={{ flex: 1, overflow: 'auto', padding: '16px 16px 120px' }}>
        {/* restaurant header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            background: '#fff',
            borderRadius: 20,
            padding: '16px',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <RestaurantLogo />
          <div style={{ minWidth: 0 }}>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: 'var(--navy)', lineHeight: 1.15 }}>{RESTAURANT.name}</h1>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted)', marginTop: 3 }}>{RESTAURANT.blurb}</div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                marginTop: 8,
                fontSize: 12.5,
                fontWeight: 800,
                color: 'var(--ice-deep)',
                background: 'rgba(91,184,212,.16)',
                padding: '4px 9px',
                borderRadius: 999,
              }}
            >
              <Icon name="clock" size={13} sw={2.6} /> {etaRange()} to your seat
            </div>
          </div>
        </div>

        {/* dietary filter button + active filter chips */}
        <div className="rr-scroll" style={{ display: 'flex', gap: 8, overflowX: 'auto', alignItems: 'center', margin: '16px -16px 4px', padding: '0 16px' }}>
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

        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--faint)', margin: '16px 2px 10px', letterSpacing: 0.3 }}>
          {items.length} item{items.length !== 1 ? 's' : ''}
          {diets.length ? ` · ${diets.join(' · ')}` : ''}
        </div>

        {items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px 24px', color: 'var(--muted)' }}>
            <div style={{ fontSize: 42, marginBottom: 10 }}>🥗</div>
            <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--navy)' }}>No items match your filters</div>
            <div style={{ fontSize: 13.5, marginTop: 6, fontWeight: 600 }}>Try removing a dietary filter.</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {items.map((it) => (
              <MenuRow key={it.id} item={it} />
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

/** Pam's Grill logo — shows a monogram until public/assets/pams-grill-logo.png exists. */
function RestaurantLogo() {
  const [failed, setFailed] = useState(false)
  const box = {
    width: 68,
    height: 68,
    borderRadius: 18,
    flex: '0 0 auto',
    overflow: 'hidden',
    boxShadow: 'inset 0 0 0 1px var(--line)',
  } as const
  if (failed) {
    return (
      <div
        aria-label={`${RESTAURANT.name} logo`}
        style={{
          ...box,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg,#E8753A,#C95A24)',
          color: '#fff',
          fontSize: 24,
          fontWeight: 800,
          letterSpacing: 0.5,
        }}
      >
        PG
      </div>
    )
  }
  return (
    <img
      src={RESTAURANT.logo}
      alt={`${RESTAURANT.name} logo`}
      onError={() => setFailed(true)}
      style={{ ...box, objectFit: 'cover', background: '#fff' }}
    />
  )
}

function MenuRow({ item }: { item: MenuItem }) {
  const s = useStore()
  const [added, setAdded] = useState(false)
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
        display: 'flex',
        gap: 14,
        alignItems: 'center',
        background: '#fff',
        borderRadius: 'var(--r-card)',
        padding: 12,
        boxShadow: 'var(--shadow-card)',
        cursor: 'pointer',
        transition: 'transform .12s',
      }}
      onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(.985)')}
      onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--navy)', lineHeight: 1.2 }}>{item.name}</span>
          {item.tag && <Tag tone="navy">{item.tag}</Tag>}
        </div>
        <div
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: 'var(--muted)',
            lineHeight: 1.4,
            marginTop: 4,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {item.desc}
        </div>
        <div style={{ fontSize: 15.5, fontWeight: 800, color: 'var(--navy)', marginTop: 7 }}>{money(item.price)}</div>
      </div>
      <div style={{ position: 'relative', width: 92, height: 92, flex: '0 0 auto' }}>
        <FoodTile emoji={item.emoji} tint={item.tint} size={92} />
        <button
          onClick={quickAdd}
          aria-label={`Add ${item.name}`}
          style={{
            position: 'absolute',
            right: -6,
            bottom: -6,
            width: 36,
            height: 36,
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
          <Icon name={added ? 'check' : 'plus'} size={19} sw={3} style={{ color: added ? '#fff' : 'var(--navy)' }} />
        </button>
      </div>
    </div>
  )
}
