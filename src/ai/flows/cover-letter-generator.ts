'use server';

/**
 * @fileOverview Cover letter generation AI agent.
 *
 * - generateCoverLetter - A function that generates a cover letter based on a resume and job description.
 * - GenerateCoverLetterInput - The input type for the generateCoverLetter function.
 * - GenerateCoverLetterOutput - The return type for the generateCoverLetter function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateCoverLetterInputSchema = z.object({
  resumeDataUri: z
  .string()
  .describe(
    'A resume as a data URI that must include a MIME type and use Base64 encoding. Expected format: data:<mimetype>;base64,<encoded_data>.'
  ),
  jobDescription: z.string().describe('The job description for which to generate the cover letter.'),
  userName: z.string().describe('The name of the user applying for the job.'),
});
export type GenerateCoverLetterInput = z.infer<typeof GenerateCoverLetterInputSchema>;

const GenerateCoverLetterOutputSchema = z.object({
  coverLetter: z.string().describe('The generated cover letter in Markdown format.'),
});
export type GenerateCoverLetterOutput = z.infer<typeof GenerateCoverLetterOutputSchema>;

export async function generateCoverLetter(input: GenerateCoverLetterInput): Promise<GenerateCoverLetterOutput> {
  return generateCoverLetterFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateCoverLetterPrompt',
  input: {schema: GenerateCoverLetterInputSchema},
  output: {schema: GenerateCoverLetterOutputSchema},
  prompt: `You are a professional career coach and expert cover letter writer. Your task is to generate a compelling and personalized cover letter for a job application.

You will be provided with the applicant's resume, the job description, and the applicant's name.

- The cover letter should be tailored to the specific job description, highlighting the applicant's most relevant skills and experiences from their resume.
- It should have a professional tone and structure.
- Address the cover letter to the "Hiring Manager" if no specific name is available.
- The applicant's name is {{{userName}}}. Ensure the letter is signed off with their name.
- The output should be a single string in Markdown format.

Applicant's Resume:
{{media url=resumeDataUri}}

Job Description:
{{{jobDescription}}}
`,
});

const generateCoverLetterFlow = ai.defineFlow(
  {
    name: 'generateCoverLetterFlow',
    inputSchema: GenerateCoverLetterInputSchema,
    outputSchema: GenerateCoverLetterOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
