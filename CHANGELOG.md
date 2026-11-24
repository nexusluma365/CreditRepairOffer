# Changelog

## v6 — Premium sales page (2026-11-23)

### Sales page (step 2) rebuilt
The old sales step (`#page3` in `index.html`) has been replaced with a long-form premium page. Each section answers one question a cold visitor is likely to have:

| # | Section | Visitor question | Background |
|---|---------|------------------|------------|
| 1 | Hero: "Better credit can open more doors." Copy on the left, product mockup on the right ($97 CTA) | Why should I care? | Dark |
| 2 | Transformation: 4 large featured cards and 10 benefit cards ($97 CTA) | What could better credit mean for me? | Light |
| 3 | Problem, then "Stop guessing. Start with a plan." with a 4-step process | What's holding me back? How does this help? | White + dark panel |
| 4 | Product showcase: 6 inclusions around the bundle mockup ($97 CTA) | What exactly am I getting? | Dark |
| 5 | Pricing card: $97, one-time, checklist, Stripe security note ($97 CTA) | Is it worth $97? | Light |
| 6 | FAQ accordion (7 questions) plus a support/company contact block | Why should I trust this? | White |
| 7 | Real materials: enlargeable template preview, letter types, honest limits | Why should I trust this? | Light |
| 8 | Final close with offer box, CTA and disclosure | Am I ready to purchase? | Dark |

- **Design.** Palette is #090B10, #FFFFFF, #F7F8FA, #E91E63 and #707783. Buttons use #D81B60 so white button text meets contrast requirements. Headlines use Oswald and body text uses Open Sans; both were already loaded. All styles are scoped under `.pp`, so the lead, checkout and download steps are unchanged.
- **Mobile.** Layouts are single-column. The hero order is headline → copy → mockup → CTA. Buttons are at least 48px tall. Tested at 320, 390 and 1366px wide with no horizontal scrolling.
- **Sticky CTA (mobile only).** It appears once the visitor reaches the product section. It hides while the pricing card or the final offer is on screen, because those have their own buttons. The page gets bottom padding so the bar never covers the end of the page.
- **Performance.** The product mockup is now a 160 KB WebP (`pp-playbook-bundle.webp`) instead of a 1.6 MB PNG. All sales-page images load lazily, so they cost nothing on the landing page.
- **Old CSS removed.** About 630 lines of CSS used only by the old sales page were deleted.

### Honesty and compliance
- No guarantees, fake prices, fake discounts, review counts, ratings or countdown timers.
- Transformation cards are presented as *possible benefits of stronger credit*, and a disclaimer sits under the grid.
- **No testimonials are shown.** There were none verified, so the "Real experiences" section became "See what you get before you buy", built from the actual template preview. The one unverified testimonial on the checkout page ("removed 2 errors…") was also removed, as `UPGRADE_NOTES.md` already said it should have been.
- The FAQ explains the real delivery process: download page right after payment, with links that expire after 5 minutes and can be regenerated. It also names the seller and statement descriptor (Nexus Luma / NEXUSLUMA).

### Tracking
New events, all pushed to `dataLayer` and GA4:

| Event | When | Also sent to Google Sheet? |
|-------|------|---------------------------|
| `landing_view` | Landing page loads | No (high volume) |
| `video_start`, `video_unmute`, `video_progress` (25/50/75), `video_complete` | Lead video engagement | No (high volume) |
| `sales_cta_click` now includes `cta_location` (`hero`, `transformation`, `product`, `pricing`, `final`, `sticky_mobile`) | CTA click | Yes |
| `upsell_view` (once per purchase), `upsell_click`, `upsell_decline`, `upsell_checkout_cancel` | Luxury upsell | Yes |
| `upsell_purchase` + GA4 `purchase` (transaction_id = Stripe Checkout session ID) | **Only after the server confirms the session is paid**; deduplicated with localStorage | Yes |

