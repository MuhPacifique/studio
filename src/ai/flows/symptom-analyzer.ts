'use server';

/**
 * @fileOverview AI-powered symptom analysis flow.
 *
 * - analyzeSymptoms - A function that analyzes user-provided symptoms and suggests possible conditions or next steps.
 * - SymptomAnalyzerInput - The input type for the analyzeSymptoms function, including a description of symptoms.
 * - SymptomAnalyzerOutput - The return type for the analyzeSymptoms function, providing a list of potential conditions and next steps.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SymptomAnalyzerInputSchema = z.object({
  symptomsDescription: z
    .string()
    .describe('A detailed description of the symptoms experienced by the user.'),
});
export type SymptomAnalyzerInput = z.infer<typeof SymptomAnalyzerInputSchema>;

const SymptomAnalyzerOutputSchema = z.object({
  potentialConditions: z
    .array(z.string())
    .describe('A list of potential medical conditions that may be causing the symptoms.'),
  nextSteps: z
    .string()
    .describe(
      'Recommended next steps, such as seeking professional medical advice or trying specific remedies.'
    ),
});
export type SymptomAnalyzerOutput = z.infer<typeof SymptomAnalyzerOutputSchema>;

export async function analyzeSymptoms(input: SymptomAnalyzerInput): Promise<SymptomAnalyzerOutput> {
  return symptomAnalyzerFlow(input);
}

const symptomAnalyzerPrompt = ai.definePrompt({
  name: 'symptomAnalyzerPrompt',
  input: {schema: SymptomAnalyzerInputSchema},
  output: {schema: SymptomAnalyzerOutputSchema},
  prompt: `You are a medical reference manual. A user will describe their symptoms, and you will provide a list of potential conditions and next steps.

Symptoms: {{{symptomsDescription}}}

Respond in markdown format.
`,
});

const symptomAnalyzerFlow = ai.defineFlow(
  {
    name: 'symptomAnalyzerFlow',
    inputSchema: SymptomAnalyzerInputSchema,
    outputSchema: SymptomAnalyzerOutputSchema,
  },
  async input => {
    const {output} = await symptomAnalyzerPrompt(input);
    return output!;
  }
);
