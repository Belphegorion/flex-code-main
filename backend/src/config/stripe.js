import Stripe from 'stripe';

const stripeKey = process.env.STRIPE_SECRET_KEY;
let stripe;
export const isStripeConfigured = Boolean(stripeKey);

if (stripeKey) {
  // Initialize real Stripe client when key is provided
  stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });
} else {
  // Provide a safe stub so importing modules don't crash at startup.
  // Methods return rejected Promises with a clear message so callers can
  // handle the error or propagate it as appropriate.
  const makeMissing = (name) => (..._args) =>
    Promise.reject(new Error(`Stripe is not configured (missing STRIPE_SECRET_KEY). Attempted stripe.${name}()`));

  stripe = {
    paymentIntents: {
      create: makeMissing('paymentIntents.create'),
      retrieve: makeMissing('paymentIntents.retrieve'),
      confirm: makeMissing('paymentIntents.confirm')
    },
    transfers: {
      create: makeMissing('transfers.create')
    },
    customers: {
      create: makeMissing('customers.create')
    }
  };
}

export default stripe;
