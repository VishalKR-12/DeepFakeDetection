"use client";

import type { AnalyzeDeepfakeOutput } from "@/ai/flows/analyze-deepfake";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ShieldAlert, ShieldCheck, FileText, FlaskConical, TrendingUp } from "lucide-react";

interface AnalysisResultsProps {
  result: AnalyzeDeepfakeOutput;
  videoPreview: string;
  onReset: () => void;
}

export function AnalysisResults({ result, videoPreview, onReset }: AnalysisResultsProps) {
  const confidencePercentage = Math.round(result.confidenceScore * 100);
  const isDeepfake = result.isDeepfake;

  return (
    <div className="w-full flex flex-col items-center gap-8 animate-in fade-in duration-500">
      <div className="text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight font-headline">Analysis Complete</h2>
        <p className="mt-2 text-lg text-foreground/80">
          Here are the findings from our deepfake detection analysis.
        </p>
      </div>

      <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Main Result Card */}
        <Card className="md:col-span-2 lg:col-span-1 bg-card/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {isDeepfake ? <ShieldAlert className="text-destructive" /> : <ShieldCheck className="text-green-500" />}
              Overall Verdict
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Badge variant={isDeepfake ? "destructive" : "default"} className={cn("text-lg px-4 py-1", !isDeepfake && "bg-green-600 hover:bg-green-700")}>
              {isDeepfake ? "Deepfake Detected" : "Likely Authentic"}
            </Badge>
            <div className="space-y-2">
              <div className="flex justify-between items-baseline">
                <p className="text-sm font-medium text-card-foreground/80">Confidence Score</p>
                <p className="text-lg font-bold text-primary">{confidencePercentage}%</p>
              </div>
              <Progress value={confidencePercentage} className="h-3" />
            </div>
            <p className="text-xs text-card-foreground/60">
              This score represents our model's confidence in the verdict based on the analyzed features.
            </p>
          </CardContent>
        </Card>

        {/* Video Preview */}
        <Card className="md:col-span-2 lg:col-span-2 bg-card/50">
          <CardHeader>
            <CardTitle>Analyzed Video</CardTitle>
          </CardHeader>
          <CardContent>
            <video src={videoPreview} controls className="w-full rounded-md aspect-video bg-black"></video>
          </CardContent>
        </Card>

        {/* Analysis Report */}
        <Card className="md:col-span-2 lg:col-span-3 bg-card/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="text-primary" />
              Detailed Analysis Report
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm dark:prose-invert max-w-none text-left whitespace-pre-wrap font-sans text-card-foreground/90">
                {result.analysisReport}
            </div>
          </CardContent>
        </Card>

        {/* Potential Methods */}
        <Card className="md:col-span-2 lg:col-span-2 bg-card/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FlaskConical className="text-primary" />
              Potential Methods Identified
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-left text-card-foreground/90">{result.potentialMethods}</p>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card className="lg:col-span-1 bg-card/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="text-primary" />
              Model Performance
            </CardTitle>
            <CardDescription>Mock performance metrics.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-left">
            <div className="flex justify-between"><span>Accuracy:</span><span className="font-mono font-bold">98.2%</span></div>
            <div className="flex justify-between"><span>Precision:</span><span className="font-mono font-bold">97.5%</span></div>
            <div className="flex justify-between"><span>Recall:</span><span className="font-mono font-bold">98.8%</span></div>
            <div className="flex justify-between"><span>F1 Score:</span><span className="font-mono font-bold">98.1%</span></div>
          </CardContent>
        </Card>

      </div>

      <Button onClick={onReset} size="lg" variant="outline" className="mt-4">
        Analyze Another Video
      </Button>
    </div>
  );
}

// Helper to use Badge with custom colors
function cn(...inputs: any[]) {
    // A simplified version for this component
    return inputs.filter(Boolean).join(' ');
}
