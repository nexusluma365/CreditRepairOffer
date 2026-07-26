const crypto = require('crypto');
const Stripe = require('stripe');

const defaultR2Keys = {
  letters: '20 DEssential Dispute Letter Templates.zip',
  lettersBundle: '20 DEssential Dispute Letter Templates+Tracker.zip',
  kit: 'CREDIT REPAIR TOOLKIT™.zip'
};

const allowedAmountsByProduct = {
  letters: [2700],
  kit: [9700]
};

function getStripeSecretKey() {
  return (
    process.env.STRIPE_SECRET_KEY ||
    process.env.STRIPE_SECRET ||
    process.env.STRIPE_PRIVATE_KEY ||
    process.env.STRIPE_API_KEY
  );
}

function getR2Config() {
  return {
    accountId: process.env.R2_ACCOUNT_ID || process.env.CLOUDFLARE_ACCOUNT_ID || '',
    accessKeyId: process.env.R2_ACCESS_KEY_ID || process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || '',
    bucketName: process.env.R2_BUCKET_NAME || process.env.R2_BUCKET || 'creditrepairbusiness'
  };
}

function getR2Objects() {
  const lettersKey = process.env.R2_FILE_KEY1 || defaultR2Keys.letters;
  const lettersBundleKey = process.env.R2_FILE_KEY || defaultR2Keys.lettersBundle;
  const kitKey = process.env.R2_FILE_KEY2 || defaultR2Keys.kit;

  return {
    letters: {
      label: 'Essential Credit Repair Templates',
      objectKey: lettersKey,
      fileName: lettersKey
    },
    letters_bundle: {
      label: 'Templates + Tracker',
      objectKey: lettersBundleKey,
      fileName: lettersBundleKey
    },
    kit: {
      label: 'Complete Credit Repair Kit',
      objectKey: kitKey,
      fileName: kitKey
    }
  };
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

function hmac(key, value, encoding) {
  return crypto.createHmac('sha256', key).update(value, 'utf8').digest(encoding);
}

function sha256(value) {
  return crypto.createHash('sha256').update(value, 'utf8').digest('hex');
}

function encodeRfc3986(value) {
  return encodeURIComponent(value).replace(/[!'()*]/g, (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`);
}

function encodePathSegments(path) {
  return path.split('/').map(encodeRfc3986).join('/');
}

function presignR2Url(object, method = 'GET', expiresSeconds = 300) {
  const { accountId, accessKeyId, secretAccessKey, bucketName } = getR2Config();
  if (!accountId || !accessKeyId || !secretAccessKey || !bucketName) {
    throw new Error('R2 download storage is not configured. Add R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, and R2_BUCKET_NAME in Netlify.');
  }
  if (accessKeyId.length !== 32) {
    throw new Error('R2_ACCESS_KEY_ID must be the 32-character Cloudflare R2 access key ID, not an AWS key or an R2 file key.');
  }

  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
  const dateStamp = amzDate.slice(0, 8);
  const region = 'auto';
  const service = 's3';
  const host = `${accountId}.r2.cloudflarestorage.com`;
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const canonicalUri = `/${encodePathSegments(bucketName)}/${encodePathSegments(object.objectKey)}`;
  const signedHeaders = 'host';
  const queryParams = {
    'X-Amz-Algorithm': 'AWS4-HMAC-SHA256',
    'X-Amz-Credential': `${accessKeyId}/${credentialScope}`,
    'X-Amz-Date': amzDate,
    'X-Amz-Expires': String(expiresSeconds),
    'X-Amz-SignedHeaders': signedHeaders
  };

  const canonicalQuery = Object.entries(queryParams)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${encodeRfc3986(key)}=${encodeRfc3986(value)}`)
    .join('&');
  const canonicalRequest = [
    method,
    canonicalUri,
    canonicalQuery,
    `host:${host}`,
    '',
    signedHeaders,
    'UNSIGNED-PAYLOAD'
  ].join('\n');
  const stringToSign = [
    'AWS4-HMAC-SHA256',
    amzDate,
    credentialScope,
    sha256(canonicalRequest)
  ].join('\n');
  const dateKey = hmac(`AWS4${secretAccessKey}`, dateStamp);
  const regionKey = hmac(dateKey, region);
  const serviceKey = hmac(regionKey, service);
  const signingKey = hmac(serviceKey, 'aws4_request');
  const signature = hmac(signingKey, stringToSign, 'hex');

  return `https://${host}${canonicalUri}?${canonicalQuery}&X-Amz-Signature=${signature}`;
}

async function assertR2ObjectReadable(object) {
  const checkUrl = presignR2Url(object, 'GET', 60);
  const response = await fetch(checkUrl, {
    method: 'GET',
    headers: {
      Range: 'bytes=0-0'
    }
  });

  if (response.ok || response.status === 206) return;

  const body = await response.text().catch(() => '');
  const code = body.match(/<Code>([^<]+)<\/Code>/)?.[1];
  const message = body.match(/<Message>([^<]+)<\/Message>/)?.[1];
  const detail = [code, message].filter(Boolean).join(': ');
  throw new Error(detail || `R2 rejected the protected download request with status ${response.status}.`);
}

function resolveDownload(productKey, requestedDownload, includeBump) {
  const r2Objects = getR2Objects();

  if (requestedDownload === 'kit') {
    if (productKey !== 'kit') {
      return { error: 'Complete kit payment has not been confirmed.' };
    }
    return { object: r2Objects.kit };
  }

  if (requestedDownload === 'letters_bundle') {
    if (productKey !== 'letters' || !includeBump) {
      return { error: 'Templates + tracker access was not included in this purchase.' };
    }
    return { object: r2Objects.letters_bundle };
  }

  if (requestedDownload === 'tracker') {
    if (productKey !== 'letters' || !includeBump) {
      return { error: 'Tracker/planner access was not included in this purchase.' };
    }
    return { object: r2Objects.letters_bundle };
  }

  if (productKey !== 'letters') {
    return { error: 'Essential credit repair template payment has not been confirmed.' };
  }
  return { object: r2Objects.letters };
}

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
    return json(400, { error: 'Invalid download request.' });
  }

  if (!payload.paymentIntentId) {
    return json(400, { error: 'Missing payment confirmation.' });
  }

  try {
    const stripe = new Stripe(secretKey);
    const paymentIntent = await stripe.paymentIntents.retrieve(payload.paymentIntentId);
    const productKey = paymentIntent.metadata?.productKey || 'letters';
    const requestedDownload = payload.downloadType || productKey;
    const allowedAmounts = allowedAmountsByProduct[productKey] || [];
    const includeBump = paymentIntent.metadata?.bump === 'yes';

    if (
      paymentIntent.status !== 'succeeded' ||
      !allowedAmounts.includes(paymentIntent.amount) ||
      paymentIntent.currency !== 'usd' ||
      paymentIntent.metadata?.access !== 'credit-repair-toolkit'
    ) {
      return json(403, { error: 'Payment has not been confirmed for this product.' });
    }

    const resolved = resolveDownload(productKey, requestedDownload, includeBump);
    if (resolved.error) {
      return json(403, { error: resolved.error });
    }

    await assertR2ObjectReadable(resolved.object);
    const downloadUrl = presignR2Url(resolved.object, 'GET');
    return json(200, {
      downloadUrl,
      fileName: resolved.object.fileName,
      product: resolved.object.label,
      expiresInSeconds: 300
    });
  } catch (error) {
    return json(500, {
      error: error.message || 'Download failed.'
    });
  }
};
