// StatusTracker.tsx — vertical order-progress tracker, shared by Confirm + Track.
import { Icon } from './Icon'

export const STEPS = [
  { key: 'received', label: 'Order received', note: 'We sent it to the kitchen' },
  { key: 'prep', label: 'Being prepared', note: 'Your runner is standing by' },
  { key: 'pickup', label: 'Picked up by runner', note: 'Sarah grabbed your order' },
  { key: 'otw', label: 'On the way', note: 'Heading to your section' },
  { key: 'delivered', label: 'Delivered', note: 'Enjoy the game!' },
] as const

export const LOCS = [
  'Kitchen · Stand 4',
  'Kitchen · Stand 4',
  'Section 118 · concourse',
  'Section 109 — heading your way',
  'At your seat',
]

export function StatusTracker({ stage, dark }: { stage: number; dark?: boolean }) {
  const txt = dark ? '#fff' : 'var(--navy)'
  const mut = dark ? 'rgba(255,255,255,.55)' : 'var(--muted)'
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {STEPS.map((s, i) => {
        const done = i < stage
        const active = i === stage
        const color = done ? 'var(--green)' : active ? 'var(--amber)' : dark ? 'rgba(255,255,255,.22)' : 'var(--line)'
        return (
          <div key={s.key} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: '0 0 auto' }}>
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: done || active ? color : 'transparent',
                  boxShadow: active
                    ? '0 0 0 0 rgba(245,158,11,.5)'
                    : done
                      ? 'none'
                      : `inset 0 0 0 2px ${color}`,
                  color: '#fff',
                  animation: active ? 'rr-pulse 1.6s infinite' : 'none',
                  transition: '.3s',
                }}
              >
                {done && <Icon name="check" size={15} sw={3} />}
                {active && <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff' }} />}
              </div>
              {i < STEPS.length - 1 && (
                <div
                  style={{
                    width: 2.5,
                    height: 34,
                    borderRadius: 2,
                    background: done ? 'var(--green)' : dark ? 'rgba(255,255,255,.18)' : 'var(--line)',
                    transition: '.3s',
                  }}
                />
              )}
            </div>
            <div style={{ paddingTop: 2, paddingBottom: 14 }}>
              <div style={{ fontSize: 15.5, fontWeight: 800, color: done || active ? txt : mut }}>{s.label}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: mut, marginTop: 1 }}>{active ? LOCS[i] : s.note}</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
