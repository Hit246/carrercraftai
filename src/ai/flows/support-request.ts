
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

    // 1. Create the main support request document
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
    
    // 2. Create the first message in the history subcollection
    const historyRef = doc(collection(supportRequestRef, 'history'));
    batch.set(historyRef, {
        message: input.message,
        sender: 'user',
        timestamp: now,
    });
    
    batch.commit()
    .catch((serverError: any) => {
        // Create a contextual error for better debugging
        const permissionError = new FirestorePermissionError({
            path: supportRequestRef.path,
            operation: 'create',
            requestResourceData: input,
        } as SecurityRuleContext, serverError);
        
        errorEmitter.emit('permission-error', permissionError);
    });

    // Return success immediately for optimistic UI
    return { success: true };
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
        status: 'in-progress',
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
