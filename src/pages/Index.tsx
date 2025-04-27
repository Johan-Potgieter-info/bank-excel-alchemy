import React, { useState, useCallback, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileHistory } from "@/components/FileHistory";
import { ConversionProgress } from "@/components/ConversionProgress";
import { ApiSettings } from "@/components/ApiSettings";
import { ConvertApiService } from "@/services/convertApi";
import { GoogleDriveService } from "@/services/googleDrive";
import { ConversionForm } from "@/components/ConversionForm";
import { ConversionComplete } from "@/components/ConversionComplete";
import { PasswordDialog } from "@/components/PasswordDialog";

export default function Index() {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [gdprConsent, setGdprConsent] = useState(false);
  const [conversionComplete, setConversionComplete] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState("");
  const [driveUrl, setDriveUrl] = useState("");
  const [isDriveConfigured, setIsDriveConfigured] = useState(false);

  // Check if Google Drive is configured
  useEffect(() => {
    const checkDriveConfig = async () => {
      try {
        const hasAccess = await GoogleDriveService.checkFolderAccess();
        setIsDriveConfigured(hasAccess);
      } catch (error) {
        console.log("Google Drive not configured yet");
      }
    };
    
    checkDriveConfig();
  }, []);

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

  const handlePasswordSubmit = (password: string) => {
    setIsPasswordDialogOpen(false);
    toast({
      title: "Password Applied",
      description: "Your PDF password has been applied.",
    });
  };

  const handleDownload = () => {
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
  };

  const handleOpenInDrive = () => {
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
  };

  const handleReset = () => {
    setFile(null);
    setConversionComplete(false);
    setDownloadUrl("");
    setDriveUrl("");
  };

  return (
    <div className="container max-w-5xl py-8">
      <h1 className="text-3xl font-bold mb-2 text-center">Bank Excel Alchemy</h1>
      <p className="text-muted-foreground text-center mb-8">
        Convert your PDF bank statements to Excel with ease
      </p>

      <Tabs defaultValue="convert" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="convert">Convert PDF</TabsTrigger>
          <TabsTrigger value="history">File History</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="convert" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>PDF to Excel Converter</CardTitle>
              <CardDescription>
                Upload your bank statement PDF and convert it to a structured Excel file on Google Drive.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!isConverting && !conversionComplete && (
                <ConversionForm
                  file={file}
                  setFile={setFile}
                  gdprConsent={gdprConsent}
                  setGdprConsent={setGdprConsent}
                  onConvert={handleConvert}
                  isDriveConfigured={isDriveConfigured}
                />
              )}
              
              {isConverting && (
                <ConversionProgress progress={progress} />
              )}
              
              {conversionComplete && (
                <ConversionComplete
                  isDriveConfigured={isDriveConfigured}
                  onOpenInDrive={handleOpenInDrive}
                  onDownload={handleDownload}
                  onReset={handleReset}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="history">
          <FileHistory />
        </TabsContent>
        
        <TabsContent value="settings">
          <ApiSettings />
        </TabsContent>
      </Tabs>
      
      <PasswordDialog
        open={isPasswordDialogOpen}
        onOpenChange={setIsPasswordDialogOpen}
        onSubmit={handlePasswordSubmit}
      />
    </div>
  );
}
