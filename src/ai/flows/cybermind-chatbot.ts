// 'use server'
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
  prompt: `You are a cybersecurity expert chatbot. A user will ask a question about cybersecurity, and you will provide an accurate and helpful answer.\n\nQuestion: {{{question}}}`,
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
