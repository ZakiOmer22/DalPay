import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

let stripePromise: Promise<any> | null = null;

const getStripePromise = () => {
  const key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
  if (!key) {
    console.warn('Stripe key missing - payments disabled');
    return null;
  }
  if (!stripePromise) {
    // REMOVE the apiVersion parameter - it's what's breaking it
    stripePromise = loadStripe(key);
  }
  return stripePromise;
};

export function StripeProvider({ children }: { children: React.ReactNode }) {
  const stripe = getStripePromise();
  if (!stripe) return <>{children}</>;
  return <Elements stripe={stripe}>{children}</Elements>;
}