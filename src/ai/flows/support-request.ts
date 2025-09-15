'use server';

/**
 * @fileOverview A flow for submitting a support request.
 *
 * - submitSupportRequest - Saves a user's support request to Firestore.
 * - SupportRequestInput - The input type for the submitSupportRequest function.
 */

import { ai } from '@/ai/genkit';
import { db } from '@/lib/firebase';
import { addDoc, collection } from 'firebase/firestore';
import { z } from 'genkit';

export const SupportRequestInputSchema = z.object({
  subject: z.string().min(5),
  message: z.string().min(20),
  category: z.enum(['billing', 'technical', 'feedback', 'other']),
  userEmail: z.string().email(),
  userId: z.string(),
});

export type SupportRequestInput = z.infer<typeof SupportRequestInputSchema>;

export const submitSupportRequest = ai.defineFlow(
  {
    name: 'submitSupportRequest',
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
