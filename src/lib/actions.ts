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
import { resumeAgent, ResumeAgentInput, ResumeAgentOutput } from '@/ai/flows/resume-agent';
import { scoreResume, ResumeScorerInput, ResumeScorerOutput } from '@/ai/flows/resume-scorer';
import { db } from './firebase';
import type { SupportRequestInput, ReplySupportRequestInput } from './types';
import nodemailer from 'nodemailer';

// Admin Deletion
import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  try {
    const keyString = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (keyString) {
      let sanitizedKey = keyString.trim();
      if ((sanitizedKey.startsWith("'") && sanitizedKey.endsWith("'")) || 
          (sanitizedKey.startsWith('"') && sanitizedKey.endsWith('"'))) {
        sanitizedKey = sanitizedKey.slice(1, -1).trim();
      }

      const serviceAccount = JSON.parse(sanitizedKey);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log("✅ Firebase Admin SDK initialized successfully.");
    } else {
      console.warn("⚠️ FIREBASE_SERVICE_ACCOUNT_KEY missing.");
    }
  } catch (e) {
    console.error("❌ Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY.", e);
  }
}

export async function deleteUserAccountAction(uid: string) {
  if (!admin.apps.length) {
    throw new Error("Admin SDK not initialized.");
  }
  try {
    await admin.auth().deleteUser(uid);
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting user auth:", error);
    throw new Error(error.message || "Failed to delete user account.");
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
    MANUAL_REQUEST: `User ${data.userEmail} has requested an upgrade to the ${data.plan} plan.`,
    PROOF_UPLOADED: `User ${data.userEmail} has uploaded a payment proof.`,
    WEBHOOK_PAID: `User ${data.userEmail} has paid ₹${data.amount} for the ${data.plan} plan.`,
  };

  try {
    await transporter.sendMail({
      from: `"CareerCraft AI System" <${SMTP_USER}>`,
      to: ADMIN_EMAIL,
      subject: subjectMap[data.type],
      html: `<p>${bodyMap[data.type]}</p>`,
    });
    return { success: true };
  } catch (error) {
    console.error("❌ Email notification failed:", error);
    return { success: false, error: 'Email failed' };
  }
}

export async function analyzeResumeAction(input: AnalyzeResumeInput): Promise<AnalyzeResumeOutput> {
  return analyzeResume(input);
}

export async function jobMatcherAction(input: JobMatcherInput): Promise<JobMatcherOutput> {
  return await jobMatcher(input);
}

export async function candidateMatcherAction(input: CandidateMatcherInput): Promise<CandidateMatcherOutput> {
  return await candidateMatcher(input);
}

export async function generateCoverLetterAction(input: GenerateCoverLetterInput): Promise<GenerateCoverLetterOutput> {
  return await generateCoverLetter(input);
}

export async function atsOptimizerAction(input: AtsOptimizerInput): Promise<AtsOptimizerOutput> {
  return await atsOptimizer(input);
}

export async function submitSupportRequestAction(input: SupportRequestInput) {
    return await submitSupportRequest(input);
}

export async function replyToSupportRequestAction(input: ReplySupportRequestInput) {
  return await replyToSupportRequest(input);
}

export async function suggestResumeVersionNameAction(input: SuggestResumeVersionNameInput): Promise<SuggestResumeVersionNameOutput> {
    return await suggestResumeVersionName(input);
}

export async function summarizeCandidateAction(input: SummarizeCandidateInput): Promise<SummarizeCandidateOutput> {
  return await summarizeCandidate(input);
}

export async function resumeAgentAction(input: ResumeAgentInput): Promise<ResumeAgentOutput> {
  return await resumeAgent(input);
}

export async function resumeScoreAction(input: ResumeScorerInput): Promise<ResumeScorerOutput> {
  return await scoreResume(input);
}
