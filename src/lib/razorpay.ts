'use server';
import Razorpay from 'razorpay';
import { db } from './firebase';
import { doc, updateDoc } from 'firebase/firestore';

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

  console.log('Razorpay instance created with key:', id.substring(0, 10) + '...');
  return new Razorpay({ key_id: id, key_secret: secret });
}

export async function createPaymentLink(
  amount: number,
  planName: Exclude<Plan, 'free'>,
  customer: { name: string; email: string; contact: string },
  userId: string
) {
  try {
    const razorpay = getRazorpay();
    console.log('Creating Payment Link >>>', { amount, planName, customer });

    // Payment Link API requires these specific fields
    const paymentLinkData = {
      amount: amount * 100, // Convert to paise
      currency: 'INR',
      description: `Upgrade to ${planName}`,
      customer: {
        name: customer.name,
        email: customer.email,
        contact: customer.contact,
      },
      notify: {
        sms: true,
        email: true,
      },
      reminder_enable: true,
      callback_url: `${
        process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002'
      }/payment/success?plan=${planName}`,
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
    // Razorpay errors have specific structure
    console.error('Payment Link Error >>>', {
      message: err.message,
      description: err.description,
      code: err.code,
      statusCode: err.statusCode,
      source: err.source,
      step: err.step,
      reason: err.reason,
      metadata: err.metadata,
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

type Plan = 'free' | 'essentials' | 'pro' | 'recruiter';

export async function verifyAndUpgrade(
  paymentLinkId: string,
  paymentId: string,
  signature: string,
  userId: string,
  plan: Plan
) {
  try {
    const crypto = require('crypto');
    const secret = process.env.RAZORPAY_KEY_SECRET;

    if (!secret) {
      throw new Error('Missing Razorpay secret on server');
    }

    const body = paymentLinkId + '|' + paymentId;

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === signature;

    if (isAuthentic) {
      // Signature is valid, upgrade the user's plan
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        plan: plan,
        planUpdatedAt: new Date(),
        requestedPlan: null,
      });
      return { success: true, message: 'Payment verified and plan upgraded.' };
    } else {
      // Signature is invalid
      return { success: false, message: 'Payment verification failed.' };
    }
  } catch (error: any) {
    console.error('Verification error:', error);
    return {
      success: false,
      message: error.message || 'An error occurred during verification.',
    };
  }
}
