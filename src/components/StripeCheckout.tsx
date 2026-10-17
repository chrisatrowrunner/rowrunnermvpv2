// StripeCheckout.tsx — real payment UI: Apple Pay / Google Pay (Express Checkout)
// + card, via Stripe. Uses the deferred-intent flow: Elements mounts with the
// amount for the wallet sheet, and the PaymentIntent is created server-side at
// confirm time (so the charge is the server's authoritative total).
import { useState } from 'react'
import {
  Elements,
  ExpressCheckoutElement,
  PaymentElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js'
import { stripePromise, createPaymentIntent, type PayLine } from '../lib/payments'
import { CTA } from './ui'

interface Props {
  lines: PayLine[]
  tipCents: number
  /** display amount (cents) for the wallet sheet; the real charge is server-side */
  amountCents: number
  onPaid: (paymentIntentId: string) => void
}

function Inner({ lines, tipCents, onPaid }: Props) {
  const stripe = useStripe()
  const elements = useElements()
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  // Shared confirm path for both the wallet buttons and the card "Pay" button.
  const confirm = async (): Promise<void> => {
    if (!stripe || !elements) return
    setErr(null)
    setBusy(true)
    try {
      const { error: submitError } = await elements.submit()
      if (submitError) {
        setErr(submitError.message ?? 'Please check your details')
        setBusy(false)
        return
      }
      const { clientSecret } = await createPaymentIntent(lines, tipCents)
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: { return_url: window.location.href },
        redirect: 'if_required',
      })
      if (error) {
        setErr(error.message ?? 'Payment failed')
        setBusy(false)
        return
      }
      if (paymentIntent && paymentIntent.status === 'succeeded') {
        onPaid(paymentIntent.id)
        return // leave busy=true; the app navigates away on success
      }
      setErr('Payment was not completed')
      setBusy(false)
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Payment error')
      setBusy(false)
    }
  }

  return (
    <div>
      {/* Apple Pay / Google Pay (renders only on supported devices) */}
      <ExpressCheckoutElement onConfirm={confirm} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '16px 0' }}>
        <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
        <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--faint)' }}>or pay with card</span>
        <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
      </div>

      <PaymentElement options={{ layout: 'tabs' }} />

      {err && (
        <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--red)', marginTop: 12 }}>{err}</div>
      )}

      <div style={{ marginTop: 14 }}>
        <CTA label={busy ? 'Processing…' : 'Pay'} icon={busy ? undefined : 'check'} disabled={busy} onClick={confirm} />
      </div>
    </div>
  )
}

export function StripeCheckout(props: Props) {
  if (!stripePromise) {
    return (
      <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--muted)' }}>
        Payments aren’t configured for this build.
      </div>
    )
  }
  return (
    <Elements
      stripe={stripePromise}
      options={{
        mode: 'payment',
        amount: Math.max(50, props.amountCents),
        currency: 'usd',
        appearance: { theme: 'stripe', variables: { colorPrimary: '#5BB8D4', borderRadius: '12px' } },
      }}
    >
      <Inner {...props} />
    </Elements>
  )
}
