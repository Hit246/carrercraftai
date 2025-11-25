'use server';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

let razorpay: Razorpay;

if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
} else {
    console.warn("Razorpay keys not found. Please add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to your .env file.");
}


export async function createRazorpayOrder(amount: number, currency: string) {
    if (!razorpay) {
        throw new Error('Razorpay is not initialized. Missing API keys.');
    }

    const options = {
        amount: amount * 100, // amount in the smallest currency unit
        currency,
        receipt: `receipt_order_${new Date().getTime()}`,
    };

    try {
        const order = await razorpay.orders.create(options);
        return { success: true, order };
    } catch (error) {
        console.error('Error creating Razorpay order:', error);
        return { success: false, error: 'Failed to create order.' };
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
        throw new Error('Razorpay secret key is not configured.');
    }

    const body = orderId + '|' + paymentId;
    const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');
    
    if (expectedSignature === signature) {
        // Payment is verified, update user's plan in Firestore
        try {
            const userRef = doc(db, 'users', userId);
            await updateDoc(userRef, {
                plan: plan,
                planUpdatedAt: new Date(),
                requestedPlan: null, // Clear any pending requests
                paymentProofURL: `razorpay_order_${orderId}` // Store order ID as reference
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
