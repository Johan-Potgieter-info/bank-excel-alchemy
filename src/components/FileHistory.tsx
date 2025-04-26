
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileIcon, DownloadIcon, Trash2Icon, FileSpreadsheet, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Mock data for demonstration
const mockFiles = [
  { 
    id: '1',
    originalName: 'BankStatement_January2023.pdf',
    convertedName: 'BankStatement_January2023.xlsx',
    date: '2025-04-25T14:32:00',
    size: '2.4 MB',
    driveLink: 'https://drive.google.com/file/d/1abc123/view'
  },
  { 
    id: '2',
    originalName: 'BankStatement_February2023.pdf',
    convertedName: 'BankStatement_February2023.xlsx',
    date: '2025-04-23T09:15:00',
    size: '1.8 MB',
    driveLink: 'https://drive.google.com/file/d/2def456/view'
  },
  { 
    id: '3',
    originalName: 'BankStatement_March2023.pdf',
    convertedName: 'BankStatement_March2023.xlsx', 
    date: '2025-04-21T16:45:00',
    size: '2.1 MB',
    driveLink: 'https://drive.google.com/file/d/3ghi789/view'
  }
];

export function FileHistory() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Conversions</CardTitle>
        <CardDescription>
          Your recently converted files are saved to Google Drive for 24 hours before automatic deletion.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {mockFiles.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <p>No conversion history found.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {mockFiles.map(file => (
              <div key={file.id} className="flex items-center justify-between p-3 border rounded-md bg-card">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="bg-primary/10 p-2 rounded-md">
                    <FileSpreadsheet className="h-5 w-5 text-primary" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="font-medium truncate" title={file.convertedName}>
                      {file.convertedName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(file.date).toLocaleDateString()} • {file.size}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="icon" title="Download file">
                    <DownloadIcon className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    title="Open in Google Drive"
                    onClick={() => window.open(file.driveLink, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" title="Delete file">
                    <Trash2Icon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
