'use server';

import {
  analyzeResume,
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

interface AnalyzeResumeActionInput {
    resumeText: string;
}

export async function analyzeResumeAction(
  input: AnalyzeResumeActionInput
): Promise<AnalyzeResumeOutput> {
  // In a real app, you would check the user's subscription tier here before proceeding.
  const resumeDataUri = `data:text/plain;base64,${Buffer.from(input.resumeText).toString('base64')}`;
  return await analyzeResume({ resumeDataUri });
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
