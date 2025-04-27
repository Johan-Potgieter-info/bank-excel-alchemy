
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Loader2, Save } from 'lucide-react';

interface ConversionProgressProps {
  progress: number;
}

export function ConversionProgress({ progress }: ConversionProgressProps) {
  const formattedProgress = Math.min(100, Math.round(progress));
  
  // Determine the current step based on progress
  const getCurrentStep = () => {
    if (formattedProgress < 30) return "Extracting data from PDF...";
    if (formattedProgress < 70) return "Processing with ConvertAPI...";
    if (formattedProgress < 90) return "Finalizing Excel document...";
    return "Uploading to Google Drive...";
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        <h4 className="font-medium">Converting your PDF</h4>
      </div>
      
      <Progress value={formattedProgress} className="h-2" />
      
      <div className="text-sm text-muted-foreground">
        <p className="flex justify-between">
          <span>{getCurrentStep()}</span>
          <span>{formattedProgress}%</span>
        </p>
      </div>
      
      {formattedProgress >= 90 && (
        <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
          <Save className="h-3 w-3" />
          <span>Saving to your Google Drive folder...</span>
        </div>
      )}
      
      <div className="text-xs text-muted-foreground mt-4">
        <p>Your Excel file will be saved to your Google Drive folder. This may take a few moments depending on the file size.</p>
      </div>
    </div>
  );
}
