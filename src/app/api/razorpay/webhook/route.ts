import { db } from '@/lib/firebase';
import { doc, updateDoc, serverTimestamp, getDoc, increment, deleteField } from 'firebase/firestore';
import * as crypto from 'crypto';
import { notifyAdminOfUpgradeAction } from '@/lib/actions';

export const dynamic = 'force-dynamic';

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

    const event = JSON.parse(body);

    if (event.event === 'payment_link.paid') {
        const paymentEntity = event.payload.payment.entity;
        const plan = paymentEntity.notes.plan;
        const userId = paymentEntity.notes.userId;
        const paymentId = paymentEntity.id;
        const amountPaid = paymentEntity.amount / 100;

        // Discount metadata from notes
        const basePrice = parseInt(paymentEntity.notes.basePrice || '0');
        const festiveDiscount = parseInt(paymentEntity.notes.festiveDiscount || '0');
        const promoDiscount = parseInt(paymentEntity.notes.promoDiscount || '0');
        const promoCode = paymentEntity.notes.promoCode || null;

        if (!userId || !plan) {
            return new Response('Missing required data in webhook payload.', { status: 400 });
        }

        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);
        const userEmail = userSnap.exists() ? userSnap.data().email : 'Unknown User';

        // Calculate credits to add
        let creditsUpdate: any = 5; // Default for free
        if (plan === 'essentials') {
            creditsUpdate = increment(50);
        } else if (plan === 'pro' || plan === 'recruiter') {
            creditsUpdate = 999999;
        }

        await updateDoc(userRef, {
            plan: plan,
            planUpdatedAt: serverTimestamp(),
            credits: creditsUpdate,
            paymentId: paymentId,
            webhookVerified: true,
            amountPaid: amountPaid,
            basePrice: basePrice,
            festiveDiscount: festiveDiscount,
            promoDiscount: promoDiscount,
            appliedPromoCode: promoCode,
            // Clear payment resumption data
            lastPaymentLink: deleteField(),
            requestedPlan: deleteField(),
            previousPlan: deleteField(),
        });

        await notifyAdminOfUpgradeAction({
          userEmail: userEmail,
          plan: plan,
          amount: amountPaid,
          type: 'WEBHOOK_PAID'
        });
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
