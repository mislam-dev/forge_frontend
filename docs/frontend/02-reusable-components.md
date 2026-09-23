# Reusable Component Catalog & Form Engine

> **Document:** Reusable Component Catalog & Form Engine Specification  
> **Version:** 1.0.0  
> **Target Libraries:** shadcn/ui · React Hook Form · Zod Validation · Lucide Icons  
> **Scope:** UI primitives, form validation abstraction, data tables, deployment widgets, and log viewers  

---

## 1. Component Architecture Overview

The frontend architecture separates components into three distinct layers:

1. **UI Primitives (`components/ui/`)**: Headless, accessible primitives from shadcn/ui (Radix UI wrappers).
2. **Reusable Business Widgets (`components/shared/`)**: Domain-agnostic UI patterns (Status Badges, Encrypted Maskers, DataTables, Confirm Dialogs).
3. **Domain Feature Components (`components/modules/<domain>/`)**: Domain-specific cards, forms, headers, and logs.

---

## 2. Form Engine: React Hook Form + Zod Abstraction

All input forms throughout the dashboard leverage `react-hook-form` bound with `@hookform/resolvers/zod`.

### 2.1 Form Wrapper Pattern (`components/shared/form/FormWrapper.tsx`)

```tsx
import React from "react";
import { FieldValues, UseFormReturn, SubmitHandler } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface FormWrapperProps<TFieldValues extends FieldValues> {
  form: UseFormReturn<TFieldValues>;
  onSubmit: SubmitHandler<TFieldValues>;
  submitLabel?: string;
  isSubmitting?: boolean;
  children: React.ReactNode;
}

export function FormWrapper<TFieldValues extends FieldValues>({
  form,
  onSubmit,
  submitLabel = "Save Changes",
  isSubmitting = false,
  children,
}: FormWrapperProps<TFieldValues>) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {children}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
}
```

---

## 3. Specialized Component Specifications

### 3.1 Status Badge Component (`components/shared/StatusBadge.tsx`)

Renders deployment state with status color tokens and icons.

```tsx
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Clock, Hammer, Loader2, PlayCircle, CheckCircle2, XCircle } from "lucide-react";

export type DeploymentStatus = "Queued" | "Building" | "Deploying" | "Running" | "Success" | "Failed";

interface StatusBadgeProps {
  status: DeploymentStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  switch (status) {
    case "Queued":
      return (
        <Badge variant="outline" className="bg-slate-500/10 text-slate-400 border-slate-500/20 gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          Queued
        </Badge>
      );
    case "Building":
      return (
        <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20 gap-1.5">
          <Hammer className="w-3.5 h-3.5 animate-bounce" />
          Building
        </Badge>
      );
    case "Deploying":
      return (
        <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20 gap-1.5">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          Deploying
        </Badge>
      );
    case "Running":
      return (
        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 gap-1.5">
          <PlayCircle className="w-3.5 h-3.5 text-emerald-500" />
          Running
        </Badge>
      );
    case "Success":
      return (
        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Success
        </Badge>
      );
    case "Failed":
      return (
        <Badge variant="outline" className="bg-rose-500/10 text-rose-500 border-rose-500/20 gap-1.5">
          <XCircle className="w-3.5 h-3.5" />
          Failed
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};
```

---

### 3.2 Encrypted Value Masker Component (`components/shared/EncryptedValueMasker.tsx`)

Masks secret values (PAT tokens, DB passwords, API keys) as `"••••••••"` with a copy-to-clipboard button and eye toggle.

```tsx
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Copy, Check } from "lucide-react";

interface EncryptedValueMaskerProps {
  value: string;
  maskedPlaceholder?: string;
}

export const EncryptedValueMasker: React.FC<EncryptedValueMaskerProps> = ({
  value,
  maskedPlaceholder = "••••••••••••••••",
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-2 font-mono text-xs bg-muted/50 p-2 rounded border border-border">
      <span className="flex-1 select-all truncate">
        {isVisible ? value : maskedPlaceholder}
      </span>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-6 w-6"
        onClick={() => setIsVisible(!isVisible)}
      >
        {isVisible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-6 w-6"
        onClick={handleCopy}
      >
        {isCopied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
      </Button>
    </div>
  );
};
```

---

### 3.3 Real-Time SSE Log Viewer (`components/shared/SseLogViewer.tsx`)

Streams live build logs line by line via Server-Sent Events (SSE) with terminal styling, search filtering, and auto-scroll control.

```tsx
import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Terminal, Download, ArrowDown, Search } from "lucide-react";

interface SseLogViewerProps {
  logLines: string[];
  isConnected: boolean;
  onDownloadLogs?: () => void;
}

export const SseLogViewer: React.FC<SseLogViewerProps> = ({
  logLines,
  isConnected,
  onDownloadLogs,
}) => {
  const [filterText, setFilterText] = useState("");
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

  return (
    <div className="flex flex-col h-[500px] bg-slate-950 text-slate-100 rounded-lg border border-slate-800 overflow-hidden font-mono text-xs">
      {/* Terminal Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800">
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
            <ArrowDown className={`w-3.5 h-3.5 mr-1 ${autoScroll ? "text-emerald-400" : ""}`} />
            Auto-Scroll
          </Button>
          {onDownloadLogs && (
            <Button
              size="sm"
              variant="outline"
              className="h-8 bg-slate-900 border-slate-700 text-slate-300 hover:text-slate-100"
              onClick={onDownloadLogs}
            >
              <Download className="w-3.5 h-3.5 mr-1" />
              Download
            </Button>
          )}
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
```

---

## 4. Generic Reusable DataTable Component Specs

The dashboard utilizes `@tanstack/react-table` for data grid rendering across Organizations, Teams, Projects, and Deployment History tables:

- **Sortable Columns**: Clickable header triggers sorting.
- **Search Filter Input**: Global text filtering across columns.
- **Pagination Controls**: Page numbers, items per page selector (`10`, `25`, `50`), and next/prev buttons.
- **Empty State Container**: Custom illustration with `<PackageX>` icon and primary action CTA button.
