"use client";

import { useState } from "react";
import type { AnalyzeDeepfakeOutput } from "@/ai/flows/analyze-deepfake";
import { runAnalysis } from "@/app/actions";
import { Header } from "@/components/deep-detect/Header";
import { VideoUpload } from "@/components/deep-detect/VideoUpload";
import { AnalysisResults } from "@/components/deep-detect/AnalysisResults";
import { AnalysisInProgress } from "@/components/deep-detect/AnalysisInProgress";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function Home() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [result, setResult] = useState<AnalyzeDeepfakeOutput | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const { toast } = useToast();

  const handleAnalyze = async (file: File) => {
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
       toast({
        variant: "destructive",
        title: "File Too Large",
        description: "Please upload a video smaller than 10MB.",
      });
      return;
    }

    setStatus("loading");
    setResult(null);

    const filePreviewUrl = URL.createObjectURL(file);
    setVideoPreview(filePreviewUrl);

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const dataUri = reader.result as string;
      try {
        const analysisResult = await runAnalysis(dataUri);
        setResult(analysisResult);
        setStatus("success");
      } catch (error) {
        console.error(error);
        setStatus("error");
        toast({
          variant: "destructive",
          title: "Analysis Failed",
          description: error instanceof Error ? error.message : "An unknown error occurred.",
        });
      }
    };
    reader.onerror = () => {
      console.error("Failed to read file.");
      setStatus("error");
      toast({
        variant: "destructive",
        title: "File Read Error",
        description: "Could not read the selected video file.",
      });
    };
  };

  const handleReset = () => {
    setStatus("idle");
    setResult(null);
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview);
    }
    setVideoPreview(null);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 md:py-12">
        <div className="flex flex-col items-center justify-center text-center">
          {status === "idle" && (
            <VideoUpload onAnalyze={handleAnalyze} isLoading={status === "loading"} />
          )}
          {status === "loading" && <AnalysisInProgress />}
          {status === "error" && (
            <div className="flex flex-col items-center gap-6 p-8 bg-card rounded-lg shadow-lg">
                <AlertCircle className="w-16 h-16 text-destructive" />
                <h2 className="text-2xl font-bold text-card-foreground">Analysis Failed</h2>
                <p className="text-card-foreground/80">
                    An unexpected error occurred. Please try again with a different video.
                </p>
                <Button onClick={handleReset} variant="outline" size="lg">
                    Analyze Another Video
                </Button>
            </div>
          )}
          {status === "success" && result && videoPreview && (
            <AnalysisResults
              result={result}
              videoPreview={videoPreview}
              onReset={handleReset}
            />
          )}
        </div>
      </main>
    </div>
  );
}
