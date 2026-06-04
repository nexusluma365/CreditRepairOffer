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

exports.handler = async () => {
  const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY || '';

  if (!publishableKey) {
    return json(500, {
      error: 'Stripe publishable key is not configured. Add STRIPE_PUBLISHABLE_KEY with your pk_test_ key for test mode.'
    });
  }

  return json(200, {
    publishableKey,
    mode: publishableKey.startsWith('pk_test_') ? 'test' : 'live'
  });
};
