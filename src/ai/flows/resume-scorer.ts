'use server';

/**
 * @fileOverview AI flow to score a resume based on professional checkpoints.
 * 
 * - scoreResume - Main function to evaluate resume quality.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ResumeScorerInputSchema = z.object({
  resumeText: z.string().describe('The full text content of the resume.'),
  atsScore: z.number().optional().describe('The score from the ATS Optimizer, if available.'),
});
export type ResumeScorerInput = z.infer<typeof ResumeScorerInputSchema>;

const ResumeScorerOutputSchema = z.object({
  totalScore: z.number().int().min(0).max(100),
  categories: z.array(z.object({
    name: z.string(),
    score: z.number().int(),
    maxScore: z.number().int(),
    suggestions: z.array(z.string()),
  })),
  criticalFixes: z.array(z.string()).describe('Top 3 most important things to fix first.'),
});
export type ResumeScorerOutput = z.infer<typeof ResumeScorerOutputSchema>;

export async function scoreResume(input: ResumeScorerInput): Promise<ResumeScorerOutput> {
  return scoreResumeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'resumeScorerPrompt',
  input: { schema: ResumeScorerInputSchema },
  output: { schema: ResumeScorerOutputSchema },
  prompt: `You are a professional resume auditor. Score the following resume text based on these 4 categories:

1. Content (Has summary, action verbs, no clichés, 1-2 line bullets)
2. Completeness (Contact info, LinkedIn, dates, skills, education)
3. Strength (Quantified achievements, strong verbs, tailored impact)
4. ATS (Integration provided below)

**Resume Text**:
{{{resumeText}}}

**External ATS Score**: {{{atsScore}}} (If not provided, evaluate ATS based on standard headings and structure).

**Instructions**:
- Evaluate across 23 professional checkpoints.
- Calculate a weighted total score (0-100).
- Provide specific, actionable suggestions for each category.
- Identify the top 3 'Critical Fixes'.

Return a valid JSON object.`,
});

const scoreResumeFlow = ai.defineFlow(
  {
    name: 'scoreResumeFlow',
    inputSchema: ResumeScorerInputSchema,
    outputSchema: ResumeScorerOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
