
'use server';
/**
 * @fileOverview Generates a personalized cybersecurity quiz using AI.
 *
 * - generateQuiz - A function that creates a quiz based on user skill and preferences.
 * - GenerateQuizInput - The input type for the function.
 * - GenerateQuizOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const QuestionSchema = z.object({
    text: z.string().describe("The question text."),
    options: z.array(z.string()).min(2).max(4).describe("An array of 2 to 4 possible answers."),
    correctAnswer: z.string().describe("The correct answer from the options array."),
    difficulty: z.enum(['Easy', 'Medium', 'Hard', 'Very Hard']).describe("The difficulty of the question.")
});

const GenerateQuizInputSchema = z.object({
  topic: z.string().describe('The cybersecurity topic for the quiz.'),
  difficulty: z.enum(['Easy', 'Medium', 'Hard', 'Very Hard']).describe('The desired base difficulty level for the quiz.'),
  userSkillLevel: z.enum(['Beginner', 'Intermediate', 'Advanced', 'Expert']).describe("The user's self-assessed skill level."),
  performanceHistory: z
    .array(
      z.object({
        score: z.number(),
        total: z.number(),
      })
    )
    .optional()
    .describe('The user\'s recent performance (score/total) on this topic.'),
});
export type GenerateQuizInput = z.infer<typeof GenerateQuizInputSchema>;

const GenerateQuizOutputSchema = z.object({
  title: z.string().describe('A creative and relevant title for the generated quiz.'),
  questions: z.array(QuestionSchema).min(5).max(5).describe('An array of exactly 5 quiz questions.'),
});
export type GenerateQuizOutput = z.infer<typeof GenerateQuizOutputSchema>;

export async function generateQuiz(
  input: GenerateQuizInput
): Promise<GenerateQuizOutput> {
  return generateQuizFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateQuizPrompt',
  input: {schema: GenerateQuizInputSchema},
  output: {schema: GenerateQuizOutputSchema},
  prompt: `You are an expert cybersecurity educator. Your task is to generate a personalized, high-quality 5-question multiple-choice quiz.

IMPORTANT: Ensure the generated quiz is unique every time. Do NOT repeat questions, even for the same user and topic. Be creative.

The user's profile:
- Self-assessed skill level: {{{userSkillLevel}}}
- Selected Topic: {{{topic}}}
- Desired Difficulty: {{{difficulty}}}

The user's recent performance on this topic (score / total questions):
{{#if performanceHistory}}
  {{#each performanceHistory}}
  - {{{this.score}}}/{{{this.total}}}
  {{/each}}
{{else}}
- No history for this topic yet.
{{/if}}

INSTRUCTIONS:

1.  **Analyze Performance**: Review the user's history.
    - If they consistently score high (e.g., >80%), increase the actual difficulty of the questions by one level above their requested '{{{difficulty}}}'. For example, if they ask for 'Medium' but score well, generate 'Hard' questions.
    - If they consistently score low (e.g., <50%), decrease the actual difficulty by one level. If they ask for 'Hard', generate 'Medium' questions.
    - Otherwise, stick to the requested difficulty.

2.  **Align with Skill Level**: Adjust the tone and complexity based on their '{{{userSkillLevel}}}'.
    - For 'Beginner', use simple language and clear scenarios.
    - For 'Expert', feel free to use technical jargon and complex, multi-step scenarios.

3.  **Generate 5 Questions**: Create exactly five unique multiple-choice questions.
    - Each question must have 2 to 4 options.
    - Ensure one option is unambiguously the correct answer.
    - The 'correctAnswer' field MUST exactly match one of the strings in the 'options' array.
    - Vary the question formats (e.g., scenario-based, definition-based).

4.  **Create a Title**: Come up with a creative, engaging title for the quiz that reflects the topic and difficulty.

Generate the quiz now based on these instructions.`,
});

const generateQuizFlow = ai.defineFlow(
  {
    name: 'generateQuizFlow',
    inputSchema: GenerateQuizInputSchema,
    outputSchema: GenerateQuizOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('Failed to generate quiz from AI model.');
    }
    // Basic validation to ensure the AI followed instructions
    if (output.questions.length !== 5) {
        throw new Error(`AI generated ${output.questions.length} questions instead of 5.`);
    }
    for(const q of output.questions) {
        if (!q.options.includes(q.correctAnswer)) {
            throw new Error(`AI generated an invalid question. The correct answer "${q.correctAnswer}" is not in the options array: ${JSON.stringify(q.options)}`);
        }
    }
    return output;
  }
);
