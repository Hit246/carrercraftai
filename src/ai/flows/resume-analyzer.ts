'use server';

/**
 * @fileOverview Resume analysis AI agent.
 *
 * - analyzeResume - A function that handles the resume analysis process.
 * - AnalyzeResumeInput - The input type for the analyzeResume function.
 * - AnalyzeResumeOutput - The return type for the analyzeResume function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeResumeInputSchema = z.object({
  resumeDataUri: z
    .string()
    .describe(
      'A resume as a data URI that must include a MIME type and use Base64 encoding. Expected format: data:<mimetype>;base64,<encoded_data>.'
    ),
});
export type AnalyzeResumeInput = z.infer<typeof AnalyzeResumeInputSchema>;

const AnalyzeResumeOutputSchema = z.object({
  strengths: z.array(z.string()).describe('A list of specific strengths of the resume, citing examples from the document.'),
  weaknesses: z.array(z.string()).describe('A list of specific weaknesses of the resume, citing examples and explaining why they are weak.'),
  suggestions: z.array(z.string()).describe('A list of actionable suggestions for improving the resume, tied directly to the identified weaknesses.'),
});
export type AnalyzeResumeOutput = z.infer<typeof AnalyzeResumeOutputSchema>;

export async function analyzeResume(input: AnalyzeResumeInput): Promise<AnalyzeResumeOutput> {
  return analyzeResumeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeResumePrompt',
  input: {schema: AnalyzeResumeInputSchema},
  output: {schema: AnalyzeResumeOutputSchema},
  prompt: `You are a world-class career coach and expert resume critic. Your task is to provide a detailed, constructive, and highly specific analysis of the provided resume.

Analyze the following resume for clarity, impact, and keyword optimization:
{{media url=resumeDataUri}}

Provide your feedback using the following strict structure, with each section containing a list of bullet points:
- **Strengths**: Identify what the resume does exceptionally well. Be specific. For example, mention strong action verbs, quantifiable achievements, or a clear layout.
- **Weaknesses**: Pinpoint the weak areas. Is the summary generic? Are the bullet points just a list of duties instead of accomplishments? Is the formatting inconsistent? Be specific and reference the parts of the resume that are weak.
- **Suggestions for Improvement**: For each weakness identified, provide a concrete, actionable suggestion. For example, instead of saying "Improve bullet points," suggest rephrasing a specific bullet point to include a quantifiable result.
`,
});

const analyzeResumeFlow = ai.defineFlow(
  {
    name: 'analyzeResumeFlow',
    inputSchema: AnalyzeResumeInputSchema,
    outputSchema: AnalyzeResumeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
