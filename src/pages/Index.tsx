
import React, { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { ConversionTabs } from "@/components/ConversionTabs";
import { PasswordDialog } from "@/components/PasswordDialog";
import { GoogleDriveService } from "@/services/googleDrive";
import { useFileConversion } from "@/hooks/useFileConversion";

export default function Index() {
  const { toast } = useToast();
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

      <ConversionTabs
        file={file}
        isConverting={isConverting}
        progress={progress}
        conversionComplete={conversionComplete}
        gdprConsent={gdprConsent}
        isDriveConfigured={isDriveConfigured}
        setFile={setFile}
        setGdprConsent={setGdprConsent}
        handleConvert={handleConvert}
        handleReset={handleReset}
        handleDownload={handleDownload}
        handleOpenInDrive={handleOpenInDrive}
      />
      
      <PasswordDialog
        open={isPasswordDialogOpen}
        onOpenChange={setIsPasswordDialogOpen}
        onSubmit={handlePasswordSubmit}
      />
    </div>
  );
}
