
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Loader2 } from 'lucide-react';

interface ConversionProgressProps {
  progress: number;
}

export function ConversionProgress({ progress }: ConversionProgressProps) {
  const formattedProgress = Math.min(100, Math.round(progress));
  
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        <h4 className="font-medium">Converting your PDF</h4>
      </div>
      
      <Progress value={formattedProgress} className="h-2" />
      
      <div className="text-sm text-muted-foreground">
        <p className="flex justify-between">
          <span>Processing statement data...</span>
          <span>{formattedProgress}%</span>
        </p>
      </div>
      
      <div className="text-xs text-muted-foreground mt-4">
        <p>Your Excel file will be ready soon. This may take a few moments depending on the file size.</p>
      </div>
    </div>
  );
}
