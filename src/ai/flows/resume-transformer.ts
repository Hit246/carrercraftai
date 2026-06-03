'use server';

/**
 * @fileOverview AI Resume Transformer agent.
 *
 * - transformResume - A function that optimizes a resume based on a reference and target role.
 * - ResumeTransformerInput - Input schema for current resume, reference resume, and target role.
 * - ResumeTransformerOutput - Output schema containing the transformed JSON data and analysis.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ResumeTransformerInputSchema = z.object({
  currentResumeUri: z
    .string()
    .describe(
      "The user's current resume as a PDF data URI (base64)."
    ),
  referenceResumeUri: z
    .string()
    .describe(
      "A reference resume as a PDF data URI (base64) to use as a style/quality benchmark."
    ),
  targetRole: z.string().describe('The job role the user is targeting.'),
});
export type ResumeTransformerInput = z.infer<typeof ResumeTransformerInputSchema>;

const ResumeTransformerOutputSchema = z.object({
  transformedData: z.object({
    name: z.string(),
    title: z.string(),
    phone: z.string(),
    email: z.string(),
    linkedin: z.string(),
    summary: z.string(),
    experience: z.array(z.object({
        id: z.number(),
        title: z.string(),
        company: z.string(),
        dates: z.string(),
        description: z.string(),
    })),
    education: z.array(z.object({
        id: z.number(),
        school: z.string(),
        degree: z.string(),
        dates: z.string(),
        cgpa: z.string().optional(),
    })),
    skills: z.string(),
    projects: z.array(z.object({
        id: z.number(),
        name: z.string(),
        description: z.string(),
        url: z.string(),
        technologies: z.string(),
    })),
    template: z.enum(['classic', 'modern', 'minimalist']),
  }),
  analysis: z.object({
    initialAtsScore: z.number().int().min(0).max(100),
    finalAtsScore: z.number().int().min(0).max(100),
    changesMade: z.array(z.string()).describe("List of specific improvements made to the content."),
    missingSkills: z.array(z.string()).describe("Skills present in reference/role standards but missing from user data."),
    suggestedCertifications: z.array(z.string()).describe("Relevant certifications for the target role."),
  })
});
export type ResumeTransformerOutput = z.infer<typeof ResumeTransformerOutputSchema>;

export async function transformResume(input: ResumeTransformerInput): Promise<ResumeTransformerOutput> {
  return transformResumeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'transformResumePrompt',
  input: {schema: ResumeTransformerInputSchema},
  output: {schema: ResumeTransformerOutputSchema},
  config: {
    temperature: 0.1,
  },
  prompt: `You are an elite career strategist and ATS optimization expert. Your task is to transform the user's "Current Resume" into a world-class document tailored for a "{{targetRole}}" position, using the "Reference Resume" as a benchmark for professional style, impact, and formatting quality.

**RESOURCES**:
- Current Resume: {{media url=currentResumeUri}}
- Reference Resume: {{media url=referenceResumeUri}}
- Target Role: {{targetRole}}

**GOALS**:
1. **Fact-Based Transformation**: NEVER hallucinate experience. Preserve the user's actual history, but rewrite it for maximum impact.
2. **Style Transfer**: Mimic the sophisticated wording, achievement-oriented bullets (metrics/numbers), and structural flow of the Reference Resume.
3. **Keyword Optimization**: Infuse the resume with high-relevance keywords for a {{targetRole}} to pass ATS filters.
4. **Summary & Skills**: Craft a compelling 3-4 line summary and a targeted skill block.

**RULES**:
- Assign new IDs (numbers) to experience/education/projects.
- Identify at least 5 significant "Changes Made".
- Calculate a plausible "Initial ATS Score" (before) and "Final ATS Score" (after).
- If the Reference Resume uses a specific template style (Classic/Modern/Minimalist), select the closest match.

Output a valid JSON object matching the ResumeTransformerOutputSchema.`,
});

const transformResumeFlow = ai.defineFlow(
  {
    name: 'transformResumeFlow',
    inputSchema: ResumeTransformerInputSchema,
    outputSchema: ResumeTransformerOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) throw new Error("AI failed to transform the resume. Please ensure both files are valid PDFs.");
    return output;
  }
);
