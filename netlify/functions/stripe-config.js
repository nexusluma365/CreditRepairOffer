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
  const fallbackLivePublishableKey = 'pk_live_51TeycBPJOp8s8XsSjWLZD8n3JweuczqhYYgoJKLkiNfogQUnveNxlB3YMOM8GPrBAd8YCWYNXxVv4vKdgcoftxoR00IsTaLRDD';
  const fallbackTestPublishableKey = 'pk_test_51TeycBPJOp8s8XsSvgsYs2KtFZt1F2fUg9W32bxS2rDcORtp4F89PUj54Dz1WJbhPS1i8vnouVLeSiUX9cWfzp4v00RLV2KMcT';
  const envPublishableKey = process.env.STRIPE_PUBLISHABLE_KEY || '';
  const isProduction = process.env.CONTEXT === 'production' || process.env.NODE_ENV === 'production';
  const publishableKey = isProduction && !envPublishableKey.startsWith('pk_live_')
    ? fallbackLivePublishableKey
    : envPublishableKey || fallbackTestPublishableKey;

  if (!publishableKey) {
    return json(500, {
      error: 'Stripe publishable key is not configured. Add STRIPE_PUBLISHABLE_KEY with your pk_test_ key for test mode or pk_live_ key for live mode.'
    });
  }

  return json(200, {
    publishableKey,
    mode: publishableKey.startsWith('pk_test_') ? 'test' : 'live'
  });
};
