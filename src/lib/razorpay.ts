
'use server';
import Razorpay from 'razorpay';
import { db } from './firebase';
import { doc, updateDoc, getDoc, deleteField } from 'firebase/firestore';

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
  userId: string
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
    const crypto = require('crypto');
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
        console.error('Razorpay secret key is not configured.');
        return { success: false, message: 'Server configuration error.' };
    }

    // The body should be payment_link_id|razorpay_payment_id
    const body = `${paymentLinkId}|${paymentId}`;
    const expectedSig = crypto.createHmac('sha256', secret).update(body).digest('hex');

    console.log("Signature Verification Body:", body);
    console.log("Received Signature:", signature);
    console.log("Expected Signature:", expectedSig);

    if (expectedSig !== signature) {
      console.error('Signature mismatch – fake or corrupt callback');
      return { success: false, message: 'Signature mismatch – fake or corrupt callback' };
    }

    // Signature verified — now check DB for intended plan
    console.log(`Signature verified for user ${userId}. Checking database for requested plan...`);
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      console.error(`User with ID ${userId} not found in database.`);
      return { success: false, message: 'User not found in database' };
    }

    const plan = userSnap.data()?.requestedPlan;
    if (!plan) {
      console.error(`No 'requestedPlan' found for user ${userId}. Cannot activate.`);
      return { success: false, message: 'No plan stored in DB – cannot activate' };
    }

    console.log(`Found requested plan '${plan}' for user ${userId}. Upgrading...`);
    // Upgrade user plan
    await updateDoc(userRef, {
      plan,
      planUpdatedAt: new Date(),
      paymentId,
      paymentLinkId,
      requestedPlan: deleteField(),
      paymentPending: false,
    });

    console.log(`Successfully upgraded user ${userId} to ${plan} plan.`);
    return { success: true, message: `Upgraded to ${plan} plan` };
  } catch (e: any) {
    console.error('Error during payment verification and upgrade:', e);
    return { success: false, message: e.message || 'An unexpected server error occurred.' };
  }
}
