
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

// Define the schema directly in this file.
const SupportRequestInputSchema = z.object({
    subject: z.string().min(5),
    message: z.string().min(20),
    category: z.enum(['billing', 'technical', 'feedback', 'other']),
    userEmail: z.string().email(),
    userId: z.string(),
});
export type SupportRequestInput = z.infer<typeof SupportRequestInputSchema>;


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

// This is the function that will be called by the server action.
export async function submitSupportRequest(input: SupportRequestInput) {
    return await submitSupportRequestFlow(input);
}
