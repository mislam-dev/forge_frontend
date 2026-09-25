'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useWorkspaceStore } from '@/lib/store/useWorkspaceStore';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  FolderGit2,
  Building2,
  Users,
  Bell,
  Settings,
  ChevronDown,
  Layers,
  ChevronLeft,
  ChevronRight,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const navItems = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Projects', href: '/projects', icon: FolderGit2 },
  { name: 'Organizations', href: '/organizations', icon: Building2 },
  { name: 'Teams', href: '/teams', icon: Users },
  { name: 'Notifications', href: '/notifications', icon: Bell },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const {
    isSidebarCollapsed,
    toggleSidebar,
    activeOrgId,
    activeOrgName,
    setActiveOrgId,
    setActiveOrgName,
  } = useWorkspaceStore();

  const currentOrgName = activeOrgName || 'Acme Platform';

  const mockOrgs = [
    { id: 'org-1', name: 'Acme Platform' },
    { id: 'org-2', name: 'DevOps Engineers Inc' },
    { id: 'org-3', name: 'Personal Workspace' },
  ];

  return (
    <aside
      className={cn(
        'relative flex flex-col border-r border-border bg-card/60 backdrop-blur-md transition-all duration-300 select-none z-30',
        isSidebarCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between border-b border-border px-3">
        <Link
          href="/dashboard"
          className={cn(
            'flex items-center gap-2.5 overflow-hidden transition-all',
            isSidebarCollapsed ? 'justify-center w-full' : 'px-1'
          )}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow">
            <Layers className="h-5 w-5" />
          </div>
          {!isSidebarCollapsed && (
            <span className="font-bold text-base tracking-tight truncate">
              Forge
            </span>
          )}
        </Link>
      </div>

      {/* Tenant / Organization Switcher */}
      <div className="p-3 border-b border-border">
        {isSidebarCollapsed ? (
          <div
            className="flex h-10 w-10 mx-auto items-center justify-center rounded-lg bg-muted text-xs font-bold text-foreground border border-border"
            title={currentOrgName}
          >
            {currentOrgName.slice(0, 2).toUpperCase()}
          </div>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between h-10 px-3 bg-muted/40 border-border text-left font-normal"
              >
                <div className="flex items-center gap-2 truncate">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-primary/20 text-primary text-xs font-bold">
                    {currentOrgName.slice(0, 1).toUpperCase()}
                  </div>
                  <span className="text-xs font-semibold truncate">
                    {currentOrgName}
                  </span>
                </div>
                <ChevronDown className="h-3.5 w-3.5 opacity-60 shrink-0" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="start">
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                Switch Organization
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {mockOrgs.map((org) => (
                <DropdownMenuItem
                  key={org.id}
                  onClick={() => {
                    setActiveOrgId(org.id);
                    setActiveOrgName(org.name);
                  }}
                  className="cursor-pointer"
                >
                  <Building2 className="mr-2 h-4 w-4" />
                  <span className="truncate">{org.name}</span>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link
                  href="/organizations"
                  className="flex items-center cursor-pointer text-primary"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  <span>Create Organization</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1.5 p-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              title={isSidebarCollapsed ? item.name : undefined}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                isSidebarCollapsed && 'justify-center px-0'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!isSidebarCollapsed && (
                <span className="truncate">{item.name}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Collapse Toggle Footer */}
      <div className="border-t border-border p-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSidebar}
          className={cn(
            'w-full text-muted-foreground hover:text-foreground text-xs',
            isSidebarCollapsed ? 'justify-center px-0' : 'justify-between px-3'
          )}
          title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {!isSidebarCollapsed && <span>Collapse Sidebar</span>}
          {isSidebarCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>
    </aside>
  );
}
