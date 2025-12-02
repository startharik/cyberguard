'use server';

/**
 * @fileOverview Generates personalized feedback for a user after a quiz.
 *
 * - generateQuizFeedback - A function that provides feedback based on score and quiz topic.
 * - GenerateQuizFeedbackInput - The input type for the function.
 * - GenerateQuizFeedbackOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateQuizFeedbackInputSchema = z.object({
  quizTitle: z.string().describe('The title of the quiz the user just took.'),
  score: z.number().describe('The number of questions the user answered correctly.'),
  totalQuestions: z.number().describe('The total number of questions in the quiz.'),
});
export type GenerateQuizFeedbackInput = z.infer<typeof GenerateQuizFeedbackInputSchema>;

const GenerateQuizFeedbackOutputSchema = z.object({
  feedback: z.string().describe('A short, personalized feedback message for the user.'),
});
export type GenerateQuizFeedbackOutput = z.infer<typeof GenerateQuizFeedbackOutputSchema>;

export async function generateQuizFeedback(
  input: GenerateQuizFeedbackInput
): Promise<GenerateQuizFeedbackOutput> {
  return generateQuizFeedbackFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateQuizFeedbackPrompt',
  input: {schema: GenerateQuizFeedbackInputSchema},
  output: {schema: GenerateQuizFeedbackOutputSchema},
  prompt: `You are a friendly and encouraging cybersecurity tutor. A user has just completed a quiz, and you need to provide a short, personalized feedback message (1-2 sentences).

The user's performance:
- Quiz Title: {{{quizTitle}}}
- Score: {{{score}}} out of {{{totalQuestions}}}

Analyze the score:
- If the score is high (e.g., 80% or more), praise them and reinforce their knowledge on the topic.
- If the score is mid-range, acknowledge their effort and suggest they review the missed questions to solidify their understanding.
- If the score is low, be encouraging, not critical. Suggest they retry the quiz after reviewing some basics or talking to the AI chatbot about the topic.

Based on the quiz title, infer the topic. Tailor the feedback to that topic. For example, if the quiz is about "Phishing," your feedback should mention phishing.

Generate a feedback message.
`,
});

const generateQuizFeedbackFlow = ai.defineFlow(
  {
    name: 'generateQuizFeedbackFlow',
    inputSchema: GenerateQuizFeedbackInputSchema,
    outputSchema: GenerateQuizFeedbackOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
