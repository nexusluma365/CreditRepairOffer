# Credit Repair Offer

Static Netlify funnel for the Credit Repair dispute-letter offer with Stripe-backed checkout.

## Local development

```bash
npm install
npx netlify-cli@latest dev
```

Open `index.html` through Netlify Dev so `/.netlify/functions/*` routes work.

## Required Netlify environment variables

Set these in Netlify before testing checkout:

```bash
STRIPE_SECRET_KEY=sk_live_value
```

The live publishable key has a fallback in `netlify/functions/stripe-config.js` so the card field can load in production. `STRIPE_SECRET_KEY` is still required on Netlify before Stripe can create or confirm payments. In production, an old test `STRIPE_PUBLISHABLE_KEY` is ignored and the live fallback is used unless Netlify provides a live `pk_live_` value.

For local Stripe test checkout, `.env` must contain both keys:

```bash
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

Use Stripe test card `4242 4242 4242 4242`, any future expiration date, any CVC, and any ZIP code.

The checkout flow is:

1. Lead capture collects first name, email, and phone.
2. Main checkout charges `$47` for dispute letters, or `$64` if the optional `$17` tracker/planner bump is checked.
3. Only a succeeded Stripe PaymentIntent advances to the `$97` complete kit upsell.
4. The final download page reveals only the purchased CTA buttons: dispute letters, tracker/planner, and/or complete kit.

## Validation

```bash
npm run check
```
