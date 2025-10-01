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
  prompt: `You are an expert career coach and a master at writing compelling cover letters. Your task is to generate a professional and highly personalized cover letter that makes the applicant stand out.

**Applicant's Name**: {{{userName}}}

**Job Description**:
{{{jobDescription}}}

**Applicant's Resume PDF**:
{{media url=resumeDataUri}}

**Instructions**:
1.  **Opening Paragraph**: Start with an engaging opening that grabs the reader's attention. Mention the specific job title and where it was seen.
2.  **Body Paragraphs (2-3 paragraphs)**: This is the most critical part. Do not just list skills. Instead, create a narrative. Select 2-3 key experiences or projects from the resume and connect them directly to the most important requirements in the job description. For each, explain *how* the applicant's past achievements will translate to success in the new role. Use quantifiable results from the resume where possible (e.g., "increased efficiency by 30%").
3.  **Closing Paragraph**: Reiterate enthusiasm for the role and the company. Briefly mention how the applicant's values align with the company's mission if possible. Include a strong call to action, expressing eagerness for an interview.
4.  **Tone**: The tone must be professional, confident, and genuinely enthusiastic. Avoid overly formal or generic language.
5.  **Formatting**: 
    - Address the letter to "Dear Hiring Manager,".
    - Sign off with "Sincerely," followed by the applicant's name, "{{{userName}}}".
    - The final output must be a single string in Markdown format, with proper paragraph breaks.
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
