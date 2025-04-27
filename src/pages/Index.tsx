
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileHistory } from "@/components/FileHistory";
import { ConversionProgress } from "@/components/ConversionProgress";
import { ApiSettings } from "@/components/ApiSettings";
import { ConversionForm } from "@/components/ConversionForm";
import { ConversionComplete } from "@/components/ConversionComplete";
import { PasswordDialog } from "@/components/PasswordDialog";
import { GoogleDriveService } from "@/services/googleDrive";
import { useFileConversion } from "@/hooks/useFileConversion";

export default function Index() {
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isDriveConfigured, setIsDriveConfigured] = useState(false);

  const {
    file,
    isConverting,
    progress,
    conversionComplete,
    gdprConsent,
    setFile,
    setGdprConsent,
    handleConvert,
    handleReset,
    handleDownload,
    handleOpenInDrive,
  } = useFileConversion(isDriveConfigured);

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

  const handlePasswordSubmit = (password: string) => {
    setIsPasswordDialogOpen(false);
    toast({
      title: "Password Applied",
      description: "Your PDF password has been applied.",
    });
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
