"use client";

import type { AnalyzeDeepfakeOutput } from "@/ai/flows/analyze-deepfake";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Image from "next/image";
import {
  ShieldAlert, ShieldCheck, FileText, Bot, BrainCircuit,
  AreaChart, Map, GitBranch, FileDown, Clock, AudioWaveform, Eye, Move,
  Copy
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip as RechartsTooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";


interface AnalysisResultsProps {
  result: AnalyzeDeepfakeOutput;
  videoPreview: string;
  onReset: () => void;
}

const StatCard = ({ icon, title, value, unit }: { icon: React.ReactNode, title: string, value: string | number, unit?: string }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">
        {value}
        {unit && <span className="text-xs text-muted-foreground ml-1">{unit}</span>}
      </div>
    </CardContent>
  </Card>
);

const EvidenceBreakdownChart = ({ data }: { data: any[] }) => {
  const COLORS = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)'];
  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          nameKey="name"
          stroke="hsl(var(--background))"
          strokeWidth={2}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <RechartsTooltip
          contentStyle={{
            background: "hsl(var(--card))",
            borderColor: "hsl(var(--border))",
            borderRadius: "var(--radius)",
          }}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

const ConfidenceTimelineChart = ({ data }: { data: any[] }) => (
  <ResponsiveContainer width="100%" height={300}>
    <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
      <XAxis dataKey="frame" stroke="hsl(var(--muted-foreground))" fontSize={12} />
      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} domain={[0, 1]} />
      <RechartsTooltip
        contentStyle={{
          background: "hsl(var(--card))",
          borderColor: "hsl(var(--border))",
          borderRadius: "var(--radius)",
        }}
      />
      <Legend />
      <Line type="monotone" dataKey="confidence" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
    </LineChart>
  </ResponsiveContainer>
);

const jsonToXml = (json: object, rootElementName = "analysisReport") => {
    const toXml = (value: any, name: string): string => {
        const sanitizedName = name.replace(/[^a-zA-Z0-9_.-]/g, '_').replace(/^([0-9])/, '_$1');
        
        if (value === null || value === undefined) {
            return `<${sanitizedName}/>`;
        }

        if (Array.isArray(value)) {
            let content = '';
            value.forEach(item => {
                content += toXml(item, 'item'); 
            });
            return `<${sanitizedName}>${content}</${sanitizedName}>`;
        }

        if (typeof value === 'object') {
            let content = '';
            Object.keys(value).forEach(key => {
                content += toXml(value[key], key);
            });
            return `<${sanitizedName}>${content}</${sanitizedName}>`;
        }
        
        const escapedValue = value.toString().replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
        return `<${sanitizedName}>${escapedValue}</${sanitizedName}>`;
    };

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += toXml(json, rootElementName);
    return xml;
};

