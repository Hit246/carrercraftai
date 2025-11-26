
import { db } from '@/lib/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import * as crypto from 'crypto';

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get('x-razorpay-signature');
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!sig || !secret) {
    console.error('Webhook Error: Missing signature or secret.');
    return new Response('Invalid request: missing headers.', { status: 400 });
  }

  try {
    const expected = crypto.createHmac('sha256', secret).update(body).digest('hex');
    
    if (expected !== sig) {
      console.error('Webhook Error: Invalid signature.');
      return new Response('Invalid signature.', { status: 403 });
    }

    // Signature is valid, proceed with logic
    console.log('Razorpay webhook signature verified successfully.');
    const event = JSON.parse(body);

    if (event.event === 'payment_link.paid') {
        const paymentEntity = event.payload.payment.entity;
        const plan = paymentEntity.notes.plan;
        const userId = paymentEntity.notes.userId;
        const paymentId = paymentEntity.id;

        if (!userId || !plan) {
            console.error('Webhook Error: Missing userId or plan in payment notes.', paymentEntity.notes);
            return new Response('Missing required data in webhook payload.', { status: 400 });
        }

        console.log(`Processing webhook for user: ${userId}, plan: ${plan}`);

        await updateDoc(doc(db, 'users', userId), {
            plan: plan,
            planUpdatedAt: serverTimestamp(),
            paymentId: paymentId,
            webhookVerified: true, // Add a flag to show it was verified by a trusted source
        });

        console.log(`Successfully upgraded user ${userId} to ${plan} via webhook.`);
    }

    return new Response(JSON.stringify({ ok: true }), { 
      status: 200, 
      headers: { 'Content-Type': 'application/json' } 
    });

  } catch (error: any) {
    console.error('Webhook processing error:', error.message);
    return new Response(`Webhook handler failed: ${error.message}`, { status: 500 });
  }
}
