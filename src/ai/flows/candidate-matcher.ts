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
      matchScore: z.number().min(0).max(100).describe('A score (0-100) indicating how well the candidate matches the job description. Higher scores indicate a better match.'),
      justification: z.string().describe('A detailed justification for why this candidate was selected, referencing specific skills from the resume and requirements from the job description.'),
    })
  ).describe('An array of candidate matches, including the resume ID, a match score, and justification.'),
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

You will be provided with a job description and a database of resumes. Your task is to identify the top 5 candidates whose skills and experience best align with the job requirements.

**Job Description**:
{{{jobDescription}}}

**Resumes (each separated by '~~~')**:
{{{resumeDatabase}}}

**Instructions**:
1.  Assign a unique ID to each resume (e.g., "Resume 1", "Resume 2").
2.  For each resume, assess its relevance to the job description and provide a match score from 0-100.
3.  Provide a detailed justification for your assessment, explaining *why* the candidate is a good match by cross-referencing their skills with the job requirements.
4.  Return only the top 5 candidates with the highest match scores.

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
