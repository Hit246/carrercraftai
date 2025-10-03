
'use server';

/**
 * @fileOverview A flow for submitting a user's support request to Firestore.
 *
 * - submitSupportRequest - Saves a user's support request to Firestore.
 */

import { db } from '@/lib/firebase';
import { addDoc, collection } from 'firebase/firestore';
import { z } from 'zod';
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/lib/errors';

// Define the schema directly in this file.
const SupportRequestInputSchema = z.object({
    subject: z.string().min(5),
    message: z.string().min(20),
    category: z.enum(['billing', 'technical', 'feedback', 'other']),
    userEmail: z.string().email(),
    userId: z.string(),
});
export type SupportRequestInput = z.infer<typeof SupportRequestInputSchema>;


// This is the function that will be called by the server action.
export async function submitSupportRequest(input: SupportRequestInput) {
    const supportRequestsRef = collection(db, 'supportRequests');
    const newRequestData = {
        ...input,
        createdAt: new Date(),
        status: 'open',
    };
    
    try {
        await addDoc(supportRequestsRef, newRequestData);
        return { success: true };
    } catch (serverError: any) {
        
        // Create a contextual error for better debugging
        const permissionError = new FirestorePermissionError({
            path: supportRequestsRef.path,
            operation: 'create',
            requestResourceData: newRequestData,
        } as SecurityRuleContext, serverError);
        
        errorEmitter.emit('permission-error', permissionError);

        // Also, re-throw the original error or a new one to indicate failure to the client
        throw new Error("Failed to submit support request due to a server error.");
    }
}

