// ui.tsx — shared RowRunner presentational components.
import { useRef, type CSSProperties, type ReactNode } from 'react'
import { Icon, type IconName } from './Icon'
import { TINTS } from '../data/menu'
import type { Seat, TintKey } from '../types'

// ── Status-bar-safe navy header ──────────────────────────────
export function AppHeader({
  children,
  pad = true,
  style,
}: {
  children: ReactNode
  pad?: boolean
  style?: CSSProperties
}) {
  return (
    <div
      style={{
        background: 'var(--navy)',
        color: '#fff',
        flex: '0 0 auto',
        paddingTop: 'var(--status-pad)',
        position: 'relative',
        zIndex: 5,
        ...style,
      }}
    >
      <div style={{ padding: pad ? '4px 18px 14px' : 0 }}>{children}</div>
    </div>
  )
}

// round glass button for headers (on navy)
export function RoundBtn({
  icon,
  onClick,
  label,
  light,
  size = 40,
}: {
  icon: IconName
  onClick?: () => void
  label: string
  light?: boolean
  size?: number
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        flex: '0 0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: light ? 'rgba(255,255,255,.14)' : '#fff',
        color: light ? '#fff' : 'var(--navy)',
        transition: 'transform .12s, background .2s',
      }}
      onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(.9)')}
      onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
    >
      <Icon name={icon} size={20} sw={2.4} />
    </button>
  )
}

// seat pill (Sec 112 · G8)
export function SeatPill({
  seat,
  onClick,
  light = true,
}: {
  seat: Seat
  onClick?: () => void
  light?: boolean
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        height: 34,
        padding: '0 12px',
        borderRadius: 999,
        fontSize: 13.5,
        fontWeight: 700,
        letterSpacing: 0.1,
        background: light ? 'rgba(91,184,212,.18)' : 'var(--offwhite)',
        color: light ? 'var(--ice)' : 'var(--navy)',
        border: light ? '1px solid rgba(91,184,212,.35)' : '1px solid var(--line)',
      }}
    >
      <Icon name="pin" size={14} sw={2.4} />
      Sec {seat.section} · {seat.row}
      {seat.seat}
    </button>
  )
}

// ── Primary CTA (ice blue, navy text) bottom-anchored ────────
export function CTA({
  label,
  sub,
  onClick,
  disabled,
  variant = 'primary',
  icon,
}: {
  label: string
  sub?: string
  onClick?: () => void
  disabled?: boolean
  variant?: 'primary' | 'navy' | 'outline'
  icon?: IconName
}) {
  const styles: Record<string, CSSProperties> = {
    primary: { background: disabled ? '#BFD9E3' : 'var(--ice)', color: 'var(--navy)' },
    navy: { background: 'var(--navy)', color: '#fff' },
    outline: { background: 'transparent', color: 'var(--navy)', boxShadow: 'inset 0 0 0 2px var(--navy)' },
  }
  const s = styles[variant]
  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      style={{
        width: '100%',
        height: 58,
        borderRadius: 16,
        fontSize: 17.5,
        fontWeight: 800,
        letterSpacing: 0.2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 9,
        boxShadow:
          variant === 'primary' && !disabled
            ? '0 8px 20px rgba(91,184,212,.4)'
            : (s.boxShadow as string) || 'none',
        transition: 'transform .12s, opacity .2s',
        opacity: disabled ? 0.85 : 1,
        cursor: disabled ? 'default' : 'pointer',
        ...s,
      }}
      onMouseDown={(e) => !disabled && (e.currentTarget.style.transform = 'scale(.975)')}
      onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
    >
      {icon && <Icon name={icon} size={20} sw={2.6} />}
      <span>{label}</span>
      {sub && <span style={{ fontWeight: 700, opacity: 0.7 }}>{sub}</span>}
    </button>
  )
}

// bottom dock that holds the CTA, clears home indicator
export function BottomDock({
  children,
  border = true,
}: {
  children: ReactNode
  border?: boolean
}) {
  return (
    <div
      style={{
        flex: '0 0 auto',
        background: '#fff',
        padding: '12px 18px max(30px, env(safe-area-inset-bottom))',
        borderTop: border ? '1px solid var(--line)' : 'none',
        boxShadow: '0 -6px 24px rgba(7,46,72,.06)',
        zIndex: 6,
      }}
    >
      {children}
    </div>
  )
}

