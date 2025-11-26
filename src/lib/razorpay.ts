
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

    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!appUrl) {
      throw new Error("NEXT_PUBLIC_APP_URL is not set in the environment variables. This is required for payment callbacks.");
    }

    const callbackUrl = `${appUrl}/payment/success?plan=${planName}&userId=${userId}`;


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
  plan: Exclude<Plan, 'free'>
) {
  try {
    const crypto = require('crypto');
    const secret = process.env.RAZORPAY_KEY_SECRET;

    if (!secret) {
      throw new Error('Missing Razorpay secret on server');
    }

    // For Payment Links callback, the signature format must be:
    // payment_link_id|razorpay_payment_id
    const body = `${paymentLinkId}|${paymentId}`;

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');

    const isAuthentic = expectedSignature === signature;

    console.log('Payment verification details:', {
      isAuthentic,
      userId,
      plan,
      bodyUsedForSignature: body,
      generatedSignature: expectedSignature,
      receivedSignature: signature,
    });

    if (isAuthentic) {
      // Signature is valid, upgrade the user's plan
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        plan: plan,
        planUpdatedAt: new Date(),
        paymentId: paymentId,
        paymentLinkId: paymentLinkId,
      });
      
      console.log(`✅ User ${userId} upgraded to ${plan} plan`);
      
      return { 
        success: true, 
        message: 'Payment verified and plan upgraded successfully!' 
      };
    } else {
      console.error('❌ Payment signature verification failed');
      return { 
        success: false, 
        message: 'Payment verification failed. Invalid signature.' 
      };
    }
  } catch (error: any) {
    console.error('Verification error:', error);
    return {
      success: false,
      message: error.message || 'An error occurred during verification.',
    };
  }
}
