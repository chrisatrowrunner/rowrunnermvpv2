// App.tsx — RowRunner fan ordering flow: routing shell + toast.
import { StoreProvider, useStore } from './store/store'
import { Icon } from './components/Icon'
import { LandingScreen } from './screens/Landing'
import { MenuScreen } from './screens/Menu'
import { ItemScreen } from './screens/ItemDetail'
import { CartScreen } from './screens/Cart'
import { CheckoutScreen } from './screens/Checkout'
import { ConfirmScreen } from './screens/Confirm'
import { TrackScreen } from './screens/Track'
import { DoneScreen } from './screens/Done'

function Router() {
  const s = useStore()
  switch (s.screen) {
    case 'landing':
      return <LandingScreen />
    case 'menu':
      return <MenuScreen />
    case 'item':
      // currentItem is always set before navigating to 'item'; fall back to menu.
      return s.currentItem ? <ItemScreen item={s.currentItem} /> : <MenuScreen />
    case 'cart':
      return <CartScreen />
    case 'checkout':
      return <CheckoutScreen />
    case 'confirm':
      return <ConfirmScreen />
    case 'track':
      return <TrackScreen />
    case 'done':
      return <DoneScreen />
    default:
      return <LandingScreen />
  }
}

function Toast() {
  const { toastMsg } = useStore()
  if (!toastMsg) return null
  return (
    <div
      style={{
        position: 'absolute',
        left: 20,
        right: 20,
        bottom: 96,
        zIndex: 80,
        background: 'rgba(7,46,72,.96)',
        color: '#fff',
        borderRadius: 14,
        padding: '13px 18px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        fontSize: 14.5,
        fontWeight: 700,
        boxShadow: '0 12px 30px rgba(0,0,0,.3)',
        animation: 'rr-rise .25s ease both',
        backdropFilter: 'blur(8px)',
      }}
    >
      <span
        style={{
          width: 22,
          height: 22,
          borderRadius: '50%',
          background: 'var(--ice)',
          color: 'var(--navy)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flex: '0 0 auto',
        }}
      >
        <Icon name="check" size={14} sw={3} />
      </span>
      {toastMsg}
    </div>
  )
}

function Shell() {
  const { screen } = useStore()
  return (
    <div className="rr-app">
      {/* keyed so each screen replays its entrance animation */}
      <div key={screen} style={{ height: '100%', animation: 'rr-rise .3s ease both' }}>
        <Router />
      </div>
      <Toast />
    </div>
  )
}

export default function App() {
  return (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  )
}
