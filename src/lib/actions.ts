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
import { db } from './firebase';
import type { SupportRequestInput, ReplySupportRequestInput } from './types';

// Admin Deletion
import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  try {
    const keyString = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (keyString) {
      const serviceAccount = JSON.parse(keyString);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log("✅ Firebase Admin SDK initialized successfully.");
    } else {
      console.warn("⚠️ FIREBASE_SERVICE_ACCOUNT_KEY missing. Admin features (like Auth deletion) will be disabled.");
    }
  } catch (e) {
    console.error("❌ Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY. Ensure it is a valid JSON string wrapped in single quotes in your .env file.", e);
  }
}

export async function deleteUserAccountAction(uid: string) {
  if (!admin.apps.length) {
    throw new Error("Admin SDK not initialized. Please set FIREBASE_SERVICE_ACCOUNT_KEY in your .env file.");
  }
  try {
    await admin.auth().deleteUser(uid);
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting user auth:", error);
    throw new Error(error.message || "Failed to delete user account from Firebase Authentication.");
  }
}

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

export async function verifyPromoCodeAction(code: string) {
    try {
        const cleanCode = code.toUpperCase().trim();
        if (!cleanCode) return { success: false, error: 'Promo code is required.' };
        
        const docRef = doc(db, 'promoCodes', cleanCode);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            const data = docSnap.data();
            return { 
                success: true, 
                data: {
                    code: data.code,
                    discount: data.discount
                }
            };
        }
        return { success: false, error: 'Invalid or expired promo code.' };
    } catch (e: any) {
        console.error("Server Promo Verification Error:", e);
        return { success: false, error: e.message || 'System error during verification.' };
    }
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
