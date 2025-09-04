'use server';
/**
 * @fileOverview A flow for breaking down a high-level goal into a list of tasks.
 *
 * - smartTask - A function that takes a user's goal and returns a list of tasks.
 * - SmartTaskInput - The input type for the smartTask function.
 * - SmartTaskOutput - The return type for the smartTask function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SmartTaskInputSchema = z.string();
export type SmartTaskInput = z.infer<typeof SmartTaskInputSchema>;

const SmartTaskOutputSchema = z.object({
  tasks: z.array(z.string()).describe('The list of generated task descriptions.'),
});
export type SmartTaskOutput = z.infer<typeof SmartTaskOutputSchema>;

export async function smartTask(input: SmartTaskInput): Promise<SmartTaskOutput> {
  return smartTaskFlow(input);
}

const prompt = ai.definePrompt({
  name: 'smartTaskPrompt',
  input: {schema: SmartTaskInputSchema},
  output: {schema: SmartTaskOutputSchema},
  prompt: `You are an expert project manager. A user will provide a high-level goal. Your job is to break it down into a list of smaller, actionable tasks.

Goal: {{{prompt}}}

Generate a list of tasks to achieve this goal.`,
});

const smartTaskFlow = ai.defineFlow(
  {
    name: 'smartTaskFlow',
    inputSchema: SmartTaskInputSchema,
    outputSchema: SmartTaskOutputSchema,
  },
  async (promptText) => {
    const {output} = await prompt(promptText);
    return output!;
  }
);
