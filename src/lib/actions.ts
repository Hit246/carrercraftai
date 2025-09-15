
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
import { submitSupportRequest, type SupportRequestInput } from '@/ai/flows/support-request';
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

export async function getPaymentSettings() {
    const settingsRef = doc(db, 'settings', 'payment');
    const settingsSnap = await getDoc(settingsRef);
    if (settingsSnap.exists()) {
        return settingsSnap.data();
    }
    return { upiId: 'your-upi-id@bank', qrCodeImageUrl: 'https://placehold.co/200x200.png' };
}


// We only re-export the type for the client form, not the schema object.
export type { SupportRequestInput };

export async function submitSupportRequestAction(
    input: SupportRequestInput
  ) {
    return await submitSupportRequest(input);
}
