'use server';
/**
 * @fileOverview A flow for extracting structured task data from a natural language prompt.
 *
 * - extractTaskDetails - A function that takes a user's prompt and returns a structured task object.
 * - ExtractTaskDetailsInput - The input type for the extractTaskDetails function.
 * - ExtractTaskDetailsOutput - The return type for the extractTaskDetails function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractTaskDetailsInputSchema = z.string();
export type ExtractTaskDetailsInput = z.infer<typeof ExtractTaskDetailsInputSchema>;

const ExtractTaskDetailsOutputSchema = z.object({
  title: z.string().describe('The concise title of the task.'),
  description: z.string().describe('A more detailed description of the task. If not provided, this can be the same as the title.'),
  dueDate: z.string().optional().describe('The due date in YYYY-MM-DD format. If no date is mentioned, this field should be omitted.'),
});
export type ExtractTaskDetailsOutput = z.infer<typeof ExtractTaskDetailsOutputSchema>;

export async function extractTaskDetails(input: ExtractTaskDetailsInput): Promise<ExtractTaskDetailsOutput> {
  return extractTaskDetailsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractTaskDetailsPrompt',
  input: {schema: ExtractTaskDetailsInputSchema},
  output: {schema: ExtractTaskDetailsOutputSchema},
  prompt: `You are an expert at parsing natural language and extracting structured data. A user will provide a prompt for a task. Your job is to extract the title, description, and due date.

Current Date: ${new Date().toISOString().split('T')[0]}

Prompt: {{{prompt}}}

Extract the structured data from the prompt. For the due date, interpret relative dates like "next Tuesday" based on the current date.`,
});

const extractTaskDetailsFlow = ai.defineFlow(
  {
    name: 'extractTaskDetailsFlow',
    inputSchema: ExtractTaskDetailsInputSchema,
    outputSchema: ExtractTaskDetailsOutputSchema,
  },
  async (promptText) => {
    const {output} = await prompt(promptText);
    return output!;
  }
);
