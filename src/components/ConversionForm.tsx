
import React, { useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { FileUploader } from "@/components/FileUploader";
import { FileCard } from "@/components/FileCard";
import { GdprConsent } from "@/components/GdprConsent";
import { useToast } from "@/hooks/use-toast";

interface ConversionFormProps {
  file: File | null;
  setFile: (file: File | null) => void;
  gdprConsent: boolean;
  setGdprConsent: (consent: boolean) => void;
  onConvert: () => void;
  isDriveConfigured: boolean;
}

export function ConversionForm({
  file,
  setFile,
  gdprConsent,
  setGdprConsent,
  onConvert,
  isDriveConfigured
}: ConversionFormProps) {
  const { toast } = useToast();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      if (selectedFile.type === "application/pdf") {
        setFile(selectedFile);
        toast({
          title: "File selected",
          description: `${selectedFile.name} is ready for conversion.`,
        });
      } else {
        toast({
          title: "Invalid file",
          description: "Please upload a PDF file.",
          variant: "destructive",
        });
      }
    }
  }, [setFile, toast]);

  return (
    <>
      {!isDriveConfigured && (
        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-md border border-amber-200 dark:border-amber-900/30 mb-4">
          <p className="text-amber-700 dark:text-amber-400 text-sm">
            ⚠️ Google Drive is not configured. Your files will be available for download only and won't be saved to Google Drive.
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2"
            onClick={() => document.querySelector('[data-value="settings"]')?.dispatchEvent(new MouseEvent('click'))}
          >
            Configure Google Drive
          </Button>
        </div>
      )}
      
      {!file && (
        <FileUploader onDrop={onDrop} />
      )}
      
      {file && (
        <FileCard file={file} onRemove={() => setFile(null)} />
      )}
      
      <GdprConsent 
        checked={gdprConsent} 
        onCheckedChange={setGdprConsent} 
      />

      {file && (
        <Button onClick={onConvert} className="w-full mt-4">
          Convert to Excel
        </Button>
      )}
    </>
  );
}
