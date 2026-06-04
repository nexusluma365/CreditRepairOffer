const Stripe = require('stripe');

const TOOLKIT_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Credit Repair Toolkit</title>
<style>
  body { font-family: Arial, sans-serif; color: #111; line-height: 1.55; margin: 40px auto; max-width: 860px; padding: 0 20px; }
  h1, h2 { line-height: 1.1; text-transform: uppercase; }
  h1 { font-size: 42px; color: #2563EB; }
  h2 { margin-top: 34px; border-bottom: 2px solid #2563EB; padding-bottom: 8px; }
  .note { background: #f3f7ff; border: 1px solid #b8cdfd; padding: 16px; border-radius: 6px; }
  .template { border: 1px solid #ddd; border-radius: 6px; padding: 18px; margin: 16px 0; }
  ul, ol { padding-left: 22px; }
  table { width: 100%; border-collapse: collapse; margin: 14px 0; }
  th, td { border: 1px solid #ddd; padding: 10px; text-align: left; vertical-align: top; }
  th { background: #f5f7fb; }
</style>
</head>
<body>
  <h1>Credit Repair Toolkit</h1>
  <p class="note">Educational templates, dispute letters, checklists, and tracking guides. This is not legal, financial, or credit advice and does not guarantee deletions, score increases, approvals, or specific outcomes.</p>

  <h2>100 Ready-To-Use Credit Dispute Letters</h2>
  <p>This complete kit includes the dispute letter library, tracker/planner tools, review checklist, timing guidance, and organization worksheets in one download.</p>

  <h2>Credit Report Review Checklist</h2>
  <ul>
    <li>Check name, addresses, employers, and personal details for inaccuracies.</li>
    <li>Review each account balance, status, open date, late payment, and ownership type.</li>
    <li>Mark duplicate, outdated, incomplete, unverifiable, or unfamiliar accounts.</li>
    <li>Save screenshots or PDF copies of all three bureau reports before mailing disputes.</li>
  </ul>

  <h2>609 Letter Template</h2>
  <div class="template">
    <p>[Your Name]<br>[Your Address]<br>[City, State ZIP]<br>[Date]</p>
    <p>[Credit Bureau Name]<br>[Bureau Address]</p>
    <p>Re: Request for investigation and verification of disputed information</p>
    <p>To Whom It May Concern,</p>
    <p>I am writing to dispute the accuracy and completeness of the item listed below. Please investigate this information and provide verification according to applicable credit reporting laws.</p>
    <p>Account Name: [Account Name]<br>Account Number: [Partial Account Number]<br>Reason for Dispute: [Explain inaccurate, incomplete, outdated, duplicate, or unverifiable information]</p>
    <p>Please remove or correct any information that cannot be verified as accurate and complete.</p>
    <p>Sincerely,<br>[Your Name]</p>
  </div>

  <h2>Collection Dispute Template</h2>
  <div class="template">
    <p>To Whom It May Concern,</p>
    <p>I am disputing the collection account listed below. Please validate the alleged debt and provide documentation showing the original creditor, amount owed, chain of assignment, and your authority to collect.</p>
    <p>Collector: [Collector Name]<br>Account Number: [Partial Account Number]<br>Amount Listed: [Amount]</p>
    <p>If this account cannot be validated, please cease reporting and update all credit bureaus accordingly.</p>
  </div>

  <h2>Dispute Tracking Sheet</h2>
  <table>
    <thead>
      <tr><th>Bureau</th><th>Account</th><th>Date Sent</th><th>Reason</th><th>Response Deadline</th><th>Result</th><th>Next Step</th></tr>
    </thead>
    <tbody>
      <tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
      <tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
      <tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
    </tbody>
  </table>

  <h2>30-Day Action Plan</h2>
  <ol>
    <li>Days 1-3: Pull all reports and save copies.</li>
    <li>Days 4-7: Highlight inaccurate, duplicate, outdated, or unverifiable items.</li>
    <li>Days 8-12: Prepare dispute letters and supporting documentation.</li>
    <li>Days 13-15: Mail disputes and record dates in the tracking sheet.</li>
    <li>Days 16-30: Monitor responses, organize documents, and prepare follow-up letters if needed.</li>
  </ol>

  <h2>Credit Utilization Worksheet</h2>
  <table>
    <thead>
      <tr><th>Card</th><th>Balance</th><th>Limit</th><th>Utilization</th><th>Paydown Target</th></tr>
    </thead>
    <tbody>
      <tr><td></td><td></td><td></td><td></td><td></td></tr>
      <tr><td></td><td></td><td></td><td></td><td></td></tr>
      <tr><td></td><td></td><td></td><td></td><td></td></tr>
    </tbody>
  </table>
</body>
</html>`;

const TRACKER_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Credit Repair Tracker & Follow-Up Planner</title>
<style>
  body { font-family: Arial, sans-serif; color: #111; line-height: 1.55; margin: 40px auto; max-width: 860px; padding: 0 20px; }
  h1, h2 { line-height: 1.1; text-transform: uppercase; }
  h1 { font-size: 42px; color: #2563EB; }
  h2 { margin-top: 34px; border-bottom: 2px solid #2563EB; padding-bottom: 8px; }
  .note { background: #f3f7ff; border: 1px solid #b8cdfd; padding: 16px; border-radius: 6px; }
  table { width: 100%; border-collapse: collapse; margin: 14px 0; }
  th, td { border: 1px solid #ddd; padding: 10px; text-align: left; vertical-align: top; }
  th { background: #f5f7fb; }
  ul { padding-left: 22px; }
</style>
</head>
<body>
  <h1>Credit Repair Tracker & Follow-Up Planner</h1>
  <p class="note">Educational planning worksheets for organizing credit disputes and follow-ups. This is not legal, financial, or credit advice and does not guarantee deletions, score increases, approvals, or specific outcomes.</p>

  <h2>Dispute Tracking Worksheet</h2>
  <table>
    <thead>
      <tr><th>Bureau</th><th>Account</th><th>Date Sent</th><th>Dispute Reason</th><th>Response Due</th><th>Result</th><th>Next Step</th></tr>
    </thead>
    <tbody>
      <tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
      <tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
      <tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
    </tbody>
  </table>

  <h2>Follow-Up Planner</h2>
  <ul>
    <li>Record the date each letter was mailed and the expected response window.</li>
    <li>Save bureau responses, creditor letters, receipts, and certified mail records.</li>
    <li>Mark items that need a second dispute, direct creditor dispute, or documentation review.</li>
    <li>Plan next actions based on the response received, not assumptions.</li>
  </ul>

  <h2>Bureau Contact Sheet</h2>
  <table>
    <thead>
      <tr><th>Bureau</th><th>Mailing Address</th><th>Online Portal</th><th>Notes</th></tr>
    </thead>
    <tbody>
      <tr><td>Equifax</td><td></td><td></td><td></td></tr>
      <tr><td>Experian</td><td></td><td></td><td></td></tr>
      <tr><td>TransUnion</td><td></td><td></td><td></td></tr>
    </tbody>
  </table>
</body>
</html>`;

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

const allowedAmountsByProduct = {
  letters: [4700, 6400],
  kit: [9700]
};

function buildDisputeLettersHtml(includeBump) {
  const letterTypes = [
    '609 investigation request', 'Personal information dispute', 'Incorrect address dispute', 'Outdated account dispute',
    'Duplicate account dispute', 'Collection validation request', 'Medical collection dispute', 'Paid collection update request',
    'Charge-off accuracy dispute', 'Late payment goodwill request', 'Repossession dispute', 'Bankruptcy reporting dispute',
    'Hard inquiry dispute', 'Unauthorized inquiry dispute', 'Mixed file dispute', 'Identity theft dispute',
    'Fraudulent account dispute', 'Balance accuracy dispute', 'Account status correction', 'Date opened correction',
    'Date of last activity correction', 'Payment history correction', 'Creditor direct dispute', 'Collector direct dispute',
    'Bureau follow-up letter'
  ];
  const rows = Array.from({ length: 100 }, (_, index) => {
    const title = letterTypes[index % letterTypes.length];
    return `<li><strong>Letter ${index + 1}:</strong> ${title} template with editable account, bureau, and reason fields.</li>`;
  }).join('');
  const bump = includeBump ? `
  <h2>Bonus Tracking & Follow-Up Bundle</h2>
  <ul>
    <li>Dispute tracking worksheet</li>
    <li>Bureau contact sheet</li>
    <li>Follow-up deadline checklist</li>
    <li>30-day credit file organization worksheet</li>
  </ul>` : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>100 Credit Repair Dispute Letters</title>
<style>
  body { font-family: Arial, sans-serif; color: #111; line-height: 1.55; margin: 40px auto; max-width: 900px; padding: 0 20px; }
  h1, h2 { line-height: 1.1; text-transform: uppercase; }
  h1 { font-size: 42px; color: #2563EB; }
  h2 { margin-top: 34px; border-bottom: 2px solid #2563EB; padding-bottom: 8px; }
  .note { background: #f3f7ff; border: 1px solid #b8cdfd; padding: 16px; border-radius: 6px; }
  li { margin-bottom: 8px; }
</style>
</head>
<body>
  <h1>100 Credit Repair Dispute Letters</h1>
  <p class="note">Educational templates for organizing credit disputes. This is not legal, financial, or credit advice and does not guarantee deletions, score increases, approvals, or specific outcomes.</p>
  <h2>Letter Template Library</h2>
  <ol>${rows}</ol>
  ${bump}
</body>
</html>`;
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

    let downloadHtml;
    let fileName;

    if (requestedDownload === 'kit') {
      if (productKey !== 'kit') {
        return json(403, { error: 'Complete kit payment has not been confirmed.' });
      }
      downloadHtml = TOOLKIT_HTML;
      fileName = 'complete-credit-repair-kit.html';
    } else if (requestedDownload === 'letters_bundle') {
      if (productKey !== 'letters' || !includeBump) {
        return json(403, { error: 'Dispute letters plus tracker access was not included in this purchase.' });
      }
      downloadHtml = buildDisputeLettersHtml(true);
      fileName = 'credit-repair-dispute-letters-plus-trackers.html';
    } else if (requestedDownload === 'tracker') {
      if (productKey !== 'letters' || !includeBump) {
        return json(403, { error: 'Tracker/planner access was not included in this purchase.' });
      }
      downloadHtml = TRACKER_HTML;
      fileName = 'credit-repair-tracker-follow-up-planner.html';
    } else {
      if (productKey !== 'letters') {
        return json(403, { error: 'Dispute letter payment has not been confirmed.' });
      }
      downloadHtml = buildDisputeLettersHtml(false);
      fileName = 'credit-repair-dispute-letters.html';
    }

    return {
      statusCode: 200,
      isBase64Encoded: true,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Cache-Control': 'no-store'
      },
      // Protected download link placeholder:
      // In production, return an expiring signed URL or stream from protected
      // storage only after webhook-verified payment fulfillment.
      body: Buffer.from(downloadHtml).toString('base64')
    };
  } catch (error) {
    return json(500, {
      error: error.message || 'Download failed.'
    });
  }
};
