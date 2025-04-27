
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { GoogleDriveService } from '@/services/googleDrive';
import { ExternalLink } from 'lucide-react';

export function GoogleDriveConfig() {
  const [isConfigured, setIsConfigured] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serviceAccountKey, setServiceAccountKey] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const jsonContent = event.target?.result as string;
        setServiceAccountKey(jsonContent);
      } catch (error) {
        console.error("Error parsing JSON file:", error);
        toast.error("Invalid JSON file format");
      }
    };
    reader.readAsText(file);
  };
  
  const handleConnectDrive = async () => {
    if (!serviceAccountKey) {
      toast.error("Please enter your service account key");
      return;
    }
    
    setIsLoading(true);
    try {
      // Initialize the Google Drive service
      GoogleDriveService.initialize(serviceAccountKey);
      
      // Check folder access
      const hasAccess = await GoogleDriveService.checkFolderAccess();
      if (!hasAccess) {
        throw new Error("Service account doesn't have access to the folder");
      }
      
      setIsConfigured(true);
      toast.success("Google Drive connected successfully!");
    } catch (error) {
      console.error("Failed to connect Google Drive:", error);
      toast.error("Failed to connect to Google Drive");
    } finally {
      setIsLoading(false);
    }
  };
  
  const openDriveFolder = () => {
    window.open("https://drive.google.com/drive/u/0/folders/1Dh9qpol-pEYj0BzT4EicdajGGZcx3Syr", "_blank");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Google Drive Configuration</CardTitle>
        <CardDescription>
          Connect to your Google Drive to save converted Excel files
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isConfigured ? (
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-md border border-green-200 dark:border-green-900/30">
            <p className="text-green-700 dark:text-green-400">
              ✓ Google Drive is connected and ready to receive files
            </p>
            <Button 
              variant="outline" 
              className="mt-2 flex items-center gap-2"
              onClick={openDriveFolder}
            >
              <ExternalLink className="h-4 w-4" />
              Open Drive Folder
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Paste your service account JSON key below or upload the JSON file:
              </p>
              <Textarea
                value={serviceAccountKey}
                onChange={(e) => setServiceAccountKey(e.target.value)}
                placeholder='{"type": "service_account", "project_id": "...etc}'
                className="h-40 font-mono text-xs"
              />
              <div className="flex items-center gap-2">
                <input 
                  type="file" 
                  accept=".json" 
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Upload JSON File
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
      <CardFooter>
        {!isConfigured && (
          <Button 
            onClick={handleConnectDrive} 
            disabled={isLoading || !serviceAccountKey} 
            className="w-full"
          >
            {isLoading ? "Connecting..." : "Connect Google Drive"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
