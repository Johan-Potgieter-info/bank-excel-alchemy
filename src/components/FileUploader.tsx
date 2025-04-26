
import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FileTextIcon, UploadIcon } from 'lucide-react';

interface FileUploaderProps {
  onDrop: (acceptedFiles: File[]) => void;
}

export function FileUploader({ onDrop }: FileUploaderProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
    multiple: false,
  });

  return (
    <div 
      {...getRootProps()} 
      className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors
        ${isDragActive 
          ? 'border-primary bg-primary/5' 
          : 'border-muted-foreground/30 hover:border-primary/50'
        }`}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-4">
        {isDragActive ? (
          <FileTextIcon className="h-16 w-16 text-primary" />
        ) : (
          <UploadIcon className="h-16 w-16 text-muted-foreground/70" />
        )}
        <div>
          <p className="font-medium">
            {isDragActive ? 'Drop the PDF here' : 'Drag & drop your PDF bank statement'}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            or click to browse files
          </p>
        </div>
        <p className="text-xs text-muted-foreground mt-4">
          Supported format: PDF
        </p>
      </div>
    </div>
  );
}
