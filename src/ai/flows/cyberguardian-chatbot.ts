
'use server';

/**
 * @fileOverview An AI chatbot for answering cybersecurity-related questions.
 *
 * - askCybersecurityQuestion - A function that handles the cybersecurity question answering process.
 * - AskCybersecurityQuestionInput - The input type for the askCybersecurityQuestion function.
 * - AskCybersecurityQuestionOutput - The return type for the askCybersecurityQuestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AskCybersecurityQuestionInputSchema = z.object({
  question: z.string().describe('The cybersecurity-related question to ask.'),
  personality: z.enum(['Friendly', 'Formal', 'Technical']).optional().describe('The desired tone for the chatbot\'s response.'),
});
export type AskCybersecurityQuestionInput = z.infer<typeof AskCybersecurityQuestionInputSchema>;

const AskCybersecurityQuestionOutputSchema = z.object({
  answer: z.string().describe('The answer to the cybersecurity question.'),
});
export type AskCybersecurityQuestionOutput = z.infer<typeof AskCybersecurityQuestionOutputSchema>;

export async function askCybersecurityQuestion(
  input: AskCybersecurityQuestionInput
): Promise<AskCybersecurityQuestionOutput> {
  return askCybersecurityQuestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'askCybersecurityQuestionPrompt',
  input: {schema: AskCybersecurityQuestionInputSchema},
  output: {schema: AskCybersecurityQuestionOutputSchema},
  prompt: `You are a cybersecurity expert chatbot. Your primary goal is to answer questions concisely.

IMPORTANT: Your answers must be very short, ideally under 20 words. Be direct and to the point. Do not use analogies or long explanations unless specifically asked.

Your personality should be: {{#if personality}}{{{personality}}}{{else}}Friendly{{/if}}.

Here is the user's question:
Question: {{{question}}}`,
});

const askCybersecurityQuestionFlow = ai.defineFlow(
  {
    name: 'askCybersecurityQuestionFlow',
    inputSchema: AskCybersecurityQuestionInputSchema,
    outputSchema: AskCybersecurityQuestionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
