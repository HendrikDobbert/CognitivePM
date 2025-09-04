'use server';
/**
 * @fileOverview A flow for predicting the risk of a task.
 *
 * - riskPrediction - A function that takes a task title and returns a risk assessment.
 * - RiskPredictionInput - The input type for the riskPrediction function.
 * - RiskPredictionOutput - The return type for the riskPrediction function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const RiskPredictionInputSchema = z.object({
  title: z.string().describe('The title of the task.'),
});
export type RiskPredictionInput = z.infer<typeof RiskPredictionInputSchema>;

const RiskPredictionOutputSchema = z.object({
  level: z.enum(['Low', 'Medium', 'High']).describe('The predicted risk level.'),
  details: z.string().describe('A brief explanation of the risk.'),
});
export type RiskPredictionOutput = z.infer<typeof RiskPredictionOutputSchema>;

export async function riskPrediction(input: RiskPredictionInput): Promise<RiskPredictionOutput> {
  return riskPredictionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'riskPredictionPrompt',
  input: { schema: RiskPredictionInputSchema },
  output: { schema: RiskPredictionOutputSchema },
  prompt: `You are an expert project manager. A user will provide a task title. Your job is to analyze the task and predict its potential risk.

Task Title: {{{title}}}

Predict the risk level (Low, Medium, High) and provide a brief explanation.`,
});

const riskPredictionFlow = ai.defineFlow(
  {
    name: 'riskPredictionFlow',
    inputSchema: RiskPredictionInputSchema,
    outputSchema: RiskPredictionOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
