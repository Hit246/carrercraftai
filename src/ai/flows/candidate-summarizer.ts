'use server';

/**
 * @fileOverview Candidate Summarizer AI agent.
 *
 * - summarizeCandidate - A function that generates a short summary of a candidate's resume.
 * - SummarizeCandidateInput - The input type for the summarizeCandidate function.
 * - SummarizeCandidateOutput - The return type for the summarizeCandidate function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeCandidateInputSchema = z.object({
  resumeDataUri: z
    .string()
    .describe(
      'A resume as a data URI that must include a MIME type and use Base64 encoding. Expected format: data:<mimetype>;base64,<encoded_data>.'
    ),
});
export type SummarizeCandidateInput = z.infer<typeof SummarizeCandidateInputSchema>;

const SummarizeCandidateOutputSchema = z.object({
  summary: z.string().describe('A concise, 3-sentence summary of the candidate covering key skills, achievements, and potential concerns.'),
});
export type SummarizeCandidateOutput = z.infer<typeof SummarizeCandidateOutputSchema>;

export async function summarizeCandidate(input: SummarizeCandidateInput): Promise<SummarizeCandidateOutput> {
  return summarizeCandidateFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeCandidatePrompt',
  input: {schema: SummarizeCandidateInputSchema},
  output: {schema: SummarizeCandidateOutputSchema},
  prompt: `You are an expert recruiter with a talent for summarizing candidate profiles quickly. Analyze the following resume.

**Resume**:
{{media url=resumeDataUri}}

**Instructions**:
Generate a concise, 3-sentence summary of the candidate.
- The first sentence should highlight their key skills and experience level.
- The second sentence should mention their most impressive achievement.
- The third sentence should note any potential concerns or areas that might require further questions (e.g., career gaps, lack of specific qualifications mentioned in a typical job description for their role).

The summary must be exactly three sentences.
`,
});

const summarizeCandidateFlow = ai.defineFlow(
  {
    name: 'summarizeCandidateFlow',
    inputSchema: SummarizeCandidateInputSchema,
    outputSchema: SummarizeCandidateOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
