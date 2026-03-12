'use server';

/**
 * @fileOverview Consolidated ATS Optimization & Professional Audit AI agent.
 *
 * - atsOptimizer - A function that compares a resume to a job description AND performs a document quality audit.
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
    overall_score: z.number().int().min(0).max(100).describe("The job match score (0-100) based on alignment with the JD."),
    breakdown: z.object({
        skill_match: z.number().int().min(0).max(50),
        experience_alignment: z.number().int().min(0).max(25),
        education_certifications: z.number().int().min(0).max(10),
        keyword_fit: z.number().int().min(0).max(10),
        formatting_readability: z.number().int().min(0).max(5),
    }),
    skills_matched: z.array(z.string()).describe("Skills present in both JD and resume."),
    skills_missing: z.array(z.string()).describe("Critical skills from JD missing in resume."),
    summary: z.string().describe("A one-sentence factual summary of the match."),
    
    // Integrated Professional Audit (CareerCraft Score Logic)
    professional_audit: z.object({
        quality_score: z.number().int().min(0).max(100).describe("General professional quality score."),
        categories: z.array(z.object({
            name: z.string(),
            score: z.number().int(),
            maxScore: z.number().int(),
            suggestions: z.array(z.string())
        })),
        critical_fixes: z.array(z.string()).describe("Top 3 most important professional document fixes.")
    })
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
    temperature: 0,
  },
  prompt: `You are an advanced Applicant Tracking System (ATS) and professional resume auditor.

Evaluate the provided RESUME against the JOB DESCRIPTION and conduct a comprehensive professional document audit.

### TASK 1: ATS MATCHING
Score the resume's alignment with the JD across:
1. Skill Match (50 pts)
2. Experience Alignment (25 pts)
3. Education & Certifications (10 pts)
4. Keyword & Industry Fit (10 pts)
5. Formatting & Readability (5 pts)

### TASK 2: PROFESSIONAL AUDIT (Quality Score)
Evaluate the document itself based on professional standards:
- **Content**: Summary strength, action verbs, quantification (numbers/metrics), no cliches.
- **Completeness**: Contact info, LinkedIn, dates, skills, education.
- **Strength**: Quantified achievements, strong verbs, impact-focused bullets.

**RESUME PDF**:
{{media url=resumeDataUri}}

**JOB DESCRIPTION**:
{{{jobDescription}}}

Rules:
- Output valid JSON only.
- Identify the top 3 'Critical Fixes' for the document quality.
- Ensure the breakdown matches the overall_score.
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
