'use server';
/**
 * @fileOverview Generates a detailed report outlining the deepfake analysis process.
 *
 * - generateDeepfakeReport - A function that generates the deepfake report.
 * - GenerateDeepfakeReportInput - The input type for the generateDeepfakeReport function.
 * - GenerateDeepfakeReportOutput - The return type for the generateDeepfakeReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateDeepfakeReportInputSchema = z.object({
  analysisProcess: z.string().describe('A description of the analysis process used.'),
  detectedAbnormalities: z.string().describe('A description of any detected abnormalities in the video.'),
  potentialMethods: z.string().describe('A list of potential deepfake methods that could have been used.'),
  confidenceScore: z.number().describe('A confidence score (0-1) indicating the likelihood that the video is a deepfake.'),
});
export type GenerateDeepfakeReportInput = z.infer<typeof GenerateDeepfakeReportInputSchema>;

const GenerateDeepfakeReportOutputSchema = z.object({
  report: z.string().describe('A detailed report outlining the analysis and findings.'),
});
export type GenerateDeepfakeReportOutput = z.infer<typeof GenerateDeepfakeReportOutputSchema>;

export async function generateDeepfakeReport(input: GenerateDeepfakeReportInput): Promise<GenerateDeepfakeReportOutput> {
  return generateDeepfakeReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateDeepfakeReportPrompt',
  input: {schema: GenerateDeepfakeReportInputSchema},
  output: {schema: GenerateDeepfakeReportOutputSchema},
  prompt: `You are an expert in deepfake detection and analysis. Generate a detailed report based on the following information:\n\nAnalysis Process: {{{analysisProcess}}}\nDetected Abnormalities: {{{detectedAbnormalities}}}\nPotential Deepfake Methods: {{{potentialMethods}}}\nConfidence Score: {{{confidenceScore}}}\n\nCompose a report summarizing the findings, explaining the analysis process, highlighting detected abnormalities, discussing potential deepfake methods, and stating the confidence score. The report should be comprehensive and easy to understand for a non-technical audience.`,
});

const generateDeepfakeReportFlow = ai.defineFlow(
  {
    name: 'generateDeepfakeReportFlow',
    inputSchema: GenerateDeepfakeReportInputSchema,
    outputSchema: GenerateDeepfakeReportOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
