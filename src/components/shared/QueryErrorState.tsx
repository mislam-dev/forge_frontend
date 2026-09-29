'use client';

import React from 'react';
import { WifiOff, AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { extractApiErrorMessage } from '@/lib/api/client';
import { cn } from '@/lib/utils';

export interface QueryErrorStateProps {
  title?: string;
  message?: string;
  error?: unknown;
  onRetry?: () => void;
  isRetrying?: boolean;
  compact?: boolean;
  className?: string;
}

export function QueryErrorState({
  title = 'Failed to load data',
  message,
  error,
  onRetry,
  isRetrying = false,
  compact = false,
  className,
}: QueryErrorStateProps) {
  const displayMessage =
    message ||
    (error ? extractApiErrorMessage(error) : 'Unable to connect to server. Please check your network connection.');

  const isNetworkFailure =
    displayMessage.toLowerCase().includes('network') ||
    displayMessage.toLowerCase().includes('connect') ||
    displayMessage.toLowerCase().includes('offline');

  const Icon = isNetworkFailure ? WifiOff : AlertTriangle;

  if (compact) {
    return (
      <div
        className={cn(
          'flex items-center justify-between gap-3 p-3 rounded-lg border border-destructive/30 bg-destructive/5 text-xs',
          className
        )}
      >
        <div className="flex items-center gap-2 min-w-0">
          <Icon className="h-4 w-4 text-destructive shrink-0" />
          <p className="text-foreground truncate">{displayMessage}</p>
        </div>
        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            disabled={isRetrying}
            className="h-7 px-2.5 text-xs shrink-0"
          >
            <RefreshCw className={cn('h-3 w-3 mr-1', isRetrying && 'animate-spin')} />
            Retry
          </Button>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-2xl border border-dashed border-destructive/40 bg-destructive/5 p-8 sm:p-12 text-center space-y-4 max-w-xl mx-auto my-6',
        className
      )}
    >
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
        <Icon className="h-7 w-7" />
      </div>

      <div className="space-y-1.5">
        <h3 className="font-semibold text-lg text-foreground tracking-tight">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
          {displayMessage}
        </p>
      </div>

      {onRetry && (
        <div className="pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            disabled={isRetrying}
            className="border-destructive/30 hover:bg-destructive/10 text-destructive-foreground"
          >
            <RefreshCw className={cn('mr-2 h-4 w-4', isRetrying && 'animate-spin')} />
            {isRetrying ? 'Retrying...' : 'Try Again'}
          </Button>
        </div>
      )}
    </div>
  );
}
