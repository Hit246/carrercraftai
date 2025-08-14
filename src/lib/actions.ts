'use server';

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
