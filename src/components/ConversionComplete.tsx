
import React from 'react';
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

interface ConversionCompleteProps {
  isDriveConfigured: boolean;
  onOpenInDrive: () => void;
  onDownload: () => void;
  onReset: () => void;
}

export function ConversionComplete({
  isDriveConfigured,
  onOpenInDrive,
  onDownload,
  onReset
}: ConversionCompleteProps) {
  return (
    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-md border border-green-200 dark:border-green-900/30">
      <h3 className="font-medium text-green-800 dark:text-green-300 mb-2">
        Conversion Complete!
      </h3>
      <p className="text-green-700 dark:text-green-400 text-sm mb-4">
        {isDriveConfigured 
          ? "Your bank statement has been successfully converted to Excel and saved to Google Drive."
          : "Your bank statement has been successfully converted to Excel."}
      </p>
      <div className="space-y-3">
        {isDriveConfigured && (
          <Button onClick={onOpenInDrive} className="w-full flex items-center justify-center gap-2">
            <ExternalLink className="h-4 w-4" /> 
            Open in Google Drive
          </Button>
        )}
        <Button onClick={onDownload} variant={isDriveConfigured ? "outline" : "default"} className="w-full">
          Download Excel File
        </Button>
        <Button onClick={onReset} variant="ghost" className="w-full">
          Convert Another PDF
        </Button>
      </div>
    </div>
  );
}
