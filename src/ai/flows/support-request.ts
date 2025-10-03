
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
  
    const historyRef = doc(collection(supportRequestRef, 'history'));
    batch.set(historyRef, {
      message: input.message,
      sender: 'user',
      timestamp: now,
    });
  
    await batch.commit(); // ✅ important
  
    return { success: true, requestId: supportRequestRef.id };
  }  


  export async function replyToSupportRequest(input: ReplySupportRequestInput) {
    const { requestId, message, sender } = input;
    const now = serverTimestamp();
  
    const requestRef = doc(db, 'supportRequests', requestId);
    const historyRef = doc(collection(requestRef, 'history'));
  
    const batch = writeBatch(db);
  
    batch.set(historyRef, {
      message,
      sender,
      timestamp: now,
    });
  
    batch.update(requestRef, {
      status: 'in-progress',
      lastMessageAt: now,
    });
  
    await batch.commit(); // ✅ important
  
    return { success: true };
  }
  