Existing events are unchanged: `lead_submit`, `sales_view`, `checkout_view`, `begin_checkout`, `add_payment_info`, `payment_success`, `purchase`, `conversion_event_purchase_1`. The Playbook `purchase` / `conversion_event_purchase_1` still fire only after Stripe reports `succeeded`, deduplicated by PaymentIntent ID. CTA clicks never fire a purchase event.

### Bug fixes
- **Leads were recorded twice.** The email arrow button ran `goSalesPage()` from both an inline `onclick` and a JS listener, so every lead sent two `lead_submit` and two `sales_view` events to GA and the Google Sheet. It now sends one.
- **Cancelling the upsell lost the original download.** Cancelling the $47 Stripe checkout returned buyers to `/?luxury_cancel=1`, which dropped them on the email page with their Playbook download out of sight. They now go back to the download page with a "you were not charged" message.

### Tooling
- `npm run check` now syntax-checks **all 5** Netlify functions, every inline script in `index.html`, and the JSON-LD block (see `scripts/check.js`).
- `scripts/build.js` now publishes `pp-playbook-bundle.webp`.

### Unchanged
- The lead page, original video and email validation.
- The checkout page and its $97/$27 toggle.
- All 5 Netlify functions: Stripe PaymentIntent creation, server-side payment verification, R2 signed downloads, and the luxury upsell checkout and download.
- `netlify.toml`, `_headers`, `_redirects`.

---

## Deployment

1. **Push or upload** this folder to the Netlify site. The build command (`npm run build`) and publish directory (`dist`) are already set in `netlify.toml`.
2. **Set these environment variables in Netlify** (Site configuration → Environment variables):
   - `STRIPE_PUBLISHABLE_KEY` and `STRIPE_SECRET_KEY`, both from the **same** mode (both test or both live).
   - `URL`: your HTTPS site address. The $47 upsell refuses to start without an `https://` URL. Netlify normally sets this automatically.
   - `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_FILE_KEY_PLAYBOOK`, `R2_FILE_KEY1`.
3. **Run test purchases in Stripe test mode first** with card `4242 4242 4242 4242`:
   - $97 Playbook → download page → the Playbook ZIP downloads from R2.
   - $47 upsell → Stripe-hosted checkout → return → both downloads are available.
   - Cancel the $47 checkout → you return to the download page.
   - A declined card (`4000 0000 0000 0002`) shows an error and doesn't advance.
4. **Check that events arrive** in GA4 DebugView. In Google Ads, import only the `purchase` / `conversion_event_purchase_1` events as conversions, not the click events. Decide whether the $47 upsell `purchase` should count as an Ads conversion; it's a separate transaction.
5. **Switch to live keys** and complete one real low-risk purchase, refunding it if you like.

## Still to test live (needs credentials this build didn't have)
- Real Stripe card confirmation and the `succeeded` status. Locally, the payment request (`playbook`, `9700`, `usd`, buyer email) and the post-payment flow were checked with the Stripe function responses stubbed.
- R2 signed download of the actual Playbook ZIP. That file isn't in this folder.
- The Stripe-hosted $47 checkout redirect and the `luxury-download` verification against a real paid session.
- Seeking in the video on the deployed CDN. The local dev server doesn't support byte-range requests.
- GA4 / Google Ads receiving events. Analytics requests were blocked during testing so no test data reached your property or lead sheet.

## Worth a look before advertising
- `credit-template-preview.webp` (shown on the sales page) and `20 credit dispute letters (1).png` (shown on the checkout page) show **"ACTIVEA"** branding on the letter box. Consider re-exporting them with Essential Credit Playbook branding.
- Have the advertising copy, disclosures, refund terms and privacy policy reviewed for Credit Repair Organizations Act, FTC and Google Ads requirements. There is no privacy policy or terms link on the page yet.
- The download page relies on browser session storage. A buyer who closes the tab before downloading has to email support. A payment-receipt email containing a download link (via a Stripe webhook) would remove that support burden.
