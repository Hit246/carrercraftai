
'use server';

/**
 * @fileOverview A flow for submitting a user's support request to Firestore.
 *
 * - submitSupportRequest - Saves a user's support request to Firestore.
 */

import { db } from '@/lib/firebase';
import { addDoc, collection, doc, serverTimestamp, updateDoc, writeBatch } from 'firebase/firestore';
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/lib/errors';
import type { ReplySupportRequestInput, SupportRequestInput } from '@/lib/types';

// This is the function that will be called by the server action.
export async function submitSupportRequest(input: SupportRequestInput) {
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
  
    try {
      await batch.commit();
      return { success: true };
    } catch (serverError: any) {
        console.error("❌ Firestore commit failed:", serverError);
        // Create a contextual error for better debugging if this is a permission issue.
        const permissionError = new FirestorePermissionError({
            path: supportRequestRef.path,
            operation: 'create',
            requestResourceData: {
                userId: input.userId,
                subject: input.subject,
                category: input.category,
            },
        } as SecurityRuleContext, serverError);
        
        errorEmitter.emit('permission-error', permissionError);

        // Re-throw the original error to let the frontend know something went wrong.
        throw serverError;
    }
  }
  


export async function replyToSupportRequest(input: ReplySupportRequestInput) {
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
    
    batch.commit()
        .catch((serverError: any) => {
            const permissionError = new FirestorePermissionError({
                path: historyRef.path,
                operation: 'create',
                requestResourceData: { message, sender },
            } as SecurityRuleContext, serverError);
            
            errorEmitter.emit('permission-error', permissionError);
        });

    return { success: true };
}
