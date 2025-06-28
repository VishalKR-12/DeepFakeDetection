"use client";

import { useState, type DragEvent } from 'react';
import { UploadCloud, Film } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface VideoUploadProps {
  onAnalyze: (file: File) => void;
  isLoading: boolean;
}

export function VideoUpload({ onAnalyze, isLoading }: VideoUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      if (event.dataTransfer.files[0].type.startsWith('video/')) {
        setSelectedFile(event.dataTransfer.files[0]);
      }
    }
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDragEnter = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (selectedFile) {
      onAnalyze(selectedFile);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-extrabold tracking-tight lg:text-5xl font-headline text-primary">
          Detect Digital Deception
        </h2>
        <p className="mt-4 text-lg text-foreground/80">
          Upload a video to analyze it for signs of deepfake manipulation. Our AI will provide a detailed report on its authenticity.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div
          className={cn(
            "relative w-full h-64 border-2 border-dashed rounded-lg flex flex-col justify-center items-center text-center p-4 transition-colors duration-300",
            isDragging ? "border-primary bg-accent" : "border-border hover:border-primary/50"
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
        >
          <input
            type="file"
            id="video-upload"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            accept="video/*"
            onChange={handleFileChange}
            disabled={isLoading}
          />
          <div className="flex flex-col items-center gap-2 text-foreground/70">
            <UploadCloud className="w-12 h-12 mb-2 text-primary" />
            <span className="font-semibold">Drag & drop a video file here</span>
            <span className="text-sm">or click to browse</span>
            <span className="text-xs mt-2 text-muted-foreground">Supports MP4, MOV, AVI, etc. (Max 10MB)</span>
          </div>
        </div>

        {selectedFile && (
          <div className="flex items-center justify-center p-3 bg-card rounded-md border text-card-foreground">
            <Film className="w-5 h-5 mr-3 text-primary" />
            <span className="font-medium truncate">{selectedFile.name}</span>
          </div>
        )}

        <Button type="submit" size="lg" className="w-full" disabled={!selectedFile || isLoading}>
          {isLoading ? 'Analyzing...' : 'Analyze Video'}
        </Button>
      </form>
    </div>
  );
}
