'use server';
/**
 * @fileOverview A duration estimation AI agent.
 *
 * - estimateDuration - A function that estimates the duration of a task or step.
 * - EstimateDurationInput - The input type for the estimateDuration function.
 * - EstimateDurationOutput - The return type for the estimateDuration function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EstimateDurationInputSchema = z.object({
  taskDescription: z
    .string()
    .describe('The description of the task or step for which to estimate the duration.'),
});
export type EstimateDurationInput = z.infer<typeof EstimateDurationInputSchema>;

const EstimateDurationOutputSchema = z.object({
  durationEstimate: z
    .string()
    .describe('The estimated duration of the task or step, including units.'),
  reasoning: z
    .string()
    .describe('The reasoning behind the duration estimate.'),
});
export type EstimateDurationOutput = z.infer<typeof EstimateDurationOutputSchema>;

export async function estimateDuration(input: EstimateDurationInput): Promise<EstimateDurationOutput> {
  return estimateDurationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'estimateDurationPrompt',
  input: {schema: EstimateDurationInputSchema},
  output: {schema: EstimateDurationOutputSchema},
  prompt: `You are an expert project manager with extensive experience in house building.

You will be given a description of a task or step in a house building project, and you will estimate the duration of the task or step.

You must provide a durationEstimate, including units (e.g. "3 days", "2 weeks", "1 month").
You must also provide a reasoning for your estimate.

Task Description: {{{taskDescription}}}`,
});

const estimateDurationFlow = ai.defineFlow(
  {
    name: 'estimateDurationFlow',
    inputSchema: EstimateDurationInputSchema,
    outputSchema: EstimateDurationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
