'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { simulateBuildStream } from '../api/mock/stream';

export interface UseSseStreamOptions {
  url: string;
  enabled?: boolean;
  maxBufferLines?: number;
  enableSimulationFallback?: boolean;
}

export interface UseSseStreamReturn {
  logLines: string[];
  isConnected: boolean;
  isReconnecting: boolean;
  error: Error | null;
  clearLogs: () => void;
}

export function useSseStream({
  url,
  enabled = true,
  maxBufferLines = 5000,
  enableSimulationFallback = true,
}: UseSseStreamOptions): UseSseStreamReturn {
  const [logLines, setLogLines] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const stopSimulationRef = useRef<(() => void) | null>(null);

  const appendLine = useCallback(
    (line: string) => {
      setLogLines((prev) => {
        const next = [...prev, line];
        if (next.length > maxBufferLines) {
          return next.slice(next.length - maxBufferLines);
        }
        return next;
      });
    },
    [maxBufferLines]
  );

  const connect = useCallback(() => {
    if (typeof window === 'undefined' || !enabled || !url) return;

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
    if (stopSimulationRef.current) {
      stopSimulationRef.current();
      stopSimulationRef.current = null;
    }

    const isMockEnabled = process.env.NEXT_PUBLIC_ENABLE_MOCKS === 'true';
    if (isMockEnabled && enableSimulationFallback) {
      setIsConnected(true);
      setIsReconnecting(false);
      stopSimulationRef.current = simulateBuildStream(appendLine);
      return;
    }

    const token = localStorage.getItem('forge_access_token');
    const separator = url.includes('?') ? '&' : '?';
    const sseUrl = token ? `${url}${separator}token=${encodeURIComponent(token)}` : url;

    try {
      const eventSource = new EventSource(sseUrl);
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        setIsConnected(true);
        setIsReconnecting(false);
        setError(null);
        reconnectAttemptsRef.current = 0;
      };

      const handleMessage = (data: string) => {
        try {
          const parsed = JSON.parse(data);
          const message = parsed.message || parsed.line || (typeof parsed === 'string' ? parsed : JSON.stringify(parsed));
          appendLine(message);
        } catch {
          appendLine(data);
        }
      };

      eventSource.onmessage = (event) => {
        handleMessage(event.data);
      };

      eventSource.addEventListener('log', (event: MessageEvent) => {
        handleMessage(event.data);
      });

      eventSource.addEventListener('status', (event: MessageEvent) => {
        try {
          const parsed = JSON.parse(event.data);
          appendLine(`[Status Update] ${parsed.status || event.data}`);
        } catch {
          appendLine(`[Status Update] ${event.data}`);
        }
      });

      eventSource.onerror = () => {
        setIsConnected(false);
        eventSource.close();
        eventSourceRef.current = null;

        if (reconnectAttemptsRef.current < 2) {
          setIsReconnecting(true);
          const delay = Math.min(1000 * 2 ** reconnectAttemptsRef.current, 10000);
          reconnectAttemptsRef.current += 1;
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        } else if (enableSimulationFallback) {
          // Fall back gracefully to mock log emitter
          setIsReconnecting(false);
          setIsConnected(true);
          appendLine('\x1b[33m[Notice] Live SSE backend unavailable. Switched to offline simulated build stream.\x1b[0m');
          stopSimulationRef.current = simulateBuildStream(appendLine);
        } else {
          setIsReconnecting(false);
          setError(new Error('SSE connection failed after maximum retry attempts'));
        }
      };
    } catch (err) {
      if (enableSimulationFallback) {
        setIsConnected(true);
        stopSimulationRef.current = simulateBuildStream(appendLine);
      } else {
        setIsConnected(false);
        setError(err instanceof Error ? err : new Error('Failed to initialize EventSource'));
      }
    }
  }, [enabled, url, enableSimulationFallback, appendLine]);

  useEffect(() => {
    connect();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (stopSimulationRef.current) {
        stopSimulationRef.current();
        stopSimulationRef.current = null;
      }
      setIsConnected(false);
      setIsReconnecting(false);
    };
  }, [connect]);

  const clearLogs = useCallback(() => {
    setLogLines([]);
  }, []);

  return {
    logLines,
    isConnected,
    isReconnecting,
    error,
    clearLogs,
  };
}
