
import { z } from 'zod';

export const SupportRequestInputSchema = z.object({
    subject: z.string().min(5),
    message: z.string().min(20),
    category: z.enum(['billing', 'technical', 'feedback', 'other']),
    userEmail: z.string().email(),
    userId: z.string(),
});
export type SupportRequestInput = z.infer<typeof SupportRequestInputSchema>;

export const ReplySupportRequestInputSchema = z.object({
  requestId: z.string(),
  message: z.string().min(1),
  sender: z.enum(['user', 'admin']),
});
export type ReplySupportRequestInput = z.infer<typeof ReplySupportRequestInputSchema>;
