'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/resume-analyzer.ts';
import '@/ai/flows/job-matcher.ts';
import '@/ai/flows/candidate-matcher.ts';
import '@/ai/flows/cover-letter-generator.ts';
import '@/ai/flows/support-request.ts';
import '@/ai/flows/ats-optimizer.ts';
import '@/ai/flows/resume-version-namer.ts';
import '@/ai/flows/candidate-summarizer.ts';
import '@/ai/flows/payment-verifier.ts';
