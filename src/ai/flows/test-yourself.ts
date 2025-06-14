'use server';

/**
 * @fileOverview Provides a symptom-based disease suggestion flow.
 *
 * - testYourself - A function that takes symptoms as input and returns potential diseases and treatment/prevention information.
 * - TestYourselfInput - The input type for the testYourself function.
 * - TestYourselfOutput - The return type for the testYourself function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TestYourselfInputSchema = z.object({
  symptoms: z.string().describe('The symptoms experienced by the user.'),
});
export type TestYourselfInput = z.infer<typeof TestYourselfInputSchema>;

const TestYourselfOutputSchema = z.object({
  potentialDiseases: z.string().describe('Potential diseases based on the symptoms.'),
  treatmentPreventionInfo: z
    .string()
    .describe('Information on how to treat or prevent the potential diseases.'),
});
export type TestYourselfOutput = z.infer<typeof TestYourselfOutputSchema>;

export async function testYourself(input: TestYourselfInput): Promise<TestYourselfOutput> {
  return testYourselfFlow(input);
}

const testYourselfPrompt = ai.definePrompt({
  name: 'testYourselfPrompt',
  input: {schema: TestYourselfInputSchema},
  output: {schema: TestYourselfOutputSchema},
  prompt: `Given the following symptoms: {{{symptoms}}}, suggest potential diseases and provide information on how to treat or prevent them. Act like a medical reference manual to cross-reference symptoms. Do not diagnose, only suggest. Do not store any user inputs; this is only for demonstration and is not intended to be a diagnostic tool.`,
});

const testYourselfFlow = ai.defineFlow(
  {
    name: 'testYourselfFlow',
    inputSchema: TestYourselfInputSchema,
    outputSchema: TestYourselfOutputSchema,
  },
  async input => {
    const {output} = await testYourselfPrompt(input);
    return output!;
  }
);
