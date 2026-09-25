'use client';

import React from 'react';
import { useWorkspaceStore } from '@/lib/store/useWorkspaceStore';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { UserNav } from '@/components/layout/UserNav';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PanelLeft, Bell } from 'lucide-react';
import Link from 'next/link';

export function Topbar() {
  const { toggleSidebar } = useWorkspaceStore();

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-border bg-background/80 px-4 sm:px-6 backdrop-blur-md">
      {/* Left section: Collapse Toggle & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          aria-label="Toggle navigation sidebar"
        >
          <PanelLeft className="h-4 w-4" />
        </Button>
        <div className="hidden sm:block h-4 w-px bg-border" />
        <Breadcrumbs />
      </div>

      {/* Right section: Environment, Notifications, User Nav */}
      <div className="flex items-center gap-2 sm:gap-3">
        <Badge
          variant="outline"
          className="hidden md:inline-flex text-[11px] font-mono font-medium bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
        >
          Production
        </Badge>

        <Button
          variant="ghost"
          size="icon"
          asChild
          className="relative h-9 w-9 text-muted-foreground hover:text-foreground"
          aria-label="Notifications"
        >
          <Link href="/notifications">
            <Bell className="h-4 w-4" />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary" />
          </Link>
        </Button>

        <div className="h-6 w-px bg-border mx-1" />

        <UserNav />
      </div>
    </header>
  );
}