// ── Quantity stepper ─────────────────────────────────────────
export function QtyStepper({
  qty,
  setQty,
  big,
}: {
  qty: number
  setQty: (q: number) => void
  big?: boolean
}) {
  const s = big ? 44 : 32
  const btn = (dir: number, icon: IconName, off: boolean) => (
    <button
      disabled={off}
      onClick={() => setQty(Math.max(1, qty + dir))}
      style={{
        width: s,
        height: s,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: off ? 'var(--offwhite)' : '#fff',
        color: off ? 'var(--faint)' : 'var(--navy)',
        boxShadow: 'inset 0 0 0 1.5px var(--line)',
        transition: 'transform .1s',
      }}
      onMouseDown={(e) => !off && (e.currentTarget.style.transform = 'scale(.88)')}
      onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
    >
      <Icon name={icon} size={big ? 20 : 16} sw={2.6} />
    </button>
  )
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: big ? 16 : 12 }}>
      {btn(-1, 'minus', qty <= 1)}
      <span style={{ minWidth: big ? 26 : 20, textAlign: 'center', fontWeight: 800, fontSize: big ? 20 : 16 }}>
        {qty}
      </span>
      {btn(1, 'plus', false)}
    </div>
  )
}

// emoji tile (the "photo")
export function FoodTile({
  emoji,
  tint,
  size = '100%',
  radius = 'var(--r-tile)',
  big,
}: {
  emoji: string
  tint: TintKey
  size?: number | string
  radius?: number | string
  big?: boolean
}) {
  return (
    <div
      style={{
        width: '100%',
        height: size,
        background: TINTS[tint] || TINTS.slate,
        borderRadius: radius,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      <span style={{ fontSize: big ? 58 : 40, lineHeight: 1, filter: 'drop-shadow(0 4px 8px rgba(7,46,72,.18))' }}>
        {emoji}
      </span>
    </div>
  )
}

export function Tag({
  children,
  tone = 'ice',
}: {
  children: ReactNode
  tone?: 'ice' | 'navy' | 'amber' | 'green'
}) {
  const tones = {
    ice: { bg: 'rgba(91,184,212,.16)', c: 'var(--ice-deep)' },
    navy: { bg: 'var(--navy)', c: '#fff' },
    amber: { bg: 'rgba(245,158,11,.16)', c: '#B45309' },
    green: { bg: 'rgba(34,197,94,.15)', c: '#15803D' },
  }[tone]
  return (
    <span
      style={{
        fontSize: 10.5,
        fontWeight: 800,
        letterSpacing: 0.4,
        textTransform: 'uppercase',
        padding: '4px 8px',
        borderRadius: 7,
        background: tones.bg,
        color: tones.c,
      }}
    >
      {children}
    </span>
  )
}

// ── Confetti burst ───────────────────────────────────────────
export function Confetti({ count = 70 }: { count?: number }) {
  const colors = ['#5BB8D4', '#87CEEB', '#FFFFFF', '#22C55E', '#F59E0B', '#0B3A5A']
  const pieces = useRef(
    [...Array(count)].map((_, i) => ({
      left: Math.random() * 100,
      delay: Math.random() * 0.6,
      dur: 1.8 + Math.random() * 1.6,
      c: colors[i % colors.length],
      w: 6 + Math.random() * 7,
      h: 9 + Math.random() * 9,
      rot: Math.random() * 360,
      round: Math.random() > 0.7,
    })),
  ).current
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 40 }}>
      {pieces.map((p, i) => (
        <span
          key={i}
          style={{
            position: 'absolute',
            top: -24,
            left: p.left + '%',
            width: p.w,
            height: p.h,
            background: p.c,
            borderRadius: p.round ? '50%' : 2,
            transform: `rotate(${p.rot}deg)`,
            animation: `rr-fall ${p.dur}s ${p.delay}s cubic-bezier(.4,.1,.6,1) forwards`,
          }}
        />
      ))}
    </div>
  )
}
