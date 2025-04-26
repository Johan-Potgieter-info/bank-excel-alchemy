
import React, { useState, useCallback } from "react";
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

  const handleConvert = useCallback(() => {
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

    // Simulate API call and conversion process
    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + Math.random() * 15;
        if (newProgress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsConverting(false);
            setConversionComplete(true);
            setDownloadUrl(`#${file.name.replace(".pdf", ".xlsx")}`);
            // Simulate Google Drive URL
            setDriveUrl(`https://drive.google.com/file/d/${Math.random().toString(36).substring(2, 15)}/view`);
            toast({
              title: "Conversion Complete",
              description: "Your Excel file is saved to Google Drive and ready to download.",
            });
          }, 500);
          return 100;
        }
        return newProgress;
      });
    }, 600);
  }, [file, gdprConsent, toast]);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsPasswordDialogOpen(false);
    toast({
      title: "Password Applied",
      description: "Your PDF password has been applied.",
    });
  };

  const handleDownload = () => {
    toast({
      title: "Download Started",
      description: "Your Excel file is being downloaded.",
    });
    
    // In a real app, we would use the actual download URL
    setTimeout(() => {
      toast({
        title: "Download Complete",
        description: "Your Excel file has been saved to your device.",
      });
    }, 1500);
  };

  const handleOpenInDrive = () => {
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
                    Your bank statement has been successfully converted to Excel and saved to Google Drive.
                  </p>
                  <div className="space-y-3">
                    <Button onClick={handleOpenInDrive} className="w-full flex items-center justify-center gap-2">
                      <ExternalLink className="h-4 w-4" /> 
                      Open in Google Drive
                    </Button>
                    <Button onClick={handleDownload} variant="outline" className="w-full">
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
          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
              <CardDescription>
                Configure your conversion preferences and Google Drive settings.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Settings functionality will be implemented in a future update.
              </p>
            </CardContent>
          </Card>
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
