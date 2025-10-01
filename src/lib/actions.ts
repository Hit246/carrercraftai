'use server';

import { doc, getDoc, addDoc, collection as firestoreCollection, serverTimestamp } from 'firebase/firestore';
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
import { suggestResumeVersionName, SuggestResumeVersionNameInput, SuggestResumeVersionNameOutput } from '@/ai/flows/resume-version-namer';
import { summarizeCandidate, SummarizeCandidateInput, SummarizeCandidateOutput } from '@/ai/flows/candidate-summarizer';
import type { SupportRequestInput } from '@/ai/flows/support-request';
import { db, uploadFile } from './firebase';

export async function analyzeResumeAction(
  input: AnalyzeResumeInput
): Promise<AnalyzeResumeOutput> {
  return analyzeResume(input);
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
    
    // 1. Get AI matching results
    const matchResult = await candidateMatcher({
        jobDescription: input.jobDescription,
        resumeDataUris: input.resumeDataUris
    });
    
    return matchResult;
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
    return { upiId: 'chauhanhitarth6@oksbi', qrCodeImageUrl: 'https://i.imgur.com/2O0s4Jm.png' };
}

export async function submitSupportRequestAction(
    input: SupportRequestInput
  ) {
    return await submitSupportRequest(input);
}

export async function suggestResumeVersionNameAction(
    input: SuggestResumeVersionNameInput
    ): Promise<SuggestResumeVersionNameOutput> {
    return await suggestResumeVersionName(input);
}

export async function summarizeCandidateAction(
  input: SummarizeCandidateInput
): Promise<SummarizeCandidateOutput> {
  return await summarizeCandidate(input);
}


export type { SupportRequestInput };
