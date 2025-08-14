'use server';

/**
 * @fileOverview Job matching AI agent.
 *
 * - jobMatcher - A function that suggests relevant job opportunities based on a resume.
 * - JobMatcherInput - The input type for the jobMatcher function.
 * - JobMatcherOutput - The return type for the jobMatcher function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const JobMatcherInputSchema = z.object({
  resumeDataUri: z
  .string()
  .describe(
    'A resume as a data URI that must include a MIME type and use Base64 encoding. Expected format: data:<mimetype>;base64,<encoded_data>.'
  ),
  desiredJobTitle: z.string().optional().describe('The user\'s desired job title, if any.'),
});
export type JobMatcherInput = z.infer<typeof JobMatcherInputSchema>;

const JobMatcherOutputSchema = z.object({
  jobSuggestions: z.array(
    z.object({
      title: z.string().describe('The title of the job.'),
      company: z.string().describe('The company offering the job.'),
      description: z.string().describe('A brief description of the job.'),
      url: z.string().url().describe('The URL to the job posting.'),
      matchScore: z.number().describe('A score indicating how well the job matches the resume.'),
    })
  ).describe('A list of job suggestions based on the resume.'),
});
export type JobMatcherOutput = z.infer<typeof JobMatcherOutputSchema>;

export async function jobMatcher(input: JobMatcherInput): Promise<JobMatcherOutput> {
  return jobMatcherFlow(input);
}

const prompt = ai.definePrompt({
  name: 'jobMatcherPrompt',
  input: {schema: JobMatcherInputSchema},
  output: {schema: JobMatcherOutputSchema},
  prompt: `You are an AI job matching expert. Given a resume and optionally a desired job title, you will suggest relevant job opportunities.

Resume:
{{media url=resumeDataUri}}

Desired Job Title (if any):
{{desiredJobTitle}}

Please suggest relevant job opportunities in JSON format. Include the job title, company, a brief description, the URL to the job posting, and a match score (0-1) indicating how well the job matches the resume.
`,
});

const jobMatcherFlow = ai.defineFlow(
  {
    name: 'jobMatcherFlow',
    inputSchema: JobMatcherInputSchema,
    outputSchema: JobMatcherOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
