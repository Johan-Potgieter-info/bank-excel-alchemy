
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileHistory } from "@/components/FileHistory";
import { ConversionProgress } from "@/components/ConversionProgress";
import { ApiSettings } from "@/components/ApiSettings";
import { ConversionForm } from "@/components/ConversionForm";
import { ConversionComplete } from "@/components/ConversionComplete";

interface ConversionTabsProps {
  file: File | null;
  isConverting: boolean;
  progress: number;
  conversionComplete: boolean;
  gdprConsent: boolean;
  isDriveConfigured: boolean;
  setFile: (file: File | null) => void;
  setGdprConsent: (consent: boolean) => void;
  handleConvert: () => void;
  handleReset: () => void;
  handleDownload: () => void;
  handleOpenInDrive: () => void;
}

export function ConversionTabs({
  file,
  isConverting,
  progress,
  conversionComplete,
  gdprConsent,
  isDriveConfigured,
  setFile,
  setGdprConsent,
  handleConvert,
  handleReset,
  handleDownload,
  handleOpenInDrive,
}: ConversionTabsProps) {
  return (
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
  );
}
