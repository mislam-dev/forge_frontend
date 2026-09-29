'use client';

import React, { useMemo, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
  User,
  Check,
} from 'lucide-react';
import { useOrganizationsList } from '@/lib/hooks/api/useOrganizations';
import { useUserProfile } from '@/lib/hooks/api/useUserProfile';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { OrganizationDTO } from '@/lib/api/types';

const navItems = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Projects', href: '/projects', icon: FolderGit2 },
  { name: 'Teams', href: '/teams', icon: Users },
  { name: 'Notifications', href: '/notifications', icon: Bell },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const {
    isSidebarCollapsed,
    toggleSidebar,
    activeOrgId,
    activeOrgName,
    setOrganizationWorkspace,
    setPersonalWorkspace,
  } = useWorkspaceStore();

  const { data: orgs = [], isLoading: isOrgsLoading } = useOrganizationsList();
  const { data: userProfile } = useUserProfile();

  const navigateForWorkspaceSwitch = (isPersonalTarget: boolean, targetOrgId?: string) => {
    if (isPersonalTarget) {
      // If switching to personal workspace from projects, teams, or organizations -> redirect to /dashboard
      if (
        pathname.startsWith('/projects') ||
        pathname.startsWith('/teams') ||
        pathname.startsWith('/organizations')
      ) {
        router.push('/dashboard');
      }
    } else {
      // Switching to an organization workspace
      if (pathname.startsWith('/projects/')) {
        // Inside child project route (/projects/:id, /projects/:id/*, /projects/new) -> redirect to parent /projects
        router.push('/projects');
      } else if (pathname.startsWith('/teams/')) {
        // Inside child team route (/teams/:id/members, /teams/new) -> redirect to parent /teams
        router.push('/teams');
      } else if (pathname.startsWith('/organizations/') && targetOrgId) {
        router.push(`/organizations/${targetOrgId}`);
      }
    }
  };

  // Validate activeOrgId against loaded organizations; if stale, reset to personal profile
  useEffect(() => {
    if (!isOrgsLoading && activeOrgId) {
      const orgExists = orgs.some((org) => org.id === activeOrgId);
      if (!orgExists && orgs.length > 0) {
        setPersonalWorkspace();
        queryClient.invalidateQueries();
        navigateForWorkspaceSwitch(true);
      }
    }
  }, [isOrgsLoading, activeOrgId, orgs, setPersonalWorkspace]);

  // Compute personal user display name
  const personalDisplayName = useMemo(() => {
    if (userProfile?.first_name || userProfile?.last_name) {
      return [userProfile.first_name, userProfile.last_name].filter(Boolean).join(' ');
    }
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('forge_user_profile');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed.name) return parsed.name;
        } catch {}
      }
    }
    return 'Personal Profile';
  }, [userProfile]);

  const personalSubtitle = useMemo(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('forge_user_profile');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed.email) return parsed.email;
        } catch {}
      }
    }
    return 'Personal Account';
  }, []);

  const isPersonal = !activeOrgId;
  const currentOrgName = activeOrgName || orgs.find((o) => o.id === activeOrgId)?.name || 'Organization';

  const visibleNavItems = useMemo(() => {
    if (isPersonal) {
      return navItems.filter((item) => item.name !== 'Teams');
    }
    return navItems;
  }, [isPersonal]);

  const handleSelectPersonal = () => {
    if (activeOrgId !== null) {
      setPersonalWorkspace();
      queryClient.invalidateQueries();
      navigateForWorkspaceSwitch(true);
    }
  };

  const handleSelectOrg = (org: OrganizationDTO) => {
    if (activeOrgId !== org.id) {
      setOrganizationWorkspace(org.id, org.name);
      queryClient.invalidateQueries();
      navigateForWorkspaceSwitch(false, org.id);
    }
  };

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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            {isSidebarCollapsed ? (
              <Button
                variant="ghost"
                className="flex h-10 w-10 p-0 mx-auto items-center justify-center rounded-lg bg-muted text-xs font-bold text-foreground border border-border hover:bg-muted/80"
                title={isPersonal ? `Personal: ${personalDisplayName}` : `Org: ${currentOrgName}`}
              >
                {isPersonal ? (
                  <User className="h-4 w-4 text-primary" />
                ) : (
                  currentOrgName.slice(0, 2).toUpperCase()
                )}
              </Button>
            ) : (
              <Button
                variant="outline"
                className="w-full justify-between h-10 px-3 bg-muted/40 border-border text-left font-normal"
              >
                <div className="flex items-center gap-2 truncate">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-primary/20 text-primary text-xs font-bold">
                    {isPersonal ? (
                      <User className="h-3.5 w-3.5" />
                    ) : (
                      currentOrgName.slice(0, 1).toUpperCase()
                    )}
                  </div>
                  <div className="flex flex-col truncate leading-tight text-left">
                    <span className="text-xs font-semibold truncate">
                      {isPersonal ? personalDisplayName : currentOrgName}
                    </span>
                    <span className="text-[10px] text-muted-foreground truncate">
                      {isPersonal ? 'Personal Profile' : 'Organization'}
                    </span>
                  </div>
                </div>
                <ChevronDown className="h-3.5 w-3.5 opacity-60 shrink-0 ml-1" />
              </Button>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-60" align="start">
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Personal Account
            </DropdownMenuLabel>
            <DropdownMenuItem
              onClick={handleSelectPersonal}
              className={cn(
                'cursor-pointer flex items-center justify-between',
                isPersonal && 'bg-accent font-medium'
              )}
            >
              <div className="flex items-center gap-2 truncate">
                <User className="h-4 w-4 shrink-0 text-primary" />
                <div className="flex flex-col truncate">
                  <span className="text-xs font-medium truncate">{personalDisplayName}</span>
                  <span className="text-[10px] text-muted-foreground truncate">{personalSubtitle}</span>
                </div>
              </div>
              {isPersonal && <Check className="h-4 w-4 text-primary shrink-0" />}
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Organizations
            </DropdownMenuLabel>
            {orgs.map((org) => {
              const isSelected = activeOrgId === org.id;
              return (
                <DropdownMenuItem
                  key={org.id}
                  onClick={() => handleSelectOrg(org)}
                  className={cn(
                    'cursor-pointer flex items-center justify-between',
                    isSelected && 'bg-accent font-medium'
                  )}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Building2 className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="truncate text-xs">{org.name}</span>
                  </div>
                  {isSelected && <Check className="h-4 w-4 text-primary shrink-0" />}
                </DropdownMenuItem>
              );
            })}
            {orgs.length === 0 && !isOrgsLoading && (
              <div className="px-2 py-1.5 text-xs text-muted-foreground italic">
                No organizations found
              </div>
            )}

            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link
                href="/organizations/new"
                className="flex items-center cursor-pointer text-primary text-xs"
              >
                <Plus className="mr-2 h-4 w-4" />
                <span>Create Organization</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1.5 p-2 overflow-y-auto">
        {visibleNavItems.map((item) => {
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
