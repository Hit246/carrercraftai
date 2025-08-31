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
      url: z.string().url().describe('A plausible but fictional URL to the job posting.'),
      matchScore: z.number().min(0).max(100).describe('A score (0-100) indicating how well the job matches the resume.'),
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
  prompt: `You are an AI career placement expert. Your task is to analyze the given resume and generate a list of 5 relevant, plausible, but fictional job opportunities.

Analyze this resume:
{{media url=resumeDataUri}}

Desired Job Title (if provided):
{{{desiredJobTitle}}}

Based on the resume's skills and experience, create 5 job suggestions. For each suggestion:
- **Title**: A realistic job title.
- **Company**: A fictional but plausible company name.
- **Description**: A brief, engaging job description (2-3 sentences).
- **URL**: A valid but fictional URL, like https://www.fictional-company.com/careers/job-title.
- **Match Score**: A score from 0 to 100 indicating how well the candidate's resume aligns with the fictional job.

Return the suggestions as a valid JSON object.
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
