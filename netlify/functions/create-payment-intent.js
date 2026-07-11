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

const allowedProducts = {
  letters: {
    name: '20 Essential Credit Dispute Letter Templates',
    amounts: [700]
  },
  kit: {
    name: 'Complete Credit Repair Kit',
    amounts: [9700]
  }
};

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

  const productKey = payload.productKey || 'letters';
  const productConfig = allowedProducts[productKey];
  const product = payload.product || productConfig?.name || 'Credit Repair Toolkit';
  const amount = Number(payload.amount || 700);
  const currency = String(payload.currency || 'usd').toLowerCase();

  if (!productConfig || !productConfig.amounts.includes(amount) || currency !== 'usd') {
    return json(400, { error: 'Invalid product checkout request.' });
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
      description: product,
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
