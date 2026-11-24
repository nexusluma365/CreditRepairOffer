# Credit Repair Offer

Static Netlify funnel for The Essential Credit Playbook, with Stripe checkout and protected downloads. `index.html` is the single page; it shows four steps in place. See `CHANGELOG.md` for the v6 premium sales page changes and deployment checklist.

## Funnel

1. **Landing:** the video plays first, and the visitor can optionally enter an email (`#page1`).
2. **Premium sales page:** a long-form page for the $97 offer (`#page3`, styles scoped under `.pp`).
3. **Checkout:** Stripe Elements card form. The Essential Credit Playbook ($97) is preselected. Unticking it switches to the 20 letter templates ($27) (`#page2`).
4. **Download:** after Stripe reports `succeeded`, the server verifies the PaymentIntent and returns a 5-minute signed R2 link (`#page4`).
5. **Optional upsell:** after a Playbook purchase, a separate $47 Luxury Apartment bundle is offered through Stripe-hosted Checkout. It is never charged automatically. The guide downloads only after the server confirms the Checkout session is paid, and the original download stays available whether the buyer accepts, declines or cancels.

## Local development

```bash
npm install
npx netlify-cli@latest dev
```

Open http://localhost:8888 so the `/.netlify/functions/*` routes work. `?preview_step=1|2|3|4` jumps straight to a step.

For local Stripe test checkout, create a `.env` file (see `.env.example`) with keys from the **same** Stripe mode:

```bash
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

Use test card `4242 4242 4242 4242`, any future expiration date, any CVC and any ZIP code. The $47 upsell can't start locally, because `create-luxury-checkout` requires an `https://` `URL`.

**Tracking runs locally too.** GA4 and the Google Sheets webhook in `index.html` receive events from localhost, so test sessions show up in your analytics and lead sheet.

## Netlify environment variables

```bash
STRIPE_PUBLISHABLE_KEY=pk_live_...      # must match the mode of the secret key
STRIPE_SECRET_KEY=sk_live_...
URL=https://your-site.example           # Netlify normally sets this automatically
R2_ACCOUNT_ID=cloudflare_account_id
R2_ACCESS_KEY_ID=cloudflare_r2_access_key_id   # 32 characters
R2_SECRET_ACCESS_KEY=cloudflare_r2_secret_access_key
R2_BUCKET_NAME=creditrepairbusiness
R2_FILE_KEY_PLAYBOOK=ESSENTIAL CREDIT REPAIR PLAYBOOK.zip
R2_FILE_KEY1=20 DEssential Dispute Letter Templates.zip
```

`stripe-config` falls back to built-in publishable keys if `STRIPE_PUBLISHABLE_KEY` is missing: the live key in production, the test key elsewhere. Publishable keys are safe to ship. `STRIPE_SECRET_KEY` has no fallback and must always be set, in the same mode as the publishable key.

## Validation

```bash
npm run check   # syntax-checks all Netlify functions, inline scripts and JSON-LD
npm run build   # copies the public files into dist/
```
