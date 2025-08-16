// This file uses server-side code.
'use server';

/**
 * @fileOverview Candidate Matching AI agent.
 *
 * - candidateMatcher - A function that handles the candidate matching process.
 * - CandidateMatcherInput - The input type for the candidateMatcher function.
 * - CandidateMatcherOutput - The return type for the candidateMatcher function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CandidateMatcherInputSchema = z.object({
  jobDescription: z.string().describe('The description of the job.'),
  resumeDatabase: z.string().describe('A string containing multiple resumes, separated by triple backticks, that will be used as the candidate database.'),
});
export type CandidateMatcherInput = z.infer<typeof CandidateMatcherInputSchema>;

const CandidateMatcherOutputSchema = z.object({
  candidateMatches: z.array(
    z.object({
      resumeId: z.string().describe('A unique identifier for the resume that matches the job description, such as "Resume 1", "Resume 2", etc.'),
      matchScore: z.number().describe('A score indicating how well the candidate matches the job description. Higher scores indicate a better match.'),
      justification: z.string().describe('A short justification for why this candidate was selected.'),
    })
  ).describe('An array of candidate matches, including the resume ID and a match score.'),
});
export type CandidateMatcherOutput = z.infer<typeof CandidateMatcherOutputSchema>;

export async function candidateMatcher(input: CandidateMatcherInput): Promise<CandidateMatcherOutput> {
  return candidateMatcherFlow(input);
}

const prompt = ai.definePrompt({
  name: 'candidateMatcherPrompt',
  input: {schema: CandidateMatcherInputSchema},
  output: {schema: CandidateMatcherOutputSchema},
  prompt: `You are an expert recruiter specializing in matching candidates to job descriptions.

You will be provided with a job description and a database of resumes. Your task is to identify the candidates whose skills and experience best align with the job requirements.

Job Description: {{{jobDescription}}}

Resumes (each separated by '~~~'):
{{{resumeDatabase}}}

For each resume, assign a unique ID (e.g., "Resume 1", "Resume 2"). Assess its relevance to the job description and provide a match score (0-100) and a brief justification for your assessment.
Return the candidates that have the highest match scores.

Ensure that the output is a valid JSON object conforming to the CandidateMatcherOutputSchema.
`,
});

const candidateMatcherFlow = ai.defineFlow(
  {
    name: 'candidateMatcherFlow',
    inputSchema: CandidateMatcherInputSchema,
    outputSchema: CandidateMatcherOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
