import React from 'react';
import Link from 'next/link';
import { Layers } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen flex flex-col justify-between items-center bg-background p-4 sm:p-8">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:32px_32px] pointer-events-none" />

      {/* Header with Brand Logo */}
      <header className="relative z-10 w-full max-w-md pt-8 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow transition-transform group-hover:scale-105">
            <Layers className="h-5 w-5" />
          </div>
          <span className="font-bold text-lg tracking-tight">Forge</span>
        </Link>
        <Badge variant="outline" className="text-xs bg-muted/50 border-border">
          Cloud Platform
        </Badge>
      </header>

      {/* Main centered card */}
      <main className="relative z-10 w-full max-w-md my-auto py-8">
        <div className="rounded-xl border border-border bg-card p-6 sm:p-8 shadow-xl">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-md pb-6 text-center text-xs text-muted-foreground">
        <div className="flex justify-center gap-4">
          <Link href="#" className="hover:underline">Documentation</Link>
          <span>•</span>
          <Link href="#" className="hover:underline">Privacy Policy</Link>
          <span>•</span>
          <Link href="#" className="hover:underline">Terms of Service</Link>
        </div>
        <p className="mt-2 text-[11px] opacity-70">
          © {new Date().getFullYear()} Forge Platform Inc. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
