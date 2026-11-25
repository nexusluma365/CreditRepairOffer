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

const LIVE_PUBLISHABLE_KEY = 'pk_live_51TeycBPJOp8s8XsSjWLZD8n3JweuczqhYYgoJKLkiNfogQUnveNxlB3YMOM8GPrBAd8YCWYNXxVv4vKdgcoftxoR00IsTaLRDD';
const TEST_PUBLISHABLE_KEY = 'pk_test_51TeycBPJOp8s8XsSvgsYs2KtFZt1F2fUg9W32bxS2rDcORtp4F89PUj54Dz1WJbhPS1i8vnouVLeSiUX9cWfzp4v00RLV2KMcT';

// Netlify only sets CONTEXT during the build, not when functions run, so it can't be relied on
// to detect production. Use it when it is present, otherwise decide from the request's host:
// local dev (Netlify Dev / localhost) and deploy previews / branch deploys (`xyz--site.netlify.app`)
// stay in test mode; every other host is the live site.
function isProductionRequest(event) {
  const context = process.env.CONTEXT;
  if (context) return context === 'production';
  if (process.env.NETLIFY_DEV === 'true') return false;

  const headers = event?.headers || {};
  const host = String(headers['x-forwarded-host'] || headers.host || headers.Host || '')
    .toLowerCase()
    .split(':')[0];

  if (!host) return false;
  if (host === 'localhost' || host === '127.0.0.1' || host.endsWith('.local')) return false;
  if (host.endsWith('.netlify.app') && host.includes('--')) return false;
  return true;
}

exports.handler = async (event) => {
  const envPublishableKey = process.env.STRIPE_PUBLISHABLE_KEY || '';
  const isProduction = isProductionRequest(event);

  // Live site: always the live key, even if Netlify still holds an old pk_test_ value.
  // Local dev and previews: the env key if set, otherwise the test key.
  const publishableKey = isProduction
    ? (envPublishableKey.startsWith('pk_live_') ? envPublishableKey : LIVE_PUBLISHABLE_KEY)
    : (envPublishableKey || TEST_PUBLISHABLE_KEY);

  return json(200, {
    publishableKey,
    mode: publishableKey.startsWith('pk_test_') ? 'test' : 'live'
  });
};
