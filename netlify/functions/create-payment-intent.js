const Stripe = require('stripe');

function getStripeSecretKey() {
  return (
    process.env.STRIPE_SECRET_KEY ||
    process.env.STRIPE_SECRET ||
    process.env.STRIPE_PRIVATE_KEY ||
    process.env.STRIPE_API_KEY
  );
}

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store'
    },
    body: JSON.stringify(body)
  };
}

// The Essential Credit Playbook is the only product for sale. The price is set here on the
// server; whatever amount the browser sends is never used to decide what to charge.
// (The old $27 letters-only product is no longer sold.)
const allowedProducts = {
  playbook: {
    name: 'The Essential Credit Playbook',
    amount: 9700
  }
};
const statementDescriptorSuffix = 'NEXUSLUMA';
const chargeDescription = 'NexusLuma digital purchase';

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return json(405, { error: 'Method not allowed.' });
  }

  const secretKey = getStripeSecretKey();
  if (!secretKey) {
    return json(500, {
      error: 'Stripe secret key is not configured on Netlify. Add STRIPE_SECRET_KEY with your sk_test_ key for test mode or sk_live_ key for live mode.'
    });
  }

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch {
    return json(400, { error: 'Invalid payment request.' });
  }

  const productKey = payload.productKey || 'playbook';
  const productConfig = allowedProducts[productKey];
  const currency = String(payload.currency || 'usd').toLowerCase();

  if (!productConfig || currency !== 'usd') {
    return json(400, { error: 'Invalid product checkout request.' });
  }

  const product = productConfig.name;
  const amount = productConfig.amount;
  if (payload.amount !== undefined && Number(payload.amount) !== amount) {
    return json(400, { error: 'Price mismatch. Please refresh the page and try again.' });
  }

  try {
    const stripe = new Stripe(secretKey);
    const customerEmail = payload.lead?.email || '';
    const customerName = payload.lead?.name || '';
    const customer = customerEmail || customerName
      ? await stripe.customers.create({
          email: customerEmail || undefined,
          name: customerName || undefined,
          phone: payload.lead?.phone || undefined,
          metadata: {
            source: 'credit-repair-toolkit'
          }
        })
      : null;

    // Stripe Price ID placeholder:
    // In production, map productKey + bump to Stripe Price IDs server-side
    // instead of trusting frontend amounts. Never expose secret keys in HTML.
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      customer: customer?.id,
      payment_method_types: ['card'],
      setup_future_usage: 'off_session',
      statement_descriptor_suffix: statementDescriptorSuffix,
      description: chargeDescription,
      metadata: {
        product,
        productKey,
        bump: payload.bump ? 'yes' : 'no',
        leadEmail: customerEmail,
        leadPhone: payload.lead?.phone || '',
        access: 'credit-repair-toolkit'
      }
    });

    // Webhook verification placeholder:
    // Fulfillment should be finalized from a Stripe webhook after verifying
    // the PaymentIntent succeeded and matches an allowed product/amount.
    return json(200, {
      clientSecret: paymentIntent.client_secret
    });
  } catch (error) {
    const rawMessage = String(error.message || '');
    const isStripeKeyError = [
      'api key',
      'expired',
      'sk_live_',
      'sk_test_',
      'pk_live_',
      'pk_test_'
    ].some((pattern) => rawMessage.toLowerCase().includes(pattern));

    return json(500, {
      error: isStripeKeyError
        ? 'Payment setup is temporarily unavailable. Please try again later.'
        : rawMessage || 'Payment setup failed.'
    });
  }
};
