
'use server';

/**
 * @fileOverview A flow for submitting a user's support request to Firestore.
 *
 * - submitSupportRequest - Saves a user's support request to Firestore.
 */

import { getFirestore, Timestamp, FieldValue } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert, type App } from 'firebase-admin/app';
import type { ReplySupportRequestInput, SupportRequestInput } from '@/lib/types';

// Helper function to initialize Firebase Admin SDK idempotently
function initializeFirebaseAdmin(): App {
    // If the app is already initialized, return it.
    if (getApps().length > 0) {
        return getApps()[0];
    }
    // Otherwise, initialize the app. The Admin SDK will automatically
    // find the project's credentials in the environment.
    return initializeApp();
}

// This is the function that will be called by the server action.
export async function submitSupportRequest(input: SupportRequestInput) {
    try {
        const app = initializeFirebaseAdmin();
        const db = getFirestore(app);
    
        const batch = db.batch();
        const now = Timestamp.now();
      
        // Create main request doc
        const supportRequestRef = db.collection('supportRequests').doc();
        batch.set(supportRequestRef, {
          userId: input.userId,
          userEmail: input.userEmail,
          subject: input.subject,
          category: input.category,
          status: 'open',
          createdAt: now,
          lastMessageAt: now,
        });
      
        // Create first message
        const historyRef = supportRequestRef.collection('history').doc();
        batch.set(historyRef, {
          message: input.message,
          sender: 'user',
          timestamp: now,
        });
      
        await batch.commit();
        return { success: true };
    } catch (serverError: any) {
        console.error("❌ Firestore commit failed:", serverError);
        // We re-throw the error so the client-side catch block can handle it.
        throw new Error("Failed to submit support request to Firestore.");
    }
}
  
export async function replyToSupportRequest(input: ReplySupportRequestInput) {
    try {
        const app = initializeFirebaseAdmin();
        const db = getFirestore(app);
    
        const { requestId, message, sender } = input;
        const now = Timestamp.now();
    
        const requestRef = db.collection('supportRequests').doc(requestId);
        const historyRef = requestRef.collection('history').doc();
    
        const batch = db.batch();
    
        // Add the new message to history
        batch.set(historyRef, {
            message,
            sender,
            timestamp: now,
        });
    
        // Update the main request document
        batch.update(requestRef, {
            status: sender === 'admin' ? 'in-progress' : 'open',
            lastMessageAt: now,
        });
        
        await batch.commit();
        return { success: true };

    } catch (serverError) {
        console.error("❌ Firestore commit failed (reply):", serverError);
        throw new Error("Failed to reply to support request.");
    }
}
