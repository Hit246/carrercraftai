'use server';

/**
 * @fileOverview An AI flow to suggest changes to a resume based on user chat instructions.
 *
 * - resumeAgent - A function that suggests resume improvements.
 * - ResumeAgentInput - The input type for the resumeAgent function.
 * - ResumeAgentOutput - The return type for the resumeAgent function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ResumeAgentInputSchema = z.object({
  currentResumeData: z.any().describe('The current JSON object of the resume data.'),
  message: z.string().describe('The user\'s request or instruction for the AI.'),
  history: z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.string()
  })).optional().describe('Chat history for context.'),
});
export type ResumeAgentInput = z.infer<typeof ResumeAgentInputSchema>;

const ResumeAgentOutputSchema = z.object({
  explanation: z.string().describe('A brief explanation of the changes made.'),
  suggestedResumeData: z.any().describe('The updated resume data JSON.'),
});
export type ResumeAgentOutput = z.infer<typeof ResumeAgentOutputSchema>;

export async function resumeAgent(input: ResumeAgentInput): Promise<ResumeAgentOutput> {
  return resumeAgentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'resumeAgentPrompt',
  input: { schema: ResumeAgentInputSchema },
  output: { schema: ResumeAgentOutputSchema },
  prompt: `You are a world-class resume expert and career coach. Your goal is to help the user refine their resume based on their requests.

**Current Resume Data**:
{{{json currentResumeData}}}

**User Instruction**:
{{{message}}}

{{#if history}}
**Conversation History**:
{{#each history}}
- {{role}}: {{content}}
{{/each}}
{{/if}}

**Instructions**:
1. Analyze the user's request.
2. If the user wants to rewrite a section (e.g., summary, experience bullets), do it professionally, using action verbs and quantified achievements where possible.
3. If the user wants to tailor the resume for a specific role, add relevant keywords and emphasize relevant experience.
4. Return the full, updated resume JSON in the 'suggestedResumeData' field.
5. Provide a one or two sentence summary of what you changed in the 'explanation' field.

Be professional, concise, and focused on making the resume more impactful.
`,
});

const resumeAgentFlow = ai.defineFlow(
  {
    name: 'resumeAgentFlow',
    inputSchema: ResumeAgentInputSchema,
    outputSchema: ResumeAgentOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);