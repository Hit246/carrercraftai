
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
import type { FirestorePermissionError } from '@/lib/errors';

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
    try {
        await addDoc(supportRequestsRef, {
            ...input,
            createdAt: new Date(),
            status: 'open',
        });
        return { success: true };
    } catch (serverError: any) {
        console.error('Error submitting support request:', serverError);
        
        // Create a contextual error for better debugging
        const permissionError = {
            name: 'FirestorePermissionError',
            message: `FirestoreError: Missing or insufficient permissions for creating a document in 'supportRequests'.`,
            context: {
                path: supportRequestsRef.path,
                operation: 'create',
                requestResourceData: input,
            },
            originalError: serverError,
        } as FirestorePermissionError;
        
        errorEmitter.emit('permission-error', permissionError);

        // Also, re-throw the original error or a new one to indicate failure to the client
        throw new Error("Failed to submit support request due to a server error.");
    }
}
