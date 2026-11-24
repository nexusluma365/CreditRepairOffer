const Stripe = require('stripe');
exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return {statusCode:405,body:'Method not allowed'};
  const key=process.env.STRIPE_SECRET_KEY;
  if (!key) return {statusCode:503,body:JSON.stringify({error:'Stripe is not configured.'})};
  try {
    const stripe=new Stripe(key); const body=JSON.parse(event.body||'{}');
    const origin=(process.env.URL || '');
    if (!/^https:\/\//.test(origin)) throw new Error('Set the Netlify URL environment variable to your HTTPS site URL.');
    const email=typeof body.email==='string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email) ? body.email : undefined;
    const session=await stripe.checkout.sessions.create({mode:'payment',payment_method_types:['card'],customer_email:email,
      line_items:[{price_data:{currency:'usd',unit_amount:4700,product_data:{name:'Luxury Apartment Application Preparation Bundle',description:'Digital education guide, checklists and worksheets. No approval guarantee.'}},quantity:1}],
      metadata:{productKey:'luxury_apartment_guide'},
      success_url:origin+'/?luxury_session={CHECKOUT_SESSION_ID}',cancel_url:origin+'/?luxury_cancel=1'});
    return {statusCode:200,headers:{'Content-Type':'application/json','Cache-Control':'no-store'},body:JSON.stringify({url:session.url})};
  } catch(e) {return {statusCode:500,headers:{'Content-Type':'application/json'},body:JSON.stringify({error:'Unable to start upgrade checkout. Check Stripe configuration.'})};}
};
