
import React, { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileUploader } from "@/components/FileUploader";
import { FileCard } from "@/components/FileCard";
import { GdprConsent } from "@/components/GdprConsent";
import { FileHistory } from "@/components/FileHistory";
import { ConversionProgress } from "@/components/ConversionProgress";
import { ExternalLink } from "lucide-react";
import { ApiSettings } from "@/components/ApiSettings";
import { ConvertApiService } from "@/services/convertApi";
import { GoogleDriveService } from "@/services/googleDrive";

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

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      if (selectedFile.type === "application/pdf") {
        setFile(selectedFile);
        toast({
          title: "File selected",
          description: `${selectedFile.name} is ready for conversion.`,
        });
        
        // Simulate checking if file is password protected
        if (Math.random() > 0.7) {
          setIsPasswordDialogOpen(true);
        }
      } else {
        toast({
          title: "Invalid file",
          description: "Please upload a PDF file.",
          variant: "destructive",
        });
      }
    }
  }, [toast]);

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
      
      // Set the download URL from the conversion result
      setDownloadUrl(conversionResult.downloadUrl);
      
      // Complete the process
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

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
    
    // Open the download URL in a new tab
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
    // Reset the process
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
              {!isDriveConfigured && !isConverting && !conversionComplete && (
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
              
              {!file && !isConverting && !conversionComplete && (
                <FileUploader onDrop={onDrop} />
              )}
              
              {file && !isConverting && !conversionComplete && (
                <FileCard file={file} onRemove={() => setFile(null)} />
              )}
              
              {isConverting && (
                <ConversionProgress progress={progress} />
              )}
              
              {conversionComplete && (
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
                      <Button onClick={handleOpenInDrive} className="w-full flex items-center justify-center gap-2">
                        <ExternalLink className="h-4 w-4" /> 
                        Open in Google Drive
                      </Button>
                    )}
                    <Button onClick={handleDownload} variant={isDriveConfigured ? "outline" : "default"} className="w-full">
                      Download Excel File
                    </Button>
                    <Button onClick={handleReset} variant="ghost" className="w-full">
                      Convert Another PDF
                    </Button>
                  </div>
                </div>
              )}
              
              <GdprConsent 
                checked={gdprConsent} 
                onCheckedChange={setGdprConsent} 
              />
            </CardContent>
            <CardFooter>
              {file && !isConverting && !conversionComplete && (
                <Button onClick={handleConvert} className="w-full">
                  Convert to Excel
                </Button>
              )}
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="history">
          <FileHistory />
        </TabsContent>
        
        <TabsContent value="settings">
          <ApiSettings />
        </TabsContent>
      </Tabs>
      
      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent>
          <form onSubmit={handlePasswordSubmit}>
            <DialogHeader>
              <DialogTitle>PDF Password Required</DialogTitle>
              <DialogDescription>
                This PDF appears to be password protected. Please enter the password to proceed.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2"
                placeholder="Enter PDF password" 
              />
            </div>
            <DialogFooter>
              <Button type="submit">Apply Password</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
