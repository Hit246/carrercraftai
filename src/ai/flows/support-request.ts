
'use server';

/**
 * @fileOverview A flow for submitting a user's support request to Firestore.
 *
 * - submitSupportRequest - Saves a user's support request to Firestore.
 */

import { collection, addDoc, serverTimestamp, writeBatch, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { ReplySupportRequestInput, SupportRequestInput } from '@/lib/types';


// This is the function that will be called by the server action.
export async function submitSupportRequest(input: SupportRequestInput) {
    try {
        const batch = writeBatch(db);
        const now = serverTimestamp();
      
        // Create main request doc
        const supportRequestRef = doc(collection(db, 'supportRequests'));
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
        const historyRef = doc(collection(supportRequestRef, 'history'));
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
        const { requestId, message, sender } = input;
        const now = serverTimestamp();
    
        const requestRef = doc(db, 'supportRequests', requestId);
        const historyRef = doc(collection(requestRef, 'history'));
    
        const batch = writeBatch(db);
    
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
