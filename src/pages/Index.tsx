
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
  const [currentPassword, setCurrentPassword] = useState("");

  const {
    file,
    isConverting,
    progress,
    conversionComplete,
    gdprConsent,
    passwordRequired,
    setFile,
    setGdprConsent,
    handleConvert,
    handleReset,
    handleDownload,
    handleOpenInDrive,
    setPasswordRequired,
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

  // Effect to handle password required state
  useEffect(() => {
    if (passwordRequired) {
      setIsPasswordDialogOpen(true);
    }
  }, [passwordRequired]);

  const handlePasswordSubmit = (password: string) => {
    setIsPasswordDialogOpen(false);
    setCurrentPassword(password);
    
    toast({
      title: "Password Applied",
      description: "Your PDF password has been applied.",
    });
    
    // Try conversion again with the password
    handleConvert(password);
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
        handleConvert={() => handleConvert(currentPassword)}
        handleReset={handleReset}
        handleDownload={handleDownload}
        handleOpenInDrive={handleOpenInDrive}
      />
      
      <PasswordDialog
        open={isPasswordDialogOpen}
        onOpenChange={(open) => {
          setIsPasswordDialogOpen(open);
          if (!open) {
            setPasswordRequired(false);
          }
        }}
        onSubmit={handlePasswordSubmit}
      />
    </div>
  );
}
