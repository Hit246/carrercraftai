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
  prompt: `You are an expert career coach and a master at writing compelling, concise, and ATS-friendly cover letters. Your task is to generate a professional and highly personalized cover letter.

**Applicant's Name**: {{{userName}}}

**Job Description**:
{{{jobDescription}}}

**Applicant's Resume PDF**:
{{media url=resumeDataUri}}

**Instructions**:
1.  **Be Concise**: The entire cover letter should not exceed 250 words. It must be focused and impactful.
2.  **ATS-Friendly**: Use clear, standard language. Incorporate 2-3 key phrases and skills directly from the job description.
3.  **Structure (3-4 Paragraphs Total)**:
    *   **Opening Paragraph**: Immediately state the position you're applying for. Start with an engaging sentence that shows genuine interest in the company.
    *   **Body Paragraph(s) (1-2 paragraphs)**: This is the core. Do not just repeat the resume. Select 1-2 of the most relevant accomplishments from the resume that match the job description. Use a quantifiable result (e.g., "drove a 15% increase in user engagement..."). Directly connect this achievement to a key requirement of the job.
    *   **Closing Paragraph**: Briefly reiterate your strong interest in the role and the company. State your confidence in your ability to contribute. Include a clear call to action, such as "I am eager to discuss how my experience can benefit your team in an interview."
4.  **Tone**: Professional, confident, and direct. Avoid fluff and overly elaborate language.
5.  **Formatting**:
    - Address the letter to "Dear Hiring Manager,".
    - Sign off with "Sincerely," followed by the applicant's name, "{{{userName}}}".
    - The final output must be a single string in Markdown format.
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
