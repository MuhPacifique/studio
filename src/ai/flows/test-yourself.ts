
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
  potentialConditions: z.array(z.object({
    name: z.string().describe('Name of the potential condition.'),
    description: z.string().describe('Brief description of the condition.'),
    commonSymptoms: z.array(z.string()).describe('Common symptoms associated with this condition, if applicable.'),
  })).describe('A list of potential conditions based on the symptoms. If no specific conditions are strongly indicated, this may be a general statement.'),
  generalAdvice: z.string().describe('General advice based on the symptoms, including when it might be appropriate to see a doctor or try home care.'),
  disclaimer: z.string().describe('A standard disclaimer stating that this information is not a medical diagnosis and a healthcare professional should be consulted.'),
});
export type TestYourselfOutput = z.infer<typeof TestYourselfOutputSchema>;

export async function testYourself(input: TestYourselfInput): Promise<TestYourselfOutput> {
  return testYourselfFlow(input);
}

const testYourselfPrompt = ai.definePrompt({
  name: 'testYourselfPrompt',
  input: {schema: TestYourselfInputSchema},
  output: {schema: TestYourselfOutputSchema},
  prompt: `You are a medical reference manual. Given the following symptoms: {{{symptoms}}}, suggest potential conditions and provide general advice.

  Your response should be structured as follows:
  1.  potentialConditions:
      *   List a few potential conditions if applicable.
      *   For each condition, provide its name, a brief description, and a list of common symptoms associated with it.
      *   If the symptoms are too vague or general, state that and avoid listing specific serious conditions without strong indication.
  2.  generalAdvice: Provide general advice based on the symptoms. This could include self-care tips, or recommendations to monitor symptoms, or when to consider seeing a healthcare professional.
  3.  disclaimer: Include a standard disclaimer: "This information is for educational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition."

  Act like a medical reference manual to cross-reference symptoms. Do not diagnose, only suggest. Do not store any user inputs; this is only for demonstration and is not intended to be a diagnostic tool. Prioritize safety and avoid alarming the user unnecessarily.
  If symptoms are very mild or common (e.g., "feeling tired"), focus more on general wellness advice.
  `,
});

const testYourselfFlow = ai.defineFlow(
  {
    name: 'testYourselfFlow',
    inputSchema: TestYourselfInputSchema,
    outputSchema: TestYourselfOutputSchema,
  },
  async input => {
    const {output} = await testYourselfPrompt(input);
    if (!output) {
        throw new Error("AI did not return an output.");
    }
    // Ensure disclaimer is always present
    if (!output.disclaimer) {
        output.disclaimer = "This information is for educational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.";
    }
    return output;
  }
);

