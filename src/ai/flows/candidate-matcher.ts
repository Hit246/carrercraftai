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
  resumeDataUris: z.array(z.string()).describe(
    "A list of resume PDFs, each provided as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:application/pdf;base64,<encoded_data>'."
  ),
});
export type CandidateMatcherInput = z.infer<typeof CandidateMatcherInputSchema>;

const CandidateMatcherOutputSchema = z.object({
  candidateMatches: z.array(
    z.object({
      resumeId: z.string().describe('A unique identifier for the resume that matches the job description, such as "Resume 0", "Resume 1", etc. based on the array index.'),
      matchScore: z.number().min(0).max(100).describe('A score (0-100) indicating how well the candidate matches the job description. Higher scores indicate a better match.'),
      justification: z.string().describe('A single, concise sentence explaining why the candidate is a good match, focusing on the most critical skills.'),
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

You will be provided with a job description and a database of resume PDFs. Your task is to identify the top candidates whose skills and experience best align with the job requirements.

**Job Description**:
{{{jobDescription}}}

**Resumes**:
{{#each resumeDataUris}}
--- Start of Resume {{@index}} ---
{{media url=this}}
--- End of Resume {{@index}} ---
{{/each}}

**Instructions**:
1.  Assign a unique ID to each resume based on its array index (e.g., "Resume 0" for index 0, "Resume 1" for index 1).
2.  For each resume, assess its relevance to the job description and provide a match score from 0-100.
3.  Provide a single, concise justification sentence for your assessment, explaining *why* the candidate is a good match by cross-referencing their most critical skills with the job requirements.
4.  Return all candidates, sorted by their match score in descending order.

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
