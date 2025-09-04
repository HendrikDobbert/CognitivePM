'use server';
import { ai } from '@/ai/genkit';
import { z } from 'zod';

// Define the schema for a single task
const TaskSchema = z.object({
  text: z.string(),
  completed: z.boolean(),
});

// Define the input schema for the summarization flow
export const SummarizationInputSchema = z.array(TaskSchema);
export type SummarizationInput = z.infer<typeof SummarizationInputSchema>;

// Define the output schema for the summarization flow
export const SummarizationOutputSchema = z.object({
  summary: z.string().describe('The concise summary of the project status.'),
});
export type SummarizationOutput = z.infer<typeof SummarizationOutputSchema>;

// Define the prompt for the summarization flow
const summarizationPrompt = ai.definePrompt({
  name: 'summarizationPrompt',
  input: { schema: SummarizationInputSchema },
  output: { schema: SummarizationOutputSchema },
  prompt: `You are an expert project manager. A list of tasks for a project will be provided. Your job is to generate a brief, concise summary of the project's status.

- Briefly mention what has been completed.
- Highlight what tasks are still pending.
- If there are no tasks, state that the project has no tasks defined yet.

Tasks:
{{#each prompt}}
- {{this.text}} (Status: {{#if this.completed}}Done{{else}}To-Do{{/if}})
{{/each}}

Generate a summary of the project status.`,
});

// Define the summarization flow
export const summarizationFlow = ai.defineFlow(
  {
    name: 'summarizationFlow',
    inputSchema: SummarizationInputSchema,
    outputSchema: SummarizationOutputSchema,
  },
  async (tasks) => {
    if (tasks.length === 0) {
        return { summary: "This project has no tasks defined yet." };
    }

    const { output } = await summarizationPrompt(tasks);
    return output!;
  }
);

// Helper function to be called from server-side code
export async function summarize(input: SummarizationInput): Promise<SummarizationOutput> {
    return summarizationFlow(input);
}
