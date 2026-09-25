'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Terminal, Download, ArrowDown, Search } from 'lucide-react';

export interface SseLogViewerProps {
  logLines: string[];
  isConnected: boolean;
  onDownloadLogs?: () => void;
}

export const SseLogViewer: React.FC<SseLogViewerProps> = ({
  logLines,
  isConnected,
  onDownloadLogs,
}) => {
  const [filterText, setFilterText] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);
  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logLines, autoScroll]);

  const filteredLines = logLines.filter((line) =>
    line.toLowerCase().includes(filterText.toLowerCase())
  );

  const handleDownload = () => {
    if (onDownloadLogs) {
      onDownloadLogs();
      return;
    }
    const blob = new Blob([logLines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `deployment-logs-${new Date().toISOString()}.log`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-[500px] bg-slate-950 text-slate-100 rounded-lg border border-slate-800 overflow-hidden font-mono text-xs">
      {/* Terminal Toolbar */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 gap-2">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-slate-400" />
          <span className="font-semibold text-slate-300">Build Console Output</span>
          {isConnected ? (
            <span className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              LIVE
            </span>
          ) : (
            <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
              OFFLINE
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative w-48">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
            <Input
              type="text"
              placeholder="Search logs..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="h-8 pl-8 bg-slate-950 border-slate-800 text-xs text-slate-200"
            />
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 text-slate-400 hover:text-slate-100"
            onClick={() => setAutoScroll(!autoScroll)}
          >
            <ArrowDown className={`w-3.5 h-3.5 mr-1 ${autoScroll ? 'text-emerald-400' : ''}`} />
            Auto-Scroll
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-8 bg-slate-900 border-slate-700 text-slate-300 hover:text-slate-100"
            onClick={handleDownload}
          >
            <Download className="w-3.5 h-3.5 mr-1" />
            Download
          </Button>
        </div>
      </div>

      {/* Terminal Output Window */}
      <div
        ref={logContainerRef}
        className="flex-1 p-4 overflow-y-auto space-y-1 selection:bg-slate-800 selection:text-slate-100"
      >
        {filteredLines.length === 0 ? (
          <div className="text-slate-600 text-center py-12">No build logs available.</div>
        ) : (
          filteredLines.map((line, idx) => (
            <div key={idx} className="flex gap-4 hover:bg-slate-900/50 px-1 py-0.5 rounded">
              <span className="text-slate-600 select-none w-10 text-right">{idx + 1}</span>
              <span className="flex-1 whitespace-pre-wrap break-all">{line}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
