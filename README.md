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
STRIPE_PUBLISHABLE_KEY=pk_test_or_live_value
STRIPE_SECRET_KEY=sk_test_or_live_value
```

Use test keys for local/test payments and live keys only for production. The test publishable key has a safe fallback in `netlify/functions/stripe-config.js` so the card field can load, but `STRIPE_SECRET_KEY` is still required on Netlify before Stripe can create or confirm payments.

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
