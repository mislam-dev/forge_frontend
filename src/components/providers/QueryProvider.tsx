'use client';

import React, { useState } from 'react';
import {
  QueryClient,
  QueryClientProvider,
  QueryCache,
  MutationCache,
} from '@tanstack/react-query';
import { toast } from '@/components/ui/use-toast';
import { extractApiErrorMessage } from '@/lib/api/client';

interface QueryProviderProps {
  children: React.ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError: (error) => {
            const message = extractApiErrorMessage(error);
            const isNetworkError =
              message.toLowerCase().includes('network') ||
              message.toLowerCase().includes('connect') ||
              message.toLowerCase().includes('offline');

            if (isNetworkError) {
              toast({
                title: 'Network Connection Error',
                description: message,
                variant: 'destructive',
              });
            }
          },
        }),
        mutationCache: new MutationCache({
          onError: (error) => {
            const message = extractApiErrorMessage(error);
            toast({
              title: 'Action Failed',
              description: message,
              variant: 'destructive',
            });
          },
        }),
        defaultOptions: {
          queries: {
            staleTime: 30 * 1000, // 30 seconds
            gcTime: 5 * 60 * 1000, // 5 minutes
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
