'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Loader2 } from 'lucide-react';

export interface ConfirmDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: React.ReactNode;
  description: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: 'destructive' | 'default';
  isLoading?: boolean;
  onConfirm: () => void | Promise<void>;
}

export function ConfirmDialog({
  isOpen,
  onOpenChange,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'destructive',
  isLoading = false,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-start gap-3">
            {variant === 'destructive' && (
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive mt-0.5">
                <AlertTriangle className="h-5 w-5" />
              </div>
            )}
            <div className="space-y-1">
              <DialogTitle className="text-base font-semibold">{title}</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
                {description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="text-xs"
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            variant={variant === 'destructive' ? 'destructive' : 'default'}
            size="sm"
            onClick={onConfirm}
            disabled={isLoading}
            className="text-xs"
          >
            {isLoading && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
