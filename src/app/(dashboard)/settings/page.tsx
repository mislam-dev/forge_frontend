'use client';

import React from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { SettingsHeader } from '@/components/settings/SettingsHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useUserProfile, useActiveSessions } from '@/lib/hooks/api/useUserProfile';
import { useWorkspaceStore } from '@/lib/store/useWorkspaceStore';
import {
  User,
  ShieldCheck,
  Bell,
  Building2,
  ChevronRight,
  Shield,
  KeyRound,
  Laptop,
  CheckCircle2,
  Sun,
  Moon,
  Monitor,
  Globe,
  Sliders,
  Sparkles,
} from 'lucide-react';

export default function SettingsOverviewPage() {
  const { theme, setTheme } = useTheme();
  const { data: profile, isLoading: isProfileLoading } = useUserProfile();
  const { data: sessions = [], isLoading: isSessionsLoading } = useActiveSessions();
  const { activeOrgId } = useWorkspaceStore();

  const fullName = profile
    ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Admin User'
    : 'Admin User';

  const initials = profile?.first_name && profile?.last_name
    ? `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase()
    : 'ME';

  const settingsCards = [
    {
      title: 'Profile Information',
      description: 'Update your personal details, avatar photo, and contact information.',
      href: '/settings/profile',
      icon: User,
      badge: 'Account Details',
      actionLabel: 'Edit Profile',
    },
    {
      title: 'Security & Sessions',
      description: 'Change your password, monitor active browser logins, and revoke unrecognized sessions.',
      href: '/settings/security',
      icon: ShieldCheck,
      badge: isSessionsLoading ? 'Checking...' : `${sessions.length} Active Session${sessions.length === 1 ? '' : 's'}`,
      actionLabel: 'Manage Security',
    },
    {
      title: 'Notification Center',
      description: 'Review notification logs with category and severity filters, and mark items as read.',
      href: '/notifications',
      icon: Bell,
      badge: 'Alerts & Logs',
      actionLabel: 'View Notifications',
    },
    {
      title: 'Organization & Workspaces',
      description: 'Manage active organization members, roles, permissions, and team workspace settings.',
      href: `/organizations/${activeOrgId || 'org-1'}`,
      icon: Building2,
      badge: 'Team Access',
      actionLabel: 'Manage Organization',
    },
  ];

  return (
    <div className="max-w-5xl space-y-8">
      <SettingsHeader />

      {/* Account Overview Header Banner */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        {isProfileLoading ? (
          <div className="flex items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-2xl" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary font-bold text-xl shrink-0">
                {initials}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold text-xl tracking-tight">{fullName}</h2>
                  <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">
                  ID: <span className="font-mono text-xs">{profile?.user_id || 'user-1'}</span>
                  {profile?.phone && <span className="ml-3 font-mono text-xs">{profile.phone}</span>}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button asChild variant="outline" size="sm">
                <Link href="/settings/profile">
                  <User className="h-4 w-4 mr-1.5" />
                  Edit Profile
                </Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/settings/security">
                  <KeyRound className="h-4 w-4 mr-1.5" />
                  Security
                </Link>
              </Button>
            </div>
          </div>
        )}

        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-border">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-medium">Authentication</p>
            <p className="text-sm font-semibold flex items-center gap-1.5 text-foreground">
              <Shield className="h-3.5 w-3.5 text-primary" />
              Password & Token
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-medium">Active Logins</p>
            <p className="text-sm font-semibold flex items-center gap-1.5 text-foreground">
              <Laptop className="h-3.5 w-3.5 text-primary" />
              {sessions.length || 1} Device{sessions.length === 1 ? '' : 's'}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-medium">Workspace Context</p>
            <p className="text-sm font-semibold flex items-center gap-1.5 text-foreground truncate">
              <Building2 className="h-3.5 w-3.5 text-primary shrink-0" />
              {activeOrgId || 'org-1'}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-medium">Theme Mode</p>
            <p className="text-sm font-semibold flex items-center gap-1.5 text-foreground capitalize">
              {theme === 'dark' ? (
                <Moon className="h-3.5 w-3.5 text-primary" />
              ) : theme === 'light' ? (
                <Sun className="h-3.5 w-3.5 text-primary" />
              ) : (
                <Monitor className="h-3.5 w-3.5 text-primary" />
              )}
              {theme || 'system'}
            </p>
          </div>
        </div>
      </div>

      {/* Categorized Settings Cards Grid */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          Configuration & Preferences
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {settingsCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.href}
                className="flex flex-col justify-between rounded-xl border border-border bg-card p-6 shadow-sm hover:border-primary/40 transition-colors group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <Badge variant="secondary" className="text-xs font-normal">
                      {card.badge}
                    </Badge>
                  </div>
                  <div>
                    <h4 className="font-semibold text-base group-hover:text-primary transition-colors">
                      {card.title}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      {card.description}
                    </p>
                  </div>
                </div>

                <div className="pt-5 mt-4 border-t border-border flex justify-end">
                  <Button asChild variant="ghost" size="sm" className="text-xs font-medium group-hover:translate-x-0.5 transition-transform">
                    <Link href={card.href} className="flex items-center gap-1.5">
                      {card.actionLabel}
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Appearance & System Preferences */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Sliders className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-semibold text-base">Interface & System Preferences</h3>
            <p className="text-xs text-muted-foreground">
              Customize your display theme and regional settings.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-border">
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Color Theme</label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant={theme === 'light' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme('light')}
                className="text-xs flex items-center gap-1.5"
              >
                <Sun className="h-3.5 w-3.5" />
                Light
              </Button>
              <Button
                type="button"
                variant={theme === 'dark' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme('dark')}
                className="text-xs flex items-center gap-1.5"
              >
                <Moon className="h-3.5 w-3.5" />
                Dark
              </Button>
              <Button
                type="button"
                variant={theme === 'system' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme('system')}
                className="text-xs flex items-center gap-1.5"
              >
                <Monitor className="h-3.5 w-3.5" />
                System
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Locale & Timezone</label>
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/40 p-2.5 rounded-lg border border-border">
              <Globe className="h-4 w-4 text-primary shrink-0" />
              <span>Browser Default: {typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'UTC'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
