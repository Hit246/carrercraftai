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
  strengths: z.string().describe('The specific strengths of the resume, citing examples from the document.'),
  weaknesses: z.string().describe('The specific weaknesses of the resume, citing examples and explaining why they are weak.'),
  suggestions: z.string().describe('Actionable suggestions for improving the resume, tied directly to the identified weaknesses.'),
});
export type AnalyzeResumeOutput = z.infer<typeof AnalyzeResumeOutputSchema>;

export async function analyzeResume(input: AnalyzeResumeInput): Promise<AnalyzeResumeOutput> {
  return analyzeResumeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeResumePrompt',
  input: {schema: AnalyzeResumeInputSchema},
  output: {schema: AnalyzeResumeOutputSchema},
  prompt: `You are an expert career coach and resume critic. You will analyze the provided resume in detail and provide constructive, specific, and actionable feedback.

  Analyze the following resume:
  {{media url=resumeDataUri}}

  Provide feedback with the following structure:
  - Strengths: What does the resume do well? Be specific and reference parts of the resume.
  - Weaknesses: What are the weak points? Where can it be improved? Be specific and reference the parts of the resume that are weak.
  - Suggestions: Provide concrete suggestions for improvement for each of the identified weaknesses.
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
