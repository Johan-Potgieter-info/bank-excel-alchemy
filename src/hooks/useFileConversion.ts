
import { useState, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import { ConvertApiService, PasswordRequiredError } from "@/services/convertApi";
import { GoogleDriveService } from "@/services/googleDrive";
import { PdfAiService } from "@/services/pdfAi";

interface UseFileConversionReturn {
  file: File | null;
  isConverting: boolean;
  progress: number;
  conversionComplete: boolean;
  downloadUrl: string;
  driveUrl: string;
  gdprConsent: boolean;
  passwordRequired: boolean;
  setFile: (file: File | null) => void;
  setGdprConsent: (consent: boolean) => void;
  handleConvert: (password?: string) => Promise<void>;
  handleAiConvert: () => Promise<void>;
  handleReset: () => void;
  handleDownload: () => void;
  handleOpenInDrive: () => void;
  setPasswordRequired: (required: boolean) => void;
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
  const [passwordRequired, setPasswordRequired] = useState(false);

  const handleConvert = useCallback(async (password?: string) => {
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
      const conversionResult = await ConvertApiService.convertPdfToExcel(
        file, 
        password, 
        setProgress
      );
      
      // Step 2: Upload the Excel file to Google Drive (if configured)
      let driveFileUrl = "";
      
      if (isDriveConfigured) {
        try {
          driveFileUrl = await GoogleDriveService.uploadFile(
            conversionResult.downloadUrl,
            conversionResult.fileName,
            setProgress
          );
          setDriveUrl(driveFileUrl);
        } catch (driveError) {
          console.error("Error uploading file to Google Drive:", driveError);
          // Don't fail the entire process, just notify the user
          toast({
            title: "Google Drive Upload Failed",
            description: "Your file was converted but couldn't be uploaded to Google Drive. You can still download it directly.",
            variant: "warning",
          });
        }
      } else {
        setProgress(100);
      }
      
      setDownloadUrl(conversionResult.downloadUrl);
      setIsConverting(false);
      setConversionComplete(true);
      setPasswordRequired(false);
      
      toast({
        title: "Conversion Complete",
        description: driveFileUrl
          ? "Your Excel file is saved to Google Drive and ready to download." 
          : "Your Excel file is ready to download.",
      });
    } catch (error) {
      console.error("Error in conversion process:", error);
      
      if (error instanceof PasswordRequiredError) {
        setIsConverting(false);
        setPasswordRequired(true);
        return;
      }
      
      setIsConverting(false);
      toast({
        title: "Conversion Failed",
        description: "There was an error converting your PDF file. Please try again.",
        variant: "destructive",
      });
    }
  }, [file, gdprConsent, isDriveConfigured, toast]);

  const handleAiConvert = useCallback(async () => {
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
      const conversionResult = await PdfAiService.convertPdfToExcel(
        file,
        setProgress
      );

      let driveFileUrl = "";

      if (isDriveConfigured) {
        try {
          driveFileUrl = await GoogleDriveService.uploadFile(
            conversionResult.downloadUrl,
            conversionResult.fileName,
            setProgress
          );
          setDriveUrl(driveFileUrl);
        } catch (driveError) {
          console.error("Error uploading file to Google Drive:", driveError);
          toast({
            title: "Google Drive Upload Failed",
            description: "Your file was converted but couldn't be uploaded to Google Drive. You can still download it directly.",
            variant: "warning",
          });
        }
      } else {
        setProgress(100);
      }

      setDownloadUrl(conversionResult.downloadUrl);
      setIsConverting(false);
      setConversionComplete(true);

      toast({
        title: "Conversion Complete",
        description: driveFileUrl
          ? "Your Excel file is saved to Google Drive and ready to download."
          : "Your Excel file is ready to download.",
      });
    } catch (error) {
      console.error("Error in AI conversion process:", error);
      setIsConverting(false);
      toast({
        title: "Conversion Failed",
        description: "There was an error converting your PDF file with AI. Please try again.",
        variant: "destructive",
      });
    }
  }, [file, gdprConsent, isDriveConfigured, toast]);

  const handleReset = useCallback(() => {
    setFile(null);
    setConversionComplete(false);
    setDownloadUrl("");
    setDriveUrl("");
    setPasswordRequired(false);
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
    passwordRequired,
    setFile,
    setGdprConsent,
    handleConvert,
    handleAiConvert,
    handleReset,
    handleDownload,
    handleOpenInDrive,
    setPasswordRequired,
  };
}
