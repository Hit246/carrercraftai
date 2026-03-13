
'use server';
import Razorpay from 'razorpay';
import { db } from './firebase';
import { doc, updateDoc, getDoc, deleteField } from 'firebase/firestore';
import * as crypto from 'crypto';

function getRazorpay() {
  const id = process.env.RAZORPAY_KEY_ID;
  const secret = process.env.RAZORPAY_KEY_SECRET;

  if (!id || !secret) {
    console.error('Razorpay ENV missing on server ❌', {
      hasId: !!id,
      hasSecret: !!secret,
    });
    throw new Error('Missing Razorpay credentials');
  }

  return new Razorpay({ key_id: id, key_secret: secret });
}

type Plan = "free" | "essentials" | "pro" | "recruiter";

export async function createPaymentLink(
  amount: number,
  planName: Exclude<Plan, 'free'>,
  customer: { name: string; email: string; contact: string },
  userId: string,
  metadata?: {
    basePrice: number;
    festiveDiscount: number;
    promoDiscount: number;
    promoCode: string | null;
  }
) {
  try {
    const razorpay = getRazorpay();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;

    if (!appUrl) {
      throw new Error("NEXT_PUBLIC_APP_URL is not set in the environment variables.");
    }
    
    const callbackUrl = `${appUrl}/payment/success`;

    const paymentLinkData = {
      amount: amount * 100, // Convert to paise
      currency: 'INR',
      description: `Upgrade to ${planName}`,
      customer: {
        name: customer.name,
        email: customer.email,
        contact: customer.contact,
      },
      notes: {
        plan: planName,
        userId: userId,
        basePrice: metadata?.basePrice.toString() || '0',
        festiveDiscount: metadata?.festiveDiscount.toString() || '0',
        promoDiscount: metadata?.promoDiscount.toString() || '0',
        promoCode: metadata?.promoCode || '',
      },
      notify: {
        sms: true,
        email: true,
      },
      reminder_enable: true,
      callback_url: callbackUrl,
      callback_method: 'get' as const,
    };

    console.log(
      'Payment Link Request:',
      JSON.stringify(paymentLinkData, null, 2)
    );

    const link = await razorpay.paymentLink.create(paymentLinkData);

    console.log('Payment Link created ✅', {
      id: link.id,
      short_url: link.short_url,
      status: link.status,
    });

    return {
      success: true,
      url: link.short_url,
      linkId: link.id,
    };
  } catch (err: any) {
    console.error('Payment Link Error >>>', {
      message: err.message,
      description: err.description,
      raw: JSON.stringify(err, null, 2),
    });

    return {
      success: false,
      error:
        err.description ||
        err.message ||
        'Failed to create payment link. Please try again.',
    };
  }
}

export async function verifyAndUpgrade(
  paymentLinkId: string,
  paymentId: string,
  signature: string,
  userId: string
) {
  try {
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
        console.error('Razorpay secret key is not configured.');
        return { success: false, message: 'Server configuration error.' };
    }

    const body = `${paymentLinkId}|${paymentId}`;
    const expectedSig = crypto.createHmac('sha256', secret).update(body).digest('hex');

    if (expectedSig !== signature) {
      console.error('Signature mismatch');
      return { success: false, message: 'Payment verification failed.' };
    }

    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return { success: false, message: 'User not found' };
    }

    const plan = userSnap.data()?.requestedPlan;
    if (!plan) {
      const currentPlan = userSnap.data()?.plan;
      if (currentPlan !== 'free' && currentPlan !== 'pending') {
        return { success: true, message: `Plan is already active.` };
      }
      return { success: false, message: 'No upgrade plan was requested.' };
    }

    await updateDoc(userRef, {
      plan,
      planUpdatedAt: new Date(),
      paymentId,
      paymentLinkId,
      requestedPlan: deleteField(),
      paymentPending: false,
    });

    return { success: true, message: `Upgraded to ${plan} plan` };
  } catch (e: any) {
    console.error('Error during payment verification:', e);
    return { success: false, message: e.message || 'An unexpected server error occurred.' };
  }
}
