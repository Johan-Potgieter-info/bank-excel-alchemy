
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface PasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (password: string) => void;
}

export function PasswordDialog({
  open,
  onOpenChange,
  onSubmit
}: PasswordDialogProps) {
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(password);
    setPassword("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
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
  );
}
