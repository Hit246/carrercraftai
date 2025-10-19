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
    overall_score: z.number().int().min(0).max(100).describe("The final, overall score from 0-100."),
    breakdown: z.object({
        skill_match: z.number().int().min(0).max(50),
        experience_alignment: z.number().int().min(0).max(25),
        education_certifications: z.number().int().min(0).max(10),
        keyword_fit: z.number().int().min(0).max(10),
        formatting_readability: z.number().int().min(0).max(5),
    }),
    skills_matched: z.array(z.string()).describe("A list of skills found in both the job description and the resume."),
    skills_missing: z.array(z.string()).describe("A list of important skills from the job description that were not found in the resume."),
    summary: z.string().describe("A single, one-sentence factual summary of the match result."),
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
    temperature: 0, // Set to 0 for deterministic behavior
  },
  prompt: `You are an Applicant Tracking System (ATS) evaluation engine.

Task:
Evaluate how well the provided RESUME matches the JOB DESCRIPTION.
Be deterministic and consistent — identical inputs must yield identical output.

Scoring Criteria (Total 100 points):

1. Skill Match (50 pts)
   - Identify overlap between technical and professional skills.
   - Consider close synonyms (e.g., "React" ≈ "Next.js", "SQL" ≈ "PostgreSQL").
   - Partial similarity = half credit.

2. Experience Alignment (25 pts)
   - Check whether the candidate’s experience, job titles, and responsibilities align with the described role and level.

3. Education & Certifications (10 pts)
   - Determine if degrees or certifications satisfy stated requirements.

4. Keyword & Industry Fit (10 pts)
   - Evaluate language similarity and relevance to the target industry.

5. Formatting & Readability (5 pts)
   - Penalize for poor structure, images, or excessive tables.

**RESUME PDF**:
{{media url=resumeDataUri}}

**JOB DESCRIPTION**:
{{{jobDescription}}}


Rules:
- Output must be valid JSON only.
- Never invent skills not present in either text.
- Always ground scores in textual evidence.
- The sum of the breakdown scores must equal the overall_score.
- Do not add any commentary or explanation outside of the JSON structure.

Your output must be a valid JSON object conforming to the schema I have provided.
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
