// ZonePicker.tsx — Screen 2: the guest taps where they are on the venue map.
//
// The URI Soccer Complex's seats aren't numbered, so the delivery destination
// is a zone: the south bleachers (A0–A4) or a standing area (B north sideline,
// C east end, D west end). Schematic, not to scale — traced from the site plan,
// with zones sized for thumbs. ONLY the eight zones are interactive; everything
// else on the map is decoration (pointer-events: none).
import type { KeyboardEvent, ReactNode } from 'react'
import { useStore } from '../store/store'
import { ZONES } from '../data/menu'
import { Icon } from '../components/Icon'
import { AppHeader, RoundBtn, BottomDock, CTA } from '../components/ui'
import type { Zone } from '../types'

const NAVY = '#072E48'
const ICE = '#5BB8D4'
const BLEACHER = { fill: '#CFDBEE', stroke: '#2D4E8A', text: NAVY }
const STANDING = { fill: '#F5DFA0', stroke: '#C9A646', text: '#7A5A00' }

// Zone geometry in map units (viewBox 0 0 420 360).
type Rect = { x: number; y: number; w: number; h: number }
const GEOM: Record<string, Rect> = {
  B: { x: 66, y: 38, w: 260, h: 44 },
  D: { x: 16, y: 110, w: 44, h: 150 },
  C: { x: 332, y: 110, w: 44, h: 150 },
  A0: { x: 40, y: 278, w: 52, h: 40 },
  A1: { x: 96, y: 270, w: 66, h: 54 },
  A2: { x: 163, y: 270, w: 66, h: 54 },
  A3: { x: 230, y: 270, w: 66, h: 54 },
  A4: { x: 300, y: 278, w: 52, h: 40 },
}

export function ZonePickerScreen() {
  const s = useStore()
  const picked = s.zone

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--offwhite)' }}>
      <AppHeader>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <RoundBtn icon="back" label="Back" light onClick={() => s.nav('landing')} />
          <div>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>Where are you?</h1>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: 'rgba(255,255,255,.65)' }}>URI Soccer Complex</div>
          </div>
        </div>
      </AppHeader>

      <div className="rr-scroll" style={{ flex: 1, overflow: 'auto', padding: '16px 16px 20px' }}>
        <p style={{ margin: '2px 2px 12px', fontSize: 14.5, lineHeight: 1.45, fontWeight: 600, color: 'var(--muted)' }}>
          Seats aren't numbered — tap the section or area you're in and your runner will find you there.
        </p>

        <div style={{ background: '#fff', borderRadius: 20, padding: '10px 8px 6px', boxShadow: 'var(--shadow-card)' }}>
          <VenueMap selected={picked?.id ?? null} onPick={s.setZone} />
        </div>

        {/* legend (not interactive) */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 16px', margin: '12px 4px 0', fontSize: 12.5, fontWeight: 700, color: 'var(--muted)' }}>
          <Legend swatch={BLEACHER}>Bleachers</Legend>
          <Legend swatch={STANDING}>Standing</Legend>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span aria-hidden style={{ fontSize: 14 }}>🚚</span> Pam's Grill · east gate
          </span>
        </div>

        {/* what's selected */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            marginTop: 16,
            background: '#fff',
            borderRadius: 16,
            padding: '14px 16px',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <span
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              flex: '0 0 auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: picked ? 'rgba(91,184,212,.16)' : 'var(--offwhite)',
              color: picked ? 'var(--ice-deep)' : 'var(--faint)',
            }}
          >
            <Icon name="pin" size={22} />
          </span>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 11.5, fontWeight: 800, letterSpacing: 0.6, textTransform: 'uppercase', color: 'var(--faint)' }}>
              Delivering to
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, color: picked ? 'var(--navy)' : 'var(--faint)', marginTop: 2 }}>
              {picked ? `${picked.label} · ${picked.detail}` : 'Tap your area on the map'}
            </div>
          </div>
        </div>
      </div>

      <BottomDock>
        <CTA label="Continue" icon="arrowR" disabled={!picked} onClick={() => s.nav('menu')} />
      </BottomDock>
    </div>
  )
}

function Legend({ swatch, children }: { swatch: { fill: string; stroke: string }; children: ReactNode }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <span style={{ width: 14, height: 14, borderRadius: 4, background: swatch.fill, boxShadow: `inset 0 0 0 1.5px ${swatch.stroke}` }} />
      {children}
    </span>
  )
}

