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
  prompt: `You are an advanced Applicant Tracking System (ATS) simulator. Your task is to perform a semantic analysis of a resume against a job description and provide a consistent, accurate match score.

**Resume PDF**:
{{media url=resumeDataUri}}

**Job Description**:
{{{jobDescription}}}

**Execution Steps**:
1.  **Analyze Job Requirements**: Identify the core skills, experience level (e.g., years of experience), and key qualifications required by the **Job Description**.
2.  **Semantic Resume Scan**: Read the **Resume PDF** and analyze its content based on semantic relevance, not just exact keyword matches. Understand concepts and synonyms (e.g., "managed a team" is similar to "led a group").
3.  **Calculate Score**:
    -   Assess the alignment between the resume and the job description across three categories: Skills, Experience, and Qualifications.
    -   The **matchScore** should be a weighted average reflecting the overall fit. A strong candidate who meets most critical requirements should score above 80. A candidate missing several key requirements should score lower.
    -   For identical inputs, the score must be highly consistent.
4.  **Identify Missing Keywords**: Based on your analysis, list the most important skills and qualifications mentioned in the job description that are not adequately represented in the resume.
5.  **Provide Actionable Suggestions**: Generate a list of concrete suggestions for improving the resume. Each suggestion should directly relate to a weakness or a missing keyword you identified. For example: "Incorporate the term 'SaaS' in your project descriptions to better align with the job's focus on software-as-a-service products."

Your output must be a valid JSON object conforming to the AtsOptimizerOutputSchema.
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
