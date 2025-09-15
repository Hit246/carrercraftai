
'use server';

/**
 * @fileOverview A flow for submitting a user's support request to Firestore.
 *
 * - submitSupportRequest - Saves a user's support request to Firestore.
 */

import { ai } from '@/ai/genkit';
import { db } from '@/lib/firebase';
import { addDoc, collection } from 'firebase/firestore';
import { z } from 'genkit';
import { SupportRequestInputSchema, type SupportRequestInput } from '@/lib/actions';


const submitSupportRequestFlow = ai.defineFlow(
  {
    name: 'submitSupportRequestFlow',
    inputSchema: SupportRequestInputSchema,
    outputSchema: z.object({ success: z.boolean() }),
  },
  async (input) => {
    try {
      await addDoc(collection(db, 'supportRequests'), {
        ...input,
        createdAt: new Date(),
        status: 'open',
      });
      return { success: true };
    } catch (error) {
      console.error('Error submitting support request:', error);
      return { success: false };
    }
  }
);

export async function submitSupportRequest(input: SupportRequestInput) {
    return await submitSupportRequestFlow(input);
}
