
import { useState, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import { ConvertApiService } from "@/services/convertApi";
import { GoogleDriveService } from "@/services/googleDrive";

interface UseFileConversionReturn {
  file: File | null;
  isConverting: boolean;
  progress: number;
  conversionComplete: boolean;
  downloadUrl: string;
  driveUrl: string;
  gdprConsent: boolean;
  setFile: (file: File | null) => void;
  setGdprConsent: (consent: boolean) => void;
  handleConvert: () => Promise<void>;
  handleReset: () => void;
  handleDownload: () => void;
  handleOpenInDrive: () => void;
}

export function useFileConversion(isDriveConfigured: boolean): UseFileConversionReturn {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [conversionComplete, setConversionComplete] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState("");
  const [driveUrl, setDriveUrl] = useState("");
  const [gdprConsent, setGdprConsent] = useState(false);

  const handleConvert = useCallback(async () => {
    if (!gdprConsent) {
      toast({
        title: "GDPR Consent Required",
        description: "Please consent to our data processing policy before proceeding.",
        variant: "destructive",
      });
      return;
    }

    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a file first.",
        variant: "destructive",
      });
      return;
    }

    setIsConverting(true);
    setProgress(0);

    try {
      // Step 1: Convert PDF to Excel using ConvertAPI
      const conversionResult = await ConvertApiService.convertPdfToExcel(file, setProgress);
      
      // Step 2: Upload the Excel file to Google Drive (if configured)
      if (isDriveConfigured) {
        const driveFileUrl = await GoogleDriveService.uploadFile(
          conversionResult.downloadUrl,
          conversionResult.fileName,
          setProgress
        );
        setDriveUrl(driveFileUrl);
      } else {
        setProgress(100);
      }
      
      setDownloadUrl(conversionResult.downloadUrl);
      setIsConverting(false);
      setConversionComplete(true);
      
      toast({
        title: "Conversion Complete",
        description: isDriveConfigured 
          ? "Your Excel file is saved to Google Drive and ready to download." 
          : "Your Excel file is ready to download.",
      });
    } catch (error) {
      console.error("Error in conversion process:", error);
      setIsConverting(false);
      toast({
        title: "Conversion Failed",
        description: "There was an error converting your PDF file. Please try again.",
        variant: "destructive",
      });
    }
  }, [file, gdprConsent, isDriveConfigured, toast]);

  const handleReset = useCallback(() => {
    setFile(null);
    setConversionComplete(false);
    setDownloadUrl("");
    setDriveUrl("");
  }, []);

  const handleDownload = useCallback(() => {
    if (!downloadUrl) {
      toast({
        title: "Download URL not available",
        description: "Please convert the file first.",
        variant: "destructive",
      });
      return;
    }
    
    window.open(downloadUrl, '_blank');
    
    toast({
      title: "Download Started",
      description: "Your Excel file is being downloaded.",
    });
  }, [downloadUrl, toast]);

  const handleOpenInDrive = useCallback(() => {
    if (!driveUrl) {
      toast({
        title: "Drive URL not available",
        description: "The file is not available in Google Drive.",
        variant: "destructive",
      });
      return;
    }
    
    window.open(driveUrl, '_blank');
    
    toast({
      title: "Opening Google Drive",
      description: "Your Excel file is opening in Google Drive.",
    });
  }, [driveUrl, toast]);

  return {
    file,
    isConverting,
    progress,
    conversionComplete,
    downloadUrl,
    driveUrl,
    gdprConsent,
    setFile,
    setGdprConsent,
    handleConvert,
    handleReset,
    handleDownload,
    handleOpenInDrive,
  };
}
