
'use server';

/**
 * @fileOverview AI-powered symptom analysis flow.
 *
 * - analyzeSymptoms - A function that analyzes user-provided symptoms and an optional image, then suggests possible conditions or next steps.
 * - SymptomAnalyzerInput - The input type for the analyzeSymptoms function, including a description of symptoms and an optional image data URI.
 * - SymptomAnalyzerOutput - The return type for the analyzeSymptoms function, providing a list of potential conditions and next steps.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SymptomAnalyzerInputSchema = z.object({
  symptomsDescription: z
    .string()
    .describe('A detailed description of the symptoms experienced by the user.'),
  imageDataUri: z
    .string()
    .optional()
    .describe(
      "An optional image of the symptom/injury, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type SymptomAnalyzerInput = z.infer<typeof SymptomAnalyzerInputSchema>;

const SymptomAnalyzerOutputSchema = z.object({
  potentialConditions: z
    .array(z.string())
    .describe('A list of potential medical conditions (not a diagnosis) that may align with the symptoms. This should be presented as possibilities for discussion with a doctor.'),
  nextSteps: z
    .string()
    .describe(
      'General advice and recommended next steps, always emphasizing consultation with a healthcare professional for actual diagnosis and treatment.'
    ),
  disclaimer: z.string().describe('A standard medical disclaimer.'),
});
export type SymptomAnalyzerOutput = z.infer<typeof SymptomAnalyzerOutputSchema>;

export async function analyzeSymptoms(input: SymptomAnalyzerInput): Promise<SymptomAnalyzerOutput> {
  return symptomAnalyzerFlow(input);
}

const symptomAnalyzerPrompt = ai.definePrompt({
  name: 'symptomAnalyzerPrompt',
  input: {schema: SymptomAnalyzerInputSchema},
  output: {schema: SymptomAnalyzerOutputSchema},
  prompt: `You are a helpful AI assistant acting as a medical reference tool. A user will describe their symptoms and may provide an image. Based on this information, provide a list of potential conditions (not a diagnosis) and suggest general next steps. Always prioritize safety and strongly advise consultation with a healthcare professional.

User's Description of Symptoms:
"{{{symptomsDescription}}}"

{{#if imageDataUri}}
User's Provided Image of Symptom/Injury:
{{media url=imageDataUri}}
{{/if}}

Based on the provided information:
1.  List a few potential conditions that might be associated with these symptoms for informational purposes. Make it clear these are not diagnoses.
2.  Suggest general next steps the user could consider, such as lifestyle adjustments, monitoring symptoms, or when to see a doctor.
3.  Always include the following disclaimer: "This information is for educational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition."

Respond in a conversational and empathetic tone. Structure your output clearly.
If an image is provided, consider it in your analysis, especially for visual symptoms like rashes or injuries, but still emphasize it's not a diagnostic tool.
If the symptoms are vague, or if the image is unclear or not medically relevant, state that and focus on general wellness advice and the importance of seeing a doctor.
Do not attempt to diagnose. Your role is to provide general information and guide the user towards professional medical help.
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
    if (!output) {
        throw new Error("AI did not return an output for symptom analysis.");
    }
    // Ensure disclaimer is always present and correctly formatted
    output.disclaimer = "This information is for educational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.";
    
    return output;
  }
);
