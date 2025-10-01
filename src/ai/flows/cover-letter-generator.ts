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
    'A PDF of a resume as a data URI that must include a MIME type and use Base64 encoding. Expected format: data:application/pdf;base64,<encoded_data>.'
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
  prompt: `You are a professional career coach and expert cover letter writer. Your task is to generate a compelling and personalized cover letter for a job application. The tone should be professional, confident, and enthusiastic.

You will be provided with the applicant's resume, the job description, and the applicant's name.

**Applicant's Name**: {{{userName}}}

**Job Description**:
{{{jobDescription}}}

**Applicant's Resume PDF**:
{{media url=resumeDataUri}}

**Instructions**:
1.  **Structure**: The cover letter must have a clear introduction, body, and conclusion.
2.  **Personalization**: Directly address the requirements in the job description. In the body paragraphs, highlight 2-3 key skills or experiences from the resume that are most relevant to the job.
3.  **Tone**: Maintain a professional and confident tone.
4.  **Formatting**: Address the letter to the "Hiring Manager". Sign off with the applicant's name, "{{{userName}}}". The output must be a single string in Markdown format.
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
