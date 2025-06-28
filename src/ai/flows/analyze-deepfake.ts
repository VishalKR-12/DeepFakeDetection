'use server'

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
    .min(0)
    .max(1)
    .describe('Confidence score of the deepfake analysis (0-1).'),
  analysisReport: z
    .string()
    .describe(
      'A detailed report outlining the analysis process and findings. Should be 3-4 paragraphs long.'
    ),
  evidenceBreakdown: z
    .object({
      facialInconsistency: z
        .number()
        .describe(
          'Contribution score from facial inconsistencies (e.g. 0.4 for 40%).'
        ),
      temporalAnomalies: z
        .number()
        .describe(
          'Contribution score from temporal anomalies (e.g. 0.3 for 30%).'
        ),
      audioMismatch: z
        .number()
        .describe(
          'Contribution score from audio mismatches (e.g. 0.2 for 20%).'
        ),
      otherFactors: z
        .number()
        .describe('Contribution score from other factors (e.g. 0.1 for 10%).'),
    })
    .describe(
      'A breakdown of factors contributing to the confidence score. The sum of scores should be 1.0.'
    ),
  advancedPatternRecognition: z
    .object({
      creationMethod: z
        .string()
        .describe(
          'The likely tool or method used for creation (e.g., FaceSwap, DeepFaceLab, SOTA, GAN variant).'
        ),
      sophistication: z
        .enum(['Low', 'Medium', 'High', 'Very High'])
        .describe(
          'The assessed sophistication level of the deepfake.'
        ),
    })
    .describe('Advanced pattern recognition findings.'),
  heatmaps: z
    .object({
      attention: z
        .string()
        .url()
        .describe(
          "URL to an attention heatmap image. Use a placeholder: 'https://placehold.co/600x400.png'"
        ),
      anomaly: z
        .string()
        .url()
        .describe(
          "URL to an anomaly heatmap image. Use a placeholder: 'https://placehold.co/600x400.png'"
        ),
      temporal: z
        .string()
        .url()
        .describe(
          "URL to a temporal heatmap image. Use a placeholder: 'https://placehold.co/600x400.png'"
        ),
      featureImportance: z
        .string()
        .url()
        .describe(
          "URL to a feature importance heatmap. Use a placeholder: 'https://placehold.co/600x400.png'"
        ),
    })
    .describe('A set of heatmap visualizations.'),
  timelineAnalysis: z
    .object({
      confidenceGraph: z
        .array(
          z.object({
            frame: z.number(),
            confidence: z.number().min(0).max(1),
          })
        )
        .describe(
          'Frame-by-frame confidence levels for a timeline graph. Generate about 20-30 data points representing video duration.'
        ),
      suspiciousSegments: z
        .array(
          z.object({
            start: z.number().describe('Start time in seconds'),
            end: z.number().describe('End time in seconds'),
            reason: z.string().describe('Reason for suspicion'),
          })
        )
        .describe(
          'List of 1-3 segments with high suspicion.'
        ),
    })
    .describe('Timeline-based analysis results.'),
  multiModalAnalysis: z
    .object({
      avSyncScore: z
        .number()
        .min(0)
        .max(1)
        .describe(
          'Audio-visual synchronization score (0=desynced, 1=synced).'
        ),
      biometricConsistency: z.object({
        blinkRate: z.number().describe('Blinks per minute. Normal is 15-20.'),
        microExpressionScore: z
          .number()
          .min(0)
          .max(1)
          .describe(
            'Consistency of micro-expressions (0=unnatural, 1=natural).'
          ),
        headMovementNaturalness: z
          .number()
          .min(0)
          .max(1)
          .describe(
            'Naturalness of head movements (0=unnatural, 1=natural).'
          ),
      }),
      frequencyAnalysis: z
        .string()
        .describe(
          'A summary of findings from audio and visual frequency domain analysis.'
        ),
    })
    .describe('Results from multi-modal analysis.'),
  explainability: z
    .object({
      decisionTree: z
        .string()
        .url()
        .describe(
          "URL to a decision tree visualization. Use a placeholder: 'https://placehold.co/600x800.png'"
        ),
      uncertaintyQuantification: z
        .string()
        .describe(
          'A summary of areas where the model has low confidence and why.'
        ),
    })
    .describe('Explainable AI (XAI) components.'),
  forensics: z
    .object({
      chainOfCustody: z
        .string()
        .describe(
          "A mock blockchain-based verification trail hash. e.g., '0x' followed by 64 hex characters."
        ),
    })
    .describe('Forensic and export related information.'),
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
  prompt: `You are an expert in deepfake detection. Analyze the provided video and determine if it is a deepfake. Your analysis must be comprehensive and populate all fields in the provided JSON schema.

  Video: {{media url=videoDataUri}}

  Instructions:
  1.  **Overall Verdict**: Set 'isDeepfake' to true or false and provide a 'confidenceScore' between 0.0 and 1.0.
  2.  **Analysis Report**: Write a detailed, multi-paragraph report summarizing your findings.
  3.  **Evidence Breakdown**: Assign values to 'facialInconsistency', 'temporalAnomalies', 'audioMismatch', and 'otherFactors'. These values MUST sum to 1.0.
  4.  **Advanced Recognition**: Identify the likely 'creationMethod' and assess the 'sophistication' level.
  5.  **Heatmaps**: Provide placeholder image URLs from 'https://placehold.co/' for all four heatmap types. DO NOT add text to the URL.
  6.  **Timeline Analysis**:
      -   For 'confidenceGraph', generate an array of about 20-30 objects, each with a 'frame' and a 'confidence' value, simulating a scan over the video's duration.
      -   For 'suspiciousSegments', identify 1 to 3 mock segments with start/end times and a brief reason.
  7.  **Multi-Modal Analysis**: Populate all fields for AV sync, biometrics, and provide a summary for frequency analysis.
  8.  **Explainability**: Provide a placeholder URL for the 'decisionTree' and a text summary for 'uncertaintyQuantification'.
  9.  **Forensics**: Generate a mock 'chainOfCustody' hash.

  Return the ENTIRE output as a single, valid JSON object that strictly follows the provided schema.
  `,
  config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_NONE',
      },
    ],
  },
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
