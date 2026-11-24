const Stripe=require('stripe'); const fs=require('fs'); const path=require('path');
exports.handler=async(event)=>{
 const key=process.env.STRIPE_SECRET_KEY; const sid=event.queryStringParameters?.session_id;
 if (!key || !sid || !/^cs_(test|live)_/.test(sid)) return {statusCode:400,body:JSON.stringify({error:'Valid checkout session required.'})};
 try {const session=await new Stripe(key).checkout.sessions.retrieve(sid);
 if(session.payment_status!=='paid'||session.mode!=='payment'||session.metadata?.productKey!=='luxury_apartment_guide'||session.amount_total!==4700||session.currency!=='usd') return {statusCode:403,body:JSON.stringify({error:'Upgrade payment has not been verified.'})};
 if(event.queryStringParameters?.verify==='1') return {statusCode:200,headers:{'Content-Type':'application/json','Cache-Control':'no-store'},body:JSON.stringify({verified:true})};
 const guide=fs.readFileSync(path.join(__dirname,'luxury-apartment-guide.html'),'utf8');
 return {statusCode:200,headers:{'Content-Type':'text/html; charset=utf-8','Content-Disposition':'attachment; filename="Luxury-Apartment-Application-Preparation-Guide.html"','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'},body:guide};
 } catch(e){return {statusCode:500,body:JSON.stringify({error:'Could not verify this payment or prepare the guide.'})};}
};
