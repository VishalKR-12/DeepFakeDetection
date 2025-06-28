'use server';

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

// This is the full output schema including images
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
      'A breakdown of factors contributing to the confidence score.'
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
        .describe(
          'A data URI of a generated attention heatmap image, based on the analysis.'
        ),
      anomaly: z
        .string()
        .describe(
          'A data URI of a generated anomaly heatmap image, based on the analysis.'
        ),
      temporal: z
        .string()
        .describe(
          'A data URI of a generated temporal heatmap image, based on the analysis.'
        ),
      featureImportance: z
        .string()
        .describe(
          'A data URI of a generated feature importance heatmap, based on the analysis.'
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
        .describe(
          'A data URI of a generated decision tree visualization.'
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
          'A mock forensic verification hash.'
        ),
    })
    .describe('Forensic and export related information.'),
});
export type AnalyzeDeepfakeOutput = z.infer<typeof AnalyzeDeepfakeOutputSchema>;

// This is the schema for the text-only part of the analysis.
const TextAnalysisSchema = AnalyzeDeepfakeOutputSchema.omit({
  heatmaps: true,
  explainability: true,
}).extend({
  explainability: AnalyzeDeepfakeOutputSchema.shape.explainability.omit({
    decisionTree: true,
  }),
});

export async function analyzeDeepfake(
  input: AnalyzeDeepfakeInput
): Promise<AnalyzeDeepfakeOutput> {
  return analyzeDeepfakeFlow(input);
}

const analyzeDeepfakePrompt = ai.definePrompt({
  name: 'analyzeDeepfakeTextPrompt',
  input: {schema: AnalyzeDeepfakeInputSchema},
  output: {schema: TextAnalysisSchema},
  prompt: `You are an expert in deepfake detection. Your task is to analyze the provided video and determine if it is a deepfake. Provide a comprehensive textual analysis by populating all the fields in the requested JSON output schema as accurately as possible. You will generate visual heatmaps in a later step, so do not include any URLs or image data here.

  Video: {{media url=videoDataUri}}

  Guidelines for your analysis:
  1.  **Overall Verdict & Confidence**: Based on the *entirety* of your analysis, make a final determination for 'isDeepfake'. The 'confidenceScore' should be a carefully weighed metric from 0.0 to 1.0, reflecting your certainty. A score of 0.9 or higher indicates very high certainty of a deepfake, while a score below 0.2 suggests it is likely authentic. The score should not be a simple average of evidence factors, but a holistic judgment based on the severity and number of detected artifacts. For instance, a single glaring temporal anomaly might justify a higher confidence score than several minor facial inconsistencies.
  2.  **Analysis Report**: Write a clear, multi-paragraph report of your findings.
  3.  **Evidence Breakdown**: Estimate the contribution of different factors ('facialInconsistency', 'temporalAnomalies', etc.). These are estimates and do not need to sum to a specific number.
  4.  **Advanced Recognition**: Based on the specific visual artifacts you observe (e.g., edge warping, unnatural smoothing, poor lip-sync), suggest a likely 'creationMethod'. Examples include FaceSwap, DeepFaceLab, SOTA, GAN variants, etc. Then, assess the 'sophistication' level from 'Low' to 'Very High' based on how convincing the manipulation is.
  5.  **Timeline Analysis**:
      -   'confidenceGraph': Generate a series of data points (around 20-30) to represent the confidence over the video's timeline.
      -   'suspiciousSegments': List a few (1-3) suspicious segments with approximate start/end times and a reason.
  6.  **Multi-Modal Analysis**: Fill in the sub-fields related to AV sync and biometrics based on your analysis.
  7.  **Explainability**: Write a summary for 'uncertaintyQuantification'.
  8.  **Forensics**: Generate a plausible mock 'chainOfCustody' forensic hash.

  Please ensure your final output is a single, valid JSON object that strictly conforms to the provided schema structure.
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
  async (input) => {
    // 1. Get the text-based analysis first.
    const {output: textAnalysis} = await analyzeDeepfakePrompt(input);

    if (!textAnalysis) {
      throw new Error('Failed to get a text-based analysis from the model.');
    }

    // 2. In parallel, generate all the required visualizations based on the text analysis.
    const imageGenerationModel =
      'googleai/gemini-2.0-flash-preview-image-generation';
    const imageConfig = {responseModalities: ['TEXT', 'IMAGE'] as const};

    const [
      attentionMedia,
      anomalyMedia,
      temporalMedia,
      featureImportanceMedia,
      decisionTreeMedia,
    ] = await Promise.all([
      ai.generate({
        model: imageGenerationModel,
        config: imageConfig,
        prompt: `Generate a scientific attention heatmap visualizing the key areas of focus during a deepfake video analysis. The visualization should be consistent with the following findings: ${textAnalysis.analysisReport}`,
      }),
      ai.generate({
        model: imageGenerationModel,
        config: imageConfig,
        prompt: `Generate a technical anomaly heatmap. This visualization should highlight areas of digital artifacts and inconsistencies on a human face, based on a video analysis that reported a facial inconsistency score of ${textAnalysis.evidenceBreakdown.facialInconsistency * 100}%. Focus on highlighting artifacts consistent with these findings: ${textAnalysis.analysisReport}`,
      }),
      ai.generate({
        model: imageGenerationModel,
        config: imageConfig,
        prompt: `Generate a temporal consistency heatmap for a video analysis. This should be a graph-like visualization showing fluctuations in deepfake detection confidence over time, reflecting these specific suspicious segments: ${JSON.stringify(textAnalysis.timelineAnalysis.suspiciousSegments)}`,
      }),
      ai.generate({
        model: imageGenerationModel,
        config: imageConfig,
        prompt: `Generate a feature importance heatmap. The visualization should show which facial features were most influential in the deepfake detection. The analysis identified these contribution scores: Facial Inconsistency: ${textAnalysis.evidenceBreakdown.facialInconsistency}, Temporal Anomalies: ${textAnalysis.evidenceBreakdown.temporalAnomalies}, Audio Mismatch: ${textAnalysis.evidenceBreakdown.audioMismatch}. The style should be scientific and clearly represent this breakdown.`,
      }),
      ai.generate({
        model: imageGenerationModel,
        config: imageConfig,
        prompt: `Generate a clear diagram visualizing a simplified decision tree for an AI model that performed a deepfake analysis. The final verdict was '${textAnalysis.isDeepfake ? "Deepfake Detected" : "Likely Authentic"}' with a confidence of ${Math.round(textAnalysis.confidenceScore * 100)}%. The tree should illustrate a plausible logical path to this conclusion, with nodes representing checks like 'A/V Sync Score: ${textAnalysis.multiModalAnalysis.avSyncScore}', 'Blink Rate Check', and 'Facial Artifacts?'.`,
      }),
    ]);

    // 3. Combine the text analysis with the generated images into the final output object.
    const finalOutput: AnalyzeDeepfakeOutput = {
      ...textAnalysis,
      heatmaps: {
        attention: attentionMedia.media.url,
        anomaly: anomalyMedia.media.ul,
        temporal: temporalMedia.media.url,
        featureImportance: featureImportanceMedia.media.url,
      },
      explainability: {
        ...textAnalysis.explainability,
        decisionTree: decisionTreeMedia.media.url,
      },
    };

    return finalOutput;
  }
);
