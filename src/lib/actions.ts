
'use server';

import { doc, getDoc } from 'firebase/firestore';
import {
  analyzeResume,
  AnalyzeResumeInput,
  AnalyzeResumeOutput,
} from '@/ai/flows/resume-analyzer';
import {
  jobMatcher,
  JobMatcherInput,
  JobMatcherOutput,
} from '@/ai/flows/job-matcher';
import {
  candidateMatcher,
  CandidateMatcherInput,
  CandidateMatcherOutput,
} from '@/ai/flows/candidate-matcher';
import {
  generateCoverLetter,
  GenerateCoverLetterInput,
  GenerateCoverLetterOutput,
} from '@/ai/flows/cover-letter-generator';
import { atsOptimizer, AtsOptimizerInput, AtsOptimizerOutput } from '@/ai/flows/ats-optimizer';
import { submitSupportRequest } from '@/ai/flows/support-request';
import { db } from './firebase';
import { z } from 'zod';

export async function analyzeResumeAction(
  input: AnalyzeResumeInput
): Promise<AnalyzeResumeOutput> {
  // In a real app, you would check the user's subscription tier here before proceeding.
  return await analyzeResume(input);
}

export async function jobMatcherAction(
  input: JobMatcherInput
): Promise<JobMatcherOutput> {
  // In a real app, you would check the user's subscription tier here.
  return await jobMatcher(input);
}

export async function candidateMatcherAction(
  input: CandidateMatcherInput
): Promise<CandidateMatcherOutput> {
  // In a real app, you would check the company's subscription tier here.
  return await candidateMatcher(input);
}

export async function generateCoverLetterAction(
  input: GenerateCoverLetterInput
): Promise<GenerateCoverLetterOutput> {
  // In a real app, you would check the user's subscription tier here.
  return await generateCoverLetter(input);
}

export async function atsOptimizerAction(
  input: AtsOptimizerInput
): Promise<AtsOptimizerOutput> {
  return await atsOptimizer(input);
}

export async function getPaymentSettings() {
    const settingsRef = doc(db, 'settings', 'payment');
    const settingsSnap = await getDoc(settingsRef);
    if (settingsSnap.exists()) {
        return settingsSnap.data();
    }
    return { upiId: 'your-upi-id@bank', qrCodeImageUrl: 'https://placehold.co/200x200.png' };
}

export const SupportRequestInputSchema = z.object({
    subject: z.string().min(5),
    message: z.string().min(20),
    category: z.enum(['billing', 'technical', 'feedback', 'other']),
    userEmail: z.string().email(),
    userId: z.string(),
});
export type SupportRequestInput = z.infer<typeof SupportRequestInputSchema>;

export async function submitSupportRequestAction(
    input: SupportRequestInput
  ) {
    return await submitSupportRequest(input);
}
