// use server'

/**
 * @fileOverview Deepfake video analysis flow.
 *
 * - analyzeDeepfake - Analyzes a video to determine if it's a deepfake.
 * - AnalyzeDeepfakeInput - Input type for the analyzeDeepfake function.
 * - AnalyzeDeepfakeOutput - Return type for the analyzeDeepfake function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeDeepfakeInputSchema = z.object({
  videoDataUri: z
    .string()
    .describe(
      "A video to analyze, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzeDeepfakeInput = z.infer<typeof AnalyzeDeepfakeInputSchema>;

const AnalyzeDeepfakeOutputSchema = z.object({
  isDeepfake: z.boolean().describe('Whether the video is likely a deepfake.'),
  confidenceScore: z
    .number()
    .describe('Confidence score of the deepfake analysis (0-1).'),
  analysisReport: z
    .string()
    .describe('A detailed report outlining the analysis process and findings.'),
  potentialMethods: z
    .string()
    .describe('Potential methods used in the deepfake creation.'),
});
export type AnalyzeDeepfakeOutput = z.infer<typeof AnalyzeDeepfakeOutputSchema>;

export async function analyzeDeepfake(
  input: AnalyzeDeepfakeInput
): Promise<AnalyzeDeepfakeOutput> {
  return analyzeDeepfakeFlow(input);
}

const analyzeDeepfakePrompt = ai.definePrompt({
  name: 'analyzeDeepfakePrompt',
  input: {schema: AnalyzeDeepfakeInputSchema},
  output: {schema: AnalyzeDeepfakeOutputSchema},
  prompt: `You are an expert in deepfake detection. Analyze the provided video and determine if it is a deepfake.

  Provide a confidence score (0-1) indicating the likelihood of the video being a deepfake.
  Create a detailed report outlining the analysis process, including detected abnormalities, and potential methods used in the deepfake creation.

  Video: {{media url=videoDataUri}}
  \nOutput in JSON format.  Make sure the ENTIRE output is valid JSON. Include potentialMethods and analysisReport.
  Follow this schema:
  \n{
  isDeepfake: boolean,
  confidenceScore: number,
  analysisReport: string,
  potentialMethods: string
}
  `,
});

const analyzeDeepfakeFlow = ai.defineFlow(
  {
    name: 'analyzeDeepfakeFlow',
    inputSchema: AnalyzeDeepfakeInputSchema,
    outputSchema: AnalyzeDeepfakeOutputSchema,
  },
  async input => {
    const {output} = await analyzeDeepfakePrompt(input);
    return output!;
  }
);
