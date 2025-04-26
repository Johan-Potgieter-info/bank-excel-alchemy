
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Link } from 'react-router-dom';
import { Info } from 'lucide-react';

interface GdprConsentProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export function GdprConsent({ checked, onCheckedChange }: GdprConsentProps) {
  return (
    <div className="flex items-start space-x-2 bg-muted/40 p-4 rounded-md">
      <Checkbox 
        id="gdpr" 
        checked={checked} 
        onCheckedChange={onCheckedChange} 
        className="mt-1"
      />
      <div>
        <label
          htmlFor="gdpr"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-1"
        >
          I consent to the processing of my data
          <HoverCard>
            <HoverCardTrigger asChild>
              <Info className="h-4 w-4 cursor-help text-muted-foreground" />
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">GDPR Compliance Information</h4>
                <div className="text-xs space-y-2">
                  <p>Under the GDPR, we process your data under these principles:</p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>Your data is only used for the conversion process</li>
                    <li>Files are automatically deleted after 24 hours</li>
                    <li>No personal data is shared with third parties</li>
                    <li>You can request deletion at any time</li>
                    <li>Your data is encrypted in transit and at rest</li>
                  </ul>
                </div>
              </div>
            </HoverCardContent>
          </HoverCard>
        </label>
        <p className="text-xs text-muted-foreground mt-1">
          By checking this box, you agree to our{' '}
          <Link to="/privacy" className="text-primary hover:underline">
            Privacy Policy
          </Link>{' '}
          and allow us to process your data in accordance with GDPR.
        </p>
      </div>
    </div>
  );
}
