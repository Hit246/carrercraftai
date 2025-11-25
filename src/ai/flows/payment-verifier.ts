'use server';

/**
 * @fileOverview A flow to handle payment verification notifications.
 *
 * - sendPaymentVerificationEmail - A function that "sends" a verification email to the admin.
 * - SendPaymentVerificationEmailInput - The input type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const ADMIN_EMAIL = 'admin@careercraft.ai';

const SendPaymentVerificationEmailInputSchema = z.object({
  userEmail: z.string().email().describe("The email of the user who made the payment."),
  requestedPlan: z.string().describe("The plan the user requested."),
  paymentProofURL: z.string().url().describe("The URL to the payment proof screenshot."),
});

type SendPaymentVerificationEmailInput = z.infer<typeof SendPaymentVerificationEmailInputSchema>;

const sendPaymentVerificationEmailFlow = ai.defineFlow(
  {
    name: 'sendPaymentVerificationEmailFlow',
    inputSchema: SendPaymentVerificationEmailInputSchema,
    outputSchema: z.void(),
  },
  async (input) => {
    const { userEmail, requestedPlan, paymentProofURL } = input;

    const emailSubject = `Payment Verification Required: ${userEmail} for ${requestedPlan} plan`;

    const emailBody = `
      <p>A new payment has been submitted for verification.</p>
      <ul>
        <li><strong>User Email:</strong> ${userEmail}</li>
        <li><strong>Requested Plan:</strong> ${requestedPlan}</li>
        <li><strong>Payment Proof:</strong> <a href="${paymentProofURL}" target="_blank">View Proof</a></li>
      </ul>
      <p>Please log in to the admin panel to approve or reject this request.</p>
    `;
    
    // In a real application, you would integrate an email service like SendGrid, Resend, or Nodemailer here.
    // For this simulation, we will log the email content to the console.
    console.log("--- SIMULATING EMAIL ---");
    console.log(`To: ${ADMIN_EMAIL}`);
    console.log(`Subject: ${emailSubject}`);
    console.log(`Body (HTML): ${emailBody}`);
    console.log("------------------------");
    
    // Since we are not actually sending an email, we can just resolve the promise.
    return;
  }
);

export async function sendPaymentVerificationEmail(input: SendPaymentVerificationEmailInput): Promise<void> {
    return await sendPaymentVerificationEmailFlow(input);
}
