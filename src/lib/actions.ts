
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
import nodemailer from 'nodemailer';

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

export async function notifyAdminOfUpgradeAction(data: {
  userEmail: string;
  plan: string;
  amount?: number;
  type: 'MANUAL_REQUEST' | 'PROOF_UPLOADED' | 'WEBHOOK_PAID';
}) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, ADMIN_EMAIL } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !ADMIN_EMAIL) {
    console.warn("⚠️ SMTP credentials missing. Email notification skipped.");
    return { success: false, error: 'SMTP missing' };
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: parseInt(SMTP_PORT || '587'),
    secure: parseInt(SMTP_PORT || '587') === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  const subjectMap = {
    MANUAL_REQUEST: `🚀 New Upgrade Request: ${data.plan}`,
    PROOF_UPLOADED: `📸 Payment Proof Received: ${data.userEmail}`,
    WEBHOOK_PAID: `💰 Automatic Payment Success: ${data.plan}`,
  };

  const bodyMap = {
    MANUAL_REQUEST: `User ${data.userEmail} has requested an upgrade to the ${data.plan} plan. They are currently in the 'pending' state.`,
    PROOF_UPLOADED: `User ${data.userEmail} has uploaded a payment proof for their ${data.plan} upgrade. Please review it in the Admin Panel.`,
    WEBHOOK_PAID: `Great news! User ${data.userEmail} has successfully paid ₹${data.amount} for the ${data.plan} plan via Razorpay. Their account has been upgraded automatically.`,
  };

  try {
    await transporter.sendMail({
      from: `"CareerCraft AI System" <${SMTP_USER}>`,
      to: ADMIN_EMAIL,
      subject: subjectMap[data.type],
      text: bodyMap[data.type],
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #2563eb;">CareerCraft AI Notification</h2>
          <p>${bodyMap[data.type]}</p>
          <hr />
          <p><strong>User:</strong> ${data.userEmail}</p>
          <p><strong>Plan:</strong> ${data.plan}</p>
          ${data.amount ? `<p><strong>Amount:</strong> ₹${data.amount}</p>` : ''}
          <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/upgrades" style="display: inline-block; padding: 10px 20px; background: #2563eb; color: #fff; text-decoration: none; border-radius: 5px; margin-top: 10px;">View in Admin Panel</a>
        </div>
      `,
    });
    return { success: true };
  } catch (error) {
    console.error("❌ Email notification failed:", error);
    return { success: false, error: 'Email failed' };
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