export function AnalysisResults({ result, videoPreview, onReset }: AnalysisResultsProps) {
  const { toast } = useToast();
  const confidencePercentage = Math.round(result.confidenceScore * 100);
  const isDeepfake = result.isDeepfake;

  const evidenceData = [
    { name: 'Facial Inconsistency', value: result.evidenceBreakdown.facialInconsistency },
    { name: 'Temporal Anomalies', value: result.evidenceBreakdown.temporalAnomalies },
    { name: 'Audio Mismatch', value: result.evidenceBreakdown.audioMismatch },
    { name: 'Other Factors', value: result.evidenceBreakdown.otherFactors },
  ];

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard!",
      description: text,
    });
  };

  const handleExport = (format: 'JSON' | 'PDF' | 'XML') => {
    if (format === 'JSON') {
      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(result, null, 2))}`;
      const link = document.createElement("a");
      link.href = jsonString;
      link.download = "deepfake_analysis_report.json";
      link.click();
    } else if (format === 'PDF') {
        window.print();
    } else if (format === 'XML') {
        const xmlResult = jsonToXml(result);
        const xmlString = `data:application/xml;charset=utf-8,${encodeURIComponent(xmlResult)}`;
        const link = document.createElement("a");
        link.href = xmlString;
        link.download = "deepfake_analysis_report.xml";
        link.click();
    }
  }


  return (
    <div className="w-full max-w-7xl flex flex-col items-center gap-8 animate-in fade-in duration-500">
      <div className="text-center print:hidden">
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight font-headline">Analysis Complete</h2>
        <p className="mt-2 text-lg text-foreground/60">
          Review the comprehensive results from our multi-modal deepfake analysis.
        </p>
      </div>

      <Tabs defaultValue="summary" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-6 mb-4 print:hidden">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="visuals">Visual Evidence</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="xai">Explainable AI</TabsTrigger>
          <TabsTrigger value="forensics">Forensics</TabsTrigger>
          <TabsTrigger value="raw">Raw Data</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="data-[state=inactive]:hidden print:block" forceMount>
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="md:col-span-3">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {isDeepfake ? <ShieldAlert className="text-destructive w-8 h-8" /> : <ShieldCheck className="text-green-500 w-8 h-8" />}
                  Overall Verdict & Confidence
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-6 md:grid-cols-2">
                 <div>
                    <Badge variant={isDeepfake ? "destructive" : "default"} className={cn("text-xl px-4 py-2", !isDeepfake && "bg-green-600 hover:bg-green-700")}>
                      {isDeepfake ? "Deepfake Detected" : "Likely Authentic"}
                    </Badge>
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between items-baseline">
                        <p className="text-sm font-medium text-muted-foreground">Confidence Score</p>
                        <p className="text-2xl font-bold text-primary">{confidencePercentage}%</p>
                      </div>
                      <Progress value={confidencePercentage} className="h-3" />
                    </div>
                 </div>
                 <div className="h-full">
                   <EvidenceBreakdownChart data={evidenceData} />
                 </div>
              </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg"><Bot /> Creation Analysis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Method:</span>
                        <span className="font-medium">{result.advancedPatternRecognition.creationMethod}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Sophistication:</span>
                        <Badge variant="secondary">{result.advancedPatternRecognition.sophistication}</Badge>
                    </div>
                </CardContent>
            </Card>

            <Card className="md:col-span-2">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg"><FileText /> Summary Report</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-foreground/80 whitespace-pre-wrap">
                    {result.analysisReport}
                </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="visuals" className="data-[state=inactive]:hidden print:block" forceMount>
          <Card>
            <CardHeader>
                <CardTitle>Advanced Heatmap Analysis</CardTitle>
                <CardDescription>Visualizing where the model focuses and detects anomalies.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                  <h3 className="font-semibold">Attention Heatmap</h3>
                  <Image data-ai-hint="abstract heatmap" src={result.heatmaps.attention} alt="Attention Heatmap" width={600} height={400} className="rounded-lg border" />
              </div>
              <div className="space-y-2">
                  <h3 className="font-semibold">Anomaly Heatmap</h3>
                  <Image data-ai-hint="colorful anomaly" src={result.heatmaps.anomaly} alt="Anomaly Heatmap" width={600} height={400} className="rounded-lg border" />
              </div>
              <div className="space-y-2">
                  <h3 className="font-semibold">Temporal Heatmap</h3>
                  <Image data-ai-hint="temporal analysis" src={result.heatmaps.temporal} alt="Temporal Heatmap" width={600} height={400} className="rounded-lg border" />
              </div>
              <div className="space-y-2">
                  <h3 className="font-semibold">Feature Importance</h3>
                  <Image data-ai-hint="feature map" src={result.heatmaps.featureImportance} alt="Feature Importance Heatmap" width={600} height={400} className="rounded-lg border" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="data-[state=inactive]:hidden print:block" forceMount>
            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Frame-by-Frame Confidence Analysis</CardTitle>
                        <CardDescription>Detection confidence across the video's duration.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ConfidenceTimelineChart data={result.timelineAnalysis.confidenceGraph} />
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Multi-Modal Biometric & Synchronization Analysis</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        <StatCard icon={<AudioWaveform className="text-muted-foreground"/>} title="A/V Sync Score" value={result.multiModalAnalysis.avSyncScore.toFixed(2)} unit="/ 1.00" />
                        <StatCard icon={<Eye className="text-muted-foreground"/>} title="Blink Rate" value={result.multiModalAnalysis.biometricConsistency.blinkRate.toFixed(1)} unit="BPM" />
                        <StatCard icon={<BrainCircuit className="text-muted-foreground"/>} title="Micro-expressions" value={result.multiModalAnalysis.biometricConsistency.microExpressionScore.toFixed(2)} unit="/ 1.00" />
                        <StatCard icon={<Move className="text-muted-foreground"/>} title="Head Movement" value={result.multiModalAnalysis.biometricConsistency.headMovementNaturalness.toFixed(2)} unit="/ 1.00" />
                        <div className="md:col-span-2 lg:col-span-4 text-sm">
                            <h4 className="font-semibold mb-2">Frequency Analysis Summary</h4>
                            <p className="text-muted-foreground">{result.multiModalAnalysis.frequencyAnalysis}</p>
                        </div>
                    </CardContent>
                 </Card>
                <Card>
                  <CardHeader><CardTitle>Suspicious Segments</CardTitle></CardHeader>
                  <CardContent>
                      <Table>
                          <TableHeader>
                              <TableRow>
                                  <TableHead>Time</TableHead>
                                  <TableHead>Reason</TableHead>
                              </TableRow>
                          </TableHeader>
                          <TableBody>
                              {result.timelineAnalysis.suspiciousSegments.map((seg, i) => (
                                <TableRow key={i}>
                                    <TableCell className="font-mono">{seg.start.toFixed(2)}s - {seg.end.toFixed(2)}s</TableCell>
                                    <TableCell>{seg.reason}</TableCell>
                                </TableRow>
                              ))}
                          </TableBody>
                      </Table>
                  </CardContent>
                </Card>
            </div>
        </TabsContent>

        <TabsContent value="xai" className="data-[state=inactive]:hidden print:block" forceMount>
           <Card>
               <CardHeader><CardTitle>Explainable AI (XAI)</CardTitle><CardDescription>Understanding the AI's decision-making process.</CardDescription></CardHeader>
               <CardContent className="grid gap-6 md:grid-cols-2">
                   <div>
                       <h3 className="font-semibold mb-2">Decision Tree Visualization</h3>
                       <Image data-ai-hint="decision tree" src={result.explainability.decisionTree} alt="Decision Tree" width={600} height={800} className="rounded-lg border" />
                   </div>
                   <div className="space-y-4">
                        <h3 className="font-semibold">Uncertainty Quantification</h3>
                        <p className="text-sm text-muted-foreground">{result.explainability.uncertaintyQuantification}</p>
                   </div>
               </CardContent>
           </Card>
        </TabsContent>
        
        <TabsContent value="forensics" className="data-[state=inactive]:hidden print:block" forceMount>
            <Card>
                <CardHeader><CardTitle>Forensic Report & Export</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <h3 className="font-semibold">Chain of Custody</h3>
                        <div className="flex items-center gap-2 mt-2 p-3 bg-muted rounded-md font-mono text-sm">
                            <span className="truncate">{result.forensics.chainOfCustody}</span>
                            <Button variant="ghost" size="icon" className="w-8 h-8 print:hidden" onClick={() => handleCopy(result.forensics.chainOfCustody)}><Copy className="w-4 h-4" /></Button>
                        </div>
                    </div>
                    <div className="print:hidden">
                        <h3 className="font-semibold">Export Report</h3>
                        <div className="flex gap-4 mt-2">
                            <Button variant="outline" onClick={() => handleExport('JSON')}>Export as JSON</Button>
                            <Button variant="outline" onClick={() => handleExport('PDF')}>Export as PDF</Button>
                            <Button variant="outline" onClick={() => handleExport('XML')}>Export as XML</Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="raw" className="data-[state=inactive]:hidden print:block" forceMount>
          <Card>
            <CardHeader><CardTitle>Raw JSON Data</CardTitle></CardHeader>
            <CardContent>
              <pre className="text-xs bg-muted p-4 rounded-lg overflow-x-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>

      <div className="w-full mt-6 flex flex-col items-center gap-4 print:hidden">
        <video src={videoPreview} controls className="w-full max-w-2xl rounded-lg aspect-video bg-black shadow-lg"></video>
        <Button onClick={onReset} size="lg" variant="outline" className="mt-4">
          Analyze Another Video
        </Button>
      </div>

    </div>
  );
}
