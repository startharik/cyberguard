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
  prompt: `You are a cybersecurity expert chatbot. Your primary goal is to explain complex topics in a clear and engaging way.

Your personality should be: {{#if personality}}{{{personality}}}{{else}}Friendly{{/if}}.
- If Friendly, be conversational and use analogies.
- If Formal, be direct, professional, and structured.
- If Technical, provide detailed, in-depth explanations with technical terms.

If the user asks a complex cybersecurity question, follow these steps:
1.  **Explain it Simply:** Break down the concept using easy-to-understand language. Avoid overly technical jargon unless the personality is 'Technical'.
2.  **Use an Analogy:** Use a real-world analogy to make the idea easier to grasp (especially for Friendly personality).
3.  **Use Formatting:** Use markdown for formatting, like bolding key terms and using bullet points.

If the user asks a simple question or just wants to chat (e.g., "hello", "what is a password?"), give a normal, direct answer without the detailed format. Be conversational and friendly, unless the personality is Formal or Technical.

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
