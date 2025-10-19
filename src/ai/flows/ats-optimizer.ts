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
      'A PDF of a resume as a data URI that must include a MIME type and use Base64 encoding. Expected format: data:application/pdf;base64,<encoded_data>.'
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
  config: {
    temperature: 0.1, // Set to a very low temperature for deterministic behavior
  },
  prompt: `You are a deterministic ATS scanning script. Your only purpose is to calculate a match score based on a strict formula.

**Resume PDF**:
{{media url=resumeDataUri}}

**Job Description**:
{{{jobDescription}}}

**Execution Steps**:
1.  **Extract Keywords**: From the **Job Description**, create a definitive list of all important keywords (skills, technologies, qualifications, and responsibilities).
2.  **Scan Resume**: Read the **Resume PDF** and identify which keywords from the list you created in Step 1 are present. The matching must be exact or a very close synonym.
3.  **Calculate Score**:
    -   Let \`A\` be the total number of unique keywords extracted from the **Job Description**.
    -   Let \`B\` be the number of those keywords found in the **Resume**.
    -   The **matchScore** MUST be calculated with the formula: \`(B / A) * 100\`, rounded to the nearest whole number. Do not use any other method.
4.  **Identify Missing Keywords**: List the keywords that were in the Job Description list but not found in the resume.
5.  **Provide Suggestions**: Based on the missing keywords, provide specific, actionable suggestions for improving the resume.

Your output must be a valid JSON object conforming to the AtsOptimizerOutputSchema. The matchScore must be consistent for identical inputs.
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
