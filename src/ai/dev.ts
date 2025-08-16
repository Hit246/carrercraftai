import { config } from 'dotenv';
config();

import '@/ai/flows/resume-analyzer.ts';
import '@/ai/flows/job-matcher.ts';
import '@/ai/flows/candidate-matcher.ts';
import '@/ai/flows/cover-letter-generator.ts';
