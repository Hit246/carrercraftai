'use server';

/**
 * @fileOverview ATS Optimization AI agent.
 *
 * - atsOptimizer - A function that compares a resume to a job description.
 * - AtsOptimizerInput - The input type for the atsOptimizer function.
 * - AtsOptimizerOutput - The return type for the atsOptimizer function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AtsOptimizerInputSchema = z.object({
  resumeDataUri: z
    .string()
    .describe(
      'A resume as a data URI that must include a MIME type and use Base64 encoding. Expected format: data:<mimetype>;base64,<encoded_data>.'
    ),
  jobDescription: z.string().describe('The job description to compare the resume against.'),
});
export type AtsOptimizerInput = z.infer<typeof AtsOptimizerInputSchema>;

const AtsOptimizerOutputSchema = z.object({
    matchScore: z.number().min(0).max(100).describe('A score from 0-100 indicating how well the resume matches the job description based on ATS criteria.'),
    missingKeywords: z.array(z.string()).describe('A list of important keywords found in the job description that are missing from the resume.'),
    suggestedImprovements: z.array(z.string()).describe('A list of actionable suggestions for improving the resume to better match the job description.'),
});
export type AtsOptimizerOutput = z.infer<typeof AtsOptimizerOutputSchema>;


export async function atsOptimizer(input: AtsOptimizerInput): Promise<AtsOptimizerOutput> {
  return atsOptimizerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'atsOptimizerPrompt',
  input: {schema: AtsOptimizerInputSchema},
  output: {schema: AtsOptimizerOutputSchema},
  prompt: `You are an expert Applicant Tracking System (ATS) analyst and career coach. Your task is to analyze a resume against a given job description and provide a detailed optimization report.

**Job Description**:
{{{jobDescription}}}

**Resume**:
{{media url=resumeDataUri}}

**Instructions**:
1.  **Calculate Match Score**: Thoroughly compare the resume to the job description. Calculate a "Match Score" from 0 to 100 representing the alignment. A score of 100 means a perfect match.
2.  **Identify Missing Keywords**: Extract the most critical keywords and phrases (skills, technologies, qualifications) from the job description that are absent from the resume.
3.  **Provide Actionable Suggestions**: Give specific, actionable advice on how to improve the resume. Suggestions should be concrete, such as "Incorporate the phrase 'agile methodologies' into your project descriptions" or "Add a 'Project Management' section to highlight your experience leading teams."

Return the analysis as a valid JSON object conforming to the AtsOptimizerOutputSchema.
`,
});

const atsOptimizerFlow = ai.defineFlow(
  {
    name: 'atsOptimizerFlow',
    inputSchema: AtsOptimizerInputSchema,
    outputSchema: AtsOptimizerOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
