'use server';

import { analyzeDeepfake, type AnalyzeDeepfakeOutput } from '@/ai/flows/analyze-deepfake';

export async function runAnalysis(videoDataUri: string): Promise<AnalyzeDeepfakeOutput> {
  if (!videoDataUri) {
    throw new Error('Video data is missing.');
  }

  try {
    const result = await analyzeDeepfake({ videoDataUri });
    return result;
  } catch (error) {
    console.error('Error during deepfake analysis:', error);
    throw new Error('Failed to analyze the video. The model may be unavailable or the input might be invalid.');
  }
}
