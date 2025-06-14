// src/ai/flows/medical-faq.ts
'use server';
/**
 * @fileOverview A medical FAQ AI agent.
 *
 * - answerMedicalQuestion - A function that answers medical questions.
 * - AnswerMedicalQuestionInput - The input type for the answerMedicalQuestion function.
 * - AnswerMedicalQuestionOutput - The return type for the answerMedicalQuestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnswerMedicalQuestionInputSchema = z.object({
  question: z.string().describe('The medical question to be answered.'),
});
export type AnswerMedicalQuestionInput = z.infer<typeof AnswerMedicalQuestionInputSchema>;

const AnswerMedicalQuestionOutputSchema = z.object({
  answer: z.string().describe('The answer to the medical question.'),
});
export type AnswerMedicalQuestionOutput = z.infer<typeof AnswerMedicalQuestionOutputSchema>;

export async function answerMedicalQuestion(input: AnswerMedicalQuestionInput): Promise<AnswerMedicalQuestionOutput> {
  return answerMedicalQuestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'answerMedicalQuestionPrompt',
  input: {schema: AnswerMedicalQuestionInputSchema},
  output: {schema: AnswerMedicalQuestionOutputSchema},
  prompt: `You are a medical expert providing information from a comprehensive FAQ.
  Answer the following medical question accurately and concisely.

  Question: {{{question}}}`,
});

const answerMedicalQuestionFlow = ai.defineFlow(
  {
    name: 'answerMedicalQuestionFlow',
    inputSchema: AnswerMedicalQuestionInputSchema,
    outputSchema: AnswerMedicalQuestionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
