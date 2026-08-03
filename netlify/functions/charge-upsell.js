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
    return json(400, { error: 'Invalid upsell request.' });
  }

  const lettersPaymentIntentId = payload.lettersPaymentIntentId || '';
  if (!lettersPaymentIntentId) {
    return json(400, { error: 'Missing original payment confirmation.' });
  }
  const requestEmail = String(payload.email || '').trim().toLowerCase();

  try {
    const stripe = new Stripe(secretKey);
    const originalPayment = await stripe.paymentIntents.retrieve(lettersPaymentIntentId);

    if (
      originalPayment.status !== 'succeeded' ||
      originalPayment.metadata?.productKey !== 'letters' ||
      originalPayment.metadata?.access !== 'credit-repair-toolkit' ||
      ![2700].includes(originalPayment.amount) ||
      originalPayment.currency !== 'usd'
    ) {
      return json(403, { error: 'Original letter template payment has not been confirmed.' });
    }

    const originalEmail = String(originalPayment.metadata?.leadEmail || '').trim().toLowerCase();
    if (originalEmail && requestEmail !== originalEmail) {
      return json(403, { error: 'This upgrade does not match the original checkout session.' });
    }

    if (!originalPayment.customer || !originalPayment.payment_method) {
      return json(400, {
        error: 'This card is not available for one-click upgrade. Please contact support or complete checkout again.'
      });
    }

    const kitPayment = await stripe.paymentIntents.create({
      amount: 9700,
      currency: 'usd',
      customer: originalPayment.customer,
      payment_method: originalPayment.payment_method,
      off_session: true,
      confirm: true,
      statement_descriptor_suffix: statementDescriptorSuffix,
      description: chargeDescription,
      metadata: {
        product: 'Complete Credit Repair Kit',
        productKey: 'kit',
        originalPaymentIntentId: originalPayment.id,
        access: 'credit-repair-toolkit'
      }
    }, {
      idempotencyKey: `credit-repair-kit-upsell-${originalPayment.id}`
    });

    if (kitPayment.status !== 'succeeded') {
      return json(402, {
        error: 'The upgrade payment could not be completed automatically.',
        status: kitPayment.status
      });
    }

    return json(200, {
      paymentIntentId: kitPayment.id,
      status: kitPayment.status
    });
  } catch (error) {
    if (error.code === 'authentication_required' || error.payment_intent?.status === 'requires_action') {
      return json(402, {
        error: 'This card requires bank authentication before the upgrade can be charged.'
      });
    }

    return json(500, {
      error: error.message || 'Upgrade payment failed.'
    });
  }
};
