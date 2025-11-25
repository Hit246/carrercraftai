
'use server';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

let razorpayInstance: Razorpay | null = null;

function getRazorpayInstance(): Razorpay {
    if (razorpayInstance) {
        return razorpayInstance;
    }

    if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
        razorpayInstance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });
        return razorpayInstance;
    } else {
        console.error("Razorpay keys not found in environment variables.");
        throw new Error('Razorpay is not configured. Missing API keys on the server.');
    }
}


export async function createRazorpayOrder(amount: number, currency: string) {
    try {
        const razorpay = getRazorpayInstance();
        const options = {
            amount: amount * 100, // amount in the smallest currency unit
            currency,
            receipt: `receipt_order_${new Date().getTime()}`,
        };
        const order = await razorpay.orders.create(options);
        return { success: true, order };
    } catch (error: any) {
        console.error('Error creating Razorpay order:', error.message);
        return { success: false, error: 'Failed to create payment order on the server.' };
    }
}

export async function verifyRazorpayPayment(
    orderId: string,
    paymentId: string,
    signature: string,
    userId: string,
    plan: 'essentials' | 'pro' | 'recruiter'
) {
    if (!process.env.RAZORPAY_KEY_SECRET) {
        return { success: false, error: 'Razorpay secret key is not configured.' };
    }

    const body = orderId + '|' + paymentId;
    const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');
    
    if (expectedSignature === signature) {
        try {
            const userRef = doc(db, 'users', userId);
            await updateDoc(userRef, {
                plan: plan,
                planUpdatedAt: new Date(),
                requestedPlan: null, 
                paymentProofURL: `razorpay_order_${orderId}`
            });
            return { success: true, message: 'Payment verified and plan updated.' };
        } catch (dbError) {
            console.error('Error updating user plan:', dbError);
            return { success: false, error: 'Payment verified, but failed to update plan.' };
        }
    } else {
        return { success: false, error: 'Payment verification failed.' };
    }
}