function VenueMap({ selected, onPick }: { selected: string | null; onPick: (id: string) => void }) {
  return (
    <svg
      viewBox="0 0 420 360"
      width="100%"
      role="group"
      aria-label="URI Soccer Complex map — choose your section or area"
      style={{ display: 'block', touchAction: 'manipulation', fontFamily: 'var(--font)' }}
    >
      {/* ── decoration: none of this is interactive ── */}
      <g style={{ pointerEvents: 'none' }} aria-hidden>
        {/* Tootell Rd, outside the east fence */}
        <rect x={388} y={0} width={32} height={360} fill="#E4E7EB" />
        <text x={404} y={70} fill="#8A96A3" fontSize={10} fontWeight={700} textAnchor="middle" transform="rotate(90 404 70)">
          Tootell Rd
        </text>

        {/* fence line */}
        <rect x={10} y={26} width={372} height={326} rx={8} fill="#F7F9F8" stroke="#3B4A57" strokeWidth={1.4} strokeDasharray="6 5" />

        {/* north arrow */}
        <g transform="translate(36 12)">
          <path d="M0 -8 L5 6 L0 3 L-5 6 Z" fill={NAVY} />
          <text x={12} y={5} fontSize={9.5} fontWeight={800} fill={NAVY}>
            N
          </text>
        </g>

        {/* team benches */}
        <rect x={146} y={89} width={100} height={14} rx={2} fill="#E3E6EC" stroke="#9AA3AE" strokeWidth={1} />
        <text x={196} y={99} fontSize={8} fontWeight={700} fill="#5E6873" textAnchor="middle" letterSpacing={0.6}>
          TEAM BENCHES
        </text>

        {/* the pitch */}
        <rect x={66} y={110} width={260} height={150} rx={4} fill="#4E9F5E" />
        <g fill="none" stroke="rgba(255,255,255,.85)" strokeWidth={1.6}>
          <line x1={196} y1={110} x2={196} y2={260} />
          <circle cx={196} cy={185} r={26} />
          <rect x={66} y={144} width={44} height={82} />
          <rect x={66} y={166} width={18} height={38} />
          <rect x={282} y={144} width={44} height={82} />
          <rect x={308} y={166} width={18} height={38} />
        </g>
        <circle cx={196} cy={185} r={2.2} fill="#fff" />
        <text x={196} y={140} fontSize={11} fontWeight={800} fill="rgba(255,255,255,.9)" textAnchor="middle" letterSpacing={1.2}>
          SOCCER FIELD
        </text>

        {/* east gate + Pam's Grill truck */}
        <rect x={379} y={176} width={6} height={18} rx={1.5} fill="#3B4A57" />
        <rect x={389} y={168} width={30} height={34} rx={8} fill="#E8753A" />
        <text x={404} y={191} fontSize={15} textAnchor="middle">
          🚚
        </text>

        <text x={196} y={341} fontSize={11.5} fontWeight={800} fill="#2D4E8A" textAnchor="middle">
          Zone A · South bleachers
        </text>
      </g>

      {/* ── the only interactive elements: the eight zones ── */}
      {ZONES.map((z) => (
        <ZoneShape key={z.id} zone={z} rect={GEOM[z.id]} on={selected === z.id} onPick={onPick} />
      ))}
    </svg>
  )
}

function ZoneShape({ zone, rect, on, onPick }: { zone: Zone; rect: Rect; on: boolean; onPick: (id: string) => void }) {
  const tone = zone.kind === 'bleacher' ? BLEACHER : STANDING
  const { x, y, w, h } = rect
  const cx = x + w / 2
  const cy = y + h / 2
  const vertical = zone.id === 'C' || zone.id === 'D'
  const onKey = (e: KeyboardEvent<SVGGElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onPick(zone.id)
    }
  }
  const caption =
    zone.kind === 'bleacher' ? zone.id : zone.id === 'B' ? 'Zone B · North sideline' : `Zone ${zone.id} · ${zone.id === 'C' ? 'East' : 'West'}`

  return (
    <g
      role="button"
      tabIndex={0}
      aria-pressed={on}
      aria-label={`${zone.label}, ${zone.detail}`}
      onClick={() => onPick(zone.id)}
      onKeyDown={onKey}
      style={{ cursor: 'pointer', outline: 'none' }}
    >
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={6}
        fill={on ? ICE : tone.fill}
        stroke={on ? NAVY : tone.stroke}
        strokeWidth={on ? 3 : 1.5}
        style={{ transition: 'fill .15s, stroke .15s' }}
      />
      <text
        x={cx}
        y={cy}
        dy="0.35em"
        textAnchor="middle"
        fontSize={zone.kind === 'bleacher' ? (w > 60 ? 16 : 14) : 12.5}
        fontWeight={800}
        fill={on ? NAVY : tone.text}
        transform={vertical ? `rotate(${zone.id === 'D' ? -90 : 90} ${cx} ${cy})` : undefined}
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >
        {caption}
      </text>
      {on && (
        <g transform={`translate(${x + w - 2} ${y + 2})`} style={{ pointerEvents: 'none' }}>
          <circle r={9} fill={NAVY} stroke="#fff" strokeWidth={2} />
          <path d="M-4 0.5 L-1.2 3.2 L4 -2.6" fill="none" stroke="#fff" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
        </g>
      )}
    </g>
  )
}
