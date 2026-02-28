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
import { submitSupportRequest, replyToSupportRequest } from '@/ai/flows/support-request';
import { suggestResumeVersionName, SuggestResumeVersionNameInput, SuggestResumeVersionNameOutput } from '@/ai/flows/resume-version-namer';
import { summarizeCandidate, SummarizeCandidateInput, SummarizeCandidateOutput } from '@/ai/flows/candidate-summarizer';
import { db, uploadFile } from './firebase';
import type { SupportRequestInput, ReplySupportRequestInput } from './types';


export async function analyzeResumeAction(
  input: AnalyzeResumeInput
): Promise<AnalyzeResumeOutput> {
  return analyzeResume(input);
}

export async function jobMatcherAction(
  input: JobMatcherInput
): Promise<JobMatcherOutput> {
  return await jobMatcher(input);
}


export async function candidateMatcherAction(
    input: CandidateMatcherInput
  ): Promise<CandidateMatcherOutput> {
    const matchResult = await candidateMatcher({
        jobDescription: input.jobDescription,
        resumeDataUris: input.resumeDataUris
    });
    return matchResult;
}


export async function generateCoverLetterAction(
  input: GenerateCoverLetterInput
): Promise<GenerateCoverLetterOutput> {
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
    return { upiId: 'admin@careercraft.ai', qrCodeImageUrl: 'https://i.imgur.com/2O0s4Jm.png' };
}

export async function submitSupportRequestAction(
    input: SupportRequestInput
  ) {
    return await submitSupportRequest(input);
}

export async function replyToSupportRequestAction(
  input: ReplySupportRequestInput
) {
  return await replyToSupportRequest(input);
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

export async function saveCandidateAction(candidateData: {
    name: string;
    matchScore: number;
    jobTitle: string;
    justification: string;
    resumeURL?: string;
}, userId: string) {
    try {
        const candidateRef = firestoreCollection(db, `users/${userId}/shortlistedCandidates`);
        await addDoc(candidateRef, {
            ...candidateData,
            addedAt: serverTimestamp(),
            status: 'New'
        });
        return { success: true };
    } catch (error) {
        console.error("Error saving candidate:", error);
        throw new Error("Failed to shortlist candidate.");
    }
}
