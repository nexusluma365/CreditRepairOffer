# Credit Repair Offer

Static Netlify funnel for The Essential Credit Playbook offer with Stripe-backed checkout. `index.html` is the single served funnel page.

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
R2_ACCOUNT_ID=cloudflare_account_id
R2_ACCESS_KEY_ID=cloudflare_r2_access_key_id
R2_SECRET_ACCESS_KEY=cloudflare_r2_secret_access_key
R2_BUCKET_NAME=creditrepairbusiness
R2_FILE_KEY_PLAYBOOK=ESSENTIAL CREDIT REPAIR PLAYBOOK.zip
R2_FILE_KEY1=20 DEssential Dispute Letter Templates.zip
```

The live publishable key has a fallback in `netlify/functions/stripe-config.js` so the card field can load in production. `STRIPE_SECRET_KEY` is still required on Netlify before Stripe can create or confirm payments. In production, an old test `STRIPE_PUBLISHABLE_KEY` is ignored and the live fallback is used unless Netlify provides a live `pk_live_` value.

For local Stripe test checkout, `.env` must contain both keys:

```bash
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

Use Stripe test card `4242 4242 4242 4242`, any future expiration date, any CVC, and any ZIP code.

The funnel flow is:

1. Lead capture collects the visitor email.
2. Sales step presents The Essential Credit Playbook offer.
3. Regular checkout opens with The Essential Credit Playbook checkbox checked by default and charges `$27`.
4. If the visitor unchecks the Playbook option, checkout switches to the 20 Essential Letter Templates for `$7`.
5. The final confirmation screen reveals the verified purchased download.

The frontend also sends tracking events to Google Analytics and the configured Google Apps Script webhook in `index.html`.

## Validation

```bash
npm run check
```
