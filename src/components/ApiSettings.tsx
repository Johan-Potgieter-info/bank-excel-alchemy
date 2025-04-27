
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GoogleDriveConfig } from '@/components/GoogleDriveConfig';
import { Separator } from '@/components/ui/separator';

export function ApiSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>API Settings</CardTitle>
        <CardDescription>
          Configure your API connections and credentials
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Google Drive Configuration */}
        <GoogleDriveConfig />
        
        <Separator />
        
        {/* ConvertAPI Configuration */}
        <div>
          <h3 className="text-lg font-medium mb-2">ConvertAPI</h3>
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-md border border-green-200 dark:border-green-900/30">
            <p className="text-green-700 dark:text-green-400">
              ✓ ConvertAPI is configured and ready
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Your secret key is securely stored and will be used for PDF to Excel conversions.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
