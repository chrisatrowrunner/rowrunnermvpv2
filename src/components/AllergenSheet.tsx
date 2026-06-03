// AllergenSheet.tsx — bottom sheet for multi-selecting dietary filters.
import { ALLERGENS } from '../data/menu'
import { Icon } from './Icon'

export function AllergenSheet({
  open,
  selected,
  onToggle,
  onClear,
  onClose,
}: {
  open: boolean
  selected: string[]
  onToggle: (a: string) => void
  onClear: () => void
  onClose: () => void
}) {
  if (!open) return null
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 90, display: 'flex', flexDirection: 'column' }}>
      {/* backdrop */}
      <button
        aria-label="Close"
        onClick={onClose}
        style={{ position: 'absolute', inset: 0, background: 'rgba(7,46,72,.45)', animation: 'rr-rise .2s ease both' }}
      />
      {/* sheet */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          background: '#fff',
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          padding: '10px 18px max(24px, env(safe-area-inset-bottom))',
          boxShadow: '0 -12px 40px rgba(7,46,72,.25)',
          animation: 'rr-sheet .26s cubic-bezier(.2,.8,.2,1) both',
        }}
      >
        <div style={{ width: 40, height: 5, borderRadius: 999, background: 'var(--line)', margin: '0 auto 14px' }} />
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 6 }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: 'var(--navy)' }}>Dietary filters</h3>
          {selected.length > 0 && (
            <button onClick={onClear} style={{ marginLeft: 'auto', fontSize: 14, fontWeight: 800, color: 'var(--ice-deep)' }}>
              Clear
            </button>
          )}
        </div>
        <div style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 600, marginBottom: 12 }}>
          Select any that apply — we'll only show matching items.
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {ALLERGENS.map((a) => {
            const on = selected.includes(a)
            return (
              <button
                key={a}
                onClick={() => onToggle(a)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  width: '100%',
                  padding: '14px 14px',
                  borderRadius: 14,
                  textAlign: 'left',
                  background: on ? 'rgba(91,184,212,.12)' : 'var(--offwhite)',
                  boxShadow: on ? 'inset 0 0 0 1.5px var(--ice)' : 'none',
                  transition: '.15s',
                }}
              >
                <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--navy)' }}>{a}</span>
                <span
                  style={{
                    marginLeft: 'auto',
                    width: 24,
                    height: 24,
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: on ? 'var(--navy)' : 'transparent',
                    boxShadow: on ? 'none' : 'inset 0 0 0 2px var(--line)',
                    color: '#fff',
                    flex: '0 0 auto',
                  }}
                >
                  {on && <Icon name="check" size={16} sw={3} />}
                </span>
              </button>
            )
          })}
        </div>

        <button
          onClick={onClose}
          style={{
            width: '100%',
            height: 54,
            marginTop: 16,
            borderRadius: 16,
            background: 'var(--ice)',
            color: 'var(--navy)',
            fontSize: 16.5,
            fontWeight: 800,
            boxShadow: '0 8px 20px rgba(91,184,212,.4)',
          }}
        >
          {selected.length ? `Show results · ${selected.length} selected` : 'Done'}
        </button>
      </div>
    </div>
  )
}
