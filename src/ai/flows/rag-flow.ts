'use server';
/**
 * @fileOverview A flow for answering questions about projects using RAG.
 *
 * - ragQuery - A function that takes a user's question and returns an answer.
 * - RagQueryInput - The input type for the ragQuery function.
 * - RagQueryOutput - The return type for the ragQuery function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// In a real application, this context would be dynamically retrieved
// from a vector database (like Vertex AI Vector Search) based on the query.
const PROJECT_CONTEXT = `
- Project Alpha: A mobile app development project. Currently in the 'In Progress' state. Key tasks include designing homepage mockups (completed), developing the authentication API (completed), integrating a payment gateway (in progress), and setting up a deployment pipeline (in progress). The project is projected to be 20% over budget. The timeline is at risk due to a critical path dependency.

- Project Phoenix: A website redesign. Currently 'On Hold'. The last update was the successful deployment of v1.2 to staging, which received positive user feedback. The next focus was planned to be performance optimization.

- Project Neptune: A data analytics platform. This project is 'Completed'.

- General Information: The team's velocity is currently stable, and there are no immediate signs of resource burnout.
`;

const RagQueryInputSchema = z.string();
export type RagQueryInput = z.infer<typeof RagQueryInputSchema>;

const RagQueryOutputSchema = z.string();
export type RagQueryOutput = z.infer<typeof RagQueryOutputSchema>;

export async function ragQuery(input: RagQueryInput): Promise<RagQueryOutput> {
  return ragFlow(input);
}

const prompt = ai.definePrompt({
  name: 'ragPrompt',
  input: { schema: RagQueryInputSchema },
  output: { schema: RagQueryOutputSchema },
  prompt: `You are an expert project management assistant, 'CognitivePM'. Your role is to answer questions based on the provided context about various projects. Be concise and helpful.

Context:
${PROJECT_CONTEXT}

Question:
{{{prompt}}}

Answer:`,
});

const ragFlow = ai.defineFlow(
  {
    name: 'ragFlow',
    inputSchema: RagQueryInputSchema,
    outputSchema: RagQueryOutputSchema,
  },
  async (promptText) => {
    const { output } = await prompt(promptText);
    return output!;
  }
);
