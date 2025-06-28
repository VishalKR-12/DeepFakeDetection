"use client";

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

const messages = [
  "Initializing analysis engine...",
  "Processing video frames...",
  "Analyzing facial landmarks and expressions...",
  "Scanning for digital artifacts...",
  "Checking for audio-visual synchronization...",
  "Running frequency analysis...",
  "Compiling findings into a report...",
];

export function AnalysisInProgress() {
  const [message, setMessage] = useState(messages[0]);

  useEffect(() => {
    let index = 0;
    const intervalId = setInterval(() => {
      index = (index + 1) % messages.length;
      setMessage(messages[index]);
    }, 2000); // Change message every 2 seconds

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center gap-6 p-8 rounded-lg bg-card text-card-foreground w-full max-w-md">
      <Loader2 className="w-16 h-16 animate-spin text-primary" />
      <div className="text-center">
        <h2 className="text-2xl font-bold">Analysis in Progress</h2>
        <p className="text-card-foreground/80 mt-2 h-6 transition-opacity duration-500">
          {message}
        </p>
      </div>
    </div>
  );
}
