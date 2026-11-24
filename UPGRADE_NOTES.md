# Conversion optimization upgrade

Preserved existing visual structure, hero video and original assets. The $97 Playbook is now the prominent primary offer. The old $27 product remains in legacy code for compatibility but its sales comparison card is hidden. The email gate is optional. Unverified testimonial removed. Copy avoids guarantees.

## Optional luxury apartment upgrade

After a successful Playbook payment, the confirmation page offers a separate $47 upgrade. Selecting it opens a NEW Stripe-hosted checkout; it is never charged automatically. Successful checkout returns with a Stripe session ID, verified server-side before the included HTML educational guide can be downloaded. The guide is bundled in `netlify/functions/luxury-apartment-guide.html`.

## Before launch

1. Configure Netlify `STRIPE_SECRET_KEY` and `STRIPE_PUBLISHABLE_KEY` in the same Stripe mode, plus the site's `URL` environment variable (HTTPS). Test in Stripe test mode first.
2. Verify Cloudflare R2 settings and the existing Playbook ZIP object: this source archive does not include the original paid downloadable Playbook ZIP.
3. Complete test purchases for $97 and $47 and verify both downloads; test decline, cancellation, and mobile.
4. Have credit advertising copy, consumer disclosures, refund terms, privacy policy, and email consent reviewed for applicable legal and Google Ads requirements.
5. Confirm the new guide matches the product you intend to sell; expand it as desired before advertising.
6. No payment conversion or campaign performance has been independently measured.
