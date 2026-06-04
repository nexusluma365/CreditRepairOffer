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

Use test keys for local/test payments and live keys only for production.

## Validation

```bash
npm run check
```
