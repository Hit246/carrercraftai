'use server';

/**
 * @fileOverview An AI flow to suggest a name for a resume version.
 *
 * - suggestResumeVersionName - A function that suggests a name for a resume version.
 * - SuggestResumeVersionNameInput - The input type for the suggestResumeVersionName function.
 * - SuggestResumeVersionNameOutput - The return type for the suggestResumeVersionName function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestResumeVersionNameInputSchema = z.object({
  resumeData: z.any().describe('The JSON object of the resume data.'),
});
export type SuggestResumeVersionNameInput = z.infer<typeof SuggestResumeVersionNameInputSchema>;

const SuggestResumeVersionNameOutputSchema = z.object({
  versionName: z.string().describe('A short, descriptive name for the resume version (e.g., "React Developer Version" or "Resume for Google Application").'),
});
export type SuggestResumeVersionNameOutput = z.infer<typeof SuggestResumeVersionNameOutputSchema>;


export async function suggestResumeVersionName(input: SuggestResumeVersionNameInput): Promise<SuggestResumeVersionNameOutput> {
  return suggestResumeVersionNameFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestResumeVersionNamePrompt',
  input: {schema: SuggestResumeVersionNameInputSchema},
  output: {schema: SuggestResumeVersionNameOutputSchema},
  prompt: `Based on the following resume data, suggest a short, descriptive name for this version of the resume. The name should be concise and reflect the key role or technologies highlighted.

For example:
- If the title is "Senior React Developer", a good name would be "Senior React Developer Version".
- If it includes many projects with Python, a good name would be "Python-Focused Resume".

Resume Data:
{{{json resumeData}}}

Generate a single, appropriate name.
`,
});

const suggestResumeVersionNameFlow = ai.defineFlow(
  {
    name: 'suggestResumeVersionNameFlow',
    inputSchema: SuggestResumeVersionNameInputSchema,
    outputSchema: SuggestResumeVersionNameOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
