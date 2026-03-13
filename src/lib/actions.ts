
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

// Lazy initialized admin
let adminModule: any = null;

async function getAdmin() {
  if (adminModule) return adminModule;
  const admin = await import('firebase-admin');
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
      }
    } catch (e) {
      console.error("❌ Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY.", e);
    }
  }
  adminModule = admin;
  return admin;
}

export async function deleteUserAccountAction(uid: string) {
  const admin = await getAdmin();
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
  type: 'MANUAL_REQUEST' | 'PROOF_UPLOADED' | 'WEBHOOK_PAID' | 'CANCELLATION_REQUEST';
}) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, ADMIN_EMAIL } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !ADMIN_EMAIL) {
    return { success: false, error: 'SMTP missing' };
  }

  const nodemailer = await import('nodemailer');
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
    CANCELLATION_REQUEST: `⚠️ Cancellation Requested: ${data.userEmail}`,
  };

  const bodyMap = {
    MANUAL_REQUEST: `User ${data.userEmail} has requested an upgrade to the ${data.plan} plan.`,
    PROOF_UPLOADED: `User ${data.userEmail} has uploaded a payment proof. Review it in the Admin Panel.`,
    WEBHOOK_PAID: `User ${data.userEmail} has paid ₹${data.amount} for the ${data.plan} plan. Account upgraded.`,
    CANCELLATION_REQUEST: `User ${data.userEmail} has requested to cancel their ${data.plan} subscription. Revert them to Free if eligible.`,
  };

  try {
    // Notify ADMIN
    await transporter.sendMail({
      from: `"CareerCraft AI System" <${SMTP_USER}>`,
      to: ADMIN_EMAIL,
      subject: subjectMap[data.type],
      html: `<p>${bodyMap[data.type]}</p>`,
    });

    // Notify USER (Confirmation)
    if (data.type === 'MANUAL_REQUEST' || data.type === 'CANCELLATION_REQUEST') {
        const userSubject = data.type === 'MANUAL_REQUEST' ? 'Upgrade Request Received' : 'Cancellation Request Received';
        const userBody = data.type === 'MANUAL_REQUEST' 
            ? `We've received your request to upgrade to ${data.plan}. Our team is reviewing your payment and will activate your account shortly.`
            : `We've received your request to cancel your subscription. Your access will continue until the end of your billing cycle. If you're eligible for a refund per our policy, it will be processed within 5-7 business days.`;

        await transporter.sendMail({
            from: `"CareerCraft AI" <${SMTP_USER}>`,
            to: data.userEmail,
            subject: userSubject,
            html: `<div style="font-family:sans-serif;"><h2 style="color:#3b82f6;">CareerCraft AI</h2><p>${userBody}</p></div>`,
        });
    }

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
