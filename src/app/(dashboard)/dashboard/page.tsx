'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { QueryErrorState } from '@/components/shared/QueryErrorState';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { DeploymentSummaryTable } from '@/components/dashboard/DeploymentSummaryTable';
import {
  useUserDashboard,
  useOrgDashboard,
  useSystemDashboard,
  useSystemHealth,
} from '@/lib/hooks/api/useDashboard';
import { useWorkspaceStore } from '@/lib/store/useWorkspaceStore';
import {
  Server,
  Activity,
  Briefcase,
  Building,
  Plus,
  ShieldCheck,
  AlertCircle,
  Users,
  Bell,
  RefreshCw,
  Layers,
  Shield,
  UserCheck,
  CheckCircle,
} from 'lucide-react';

export default function DashboardPage() {
  const { activeOrgId, activeOrgName } = useWorkspaceStore();
  const isOrgWorkspace = Boolean(activeOrgId);

  // 1. Personal Workspace Query
  const {
    data: userMetrics,
    isLoading: isUserLoading,
    isError: isUserError,
    error: userError,
    refetch: refetchUser,
    isRefetching: isUserRefetching,
  } = useUserDashboard();

  // 2. Organization Workspace Query
  const {
    data: orgMetrics,
    isLoading: isOrgLoading,
    isError: isOrgError,
    error: orgError,
    refetch: refetchOrg,
    isRefetching: isOrgRefetching,
  } = useOrgDashboard(activeOrgId);

  // 3. System Administrator Query (Admin-only data)
  const {
    data: systemMetrics,
    isLoading: isSystemLoading,
    refetch: refetchSystem,
    isRefetching: isSystemRefetching,
  } = useSystemDashboard();

  // 4. System Health Status
  const {
    data: health,
    isLoading: isHealthLoading,
    isError: isHealthError,
  } = useSystemHealth();

  const isRefetchingAny =
    isUserRefetching || isOrgRefetching || isSystemRefetching;

  const handleRefresh = () => {
    if (isOrgWorkspace) {
      refetchOrg();
    } else {
      refetchUser();
    }
    refetchSystem();
  };

  // Determine if system admin data is available
  const isSystemAdmin = Boolean(systemMetrics && typeof systemMetrics.total_users === 'number');

  // Active workspace error & loading states
  const isWorkspaceLoading = isOrgWorkspace ? isOrgLoading : isUserLoading;
  const isWorkspaceError = isOrgWorkspace ? isOrgError : isUserError;
  const workspaceError = isOrgWorkspace ? orgError : userError;

  return (
    <div className="space-y-8">
      {/* Header section with Context & Health Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              {isOrgWorkspace ? `${activeOrgName || 'Organization'} Dashboard` : 'Personal Dashboard'}
            </h1>
            <Badge variant="secondary" className="text-xs">
              {isOrgWorkspace ? 'Organization Workspace' : 'Personal Workspace'}
            </Badge>

            {isHealthLoading ? (
              <Skeleton className="h-6 w-24 rounded-full" />
            ) : isHealthError ? (
              <Badge
                variant="outline"
                className="gap-1.5 border-destructive/30 bg-destructive/10 text-destructive"
              >
                <AlertCircle className="h-3.5 w-3.5" />
                Backend Offline
              </Badge>
            ) : health?.status === 'healthy' ? (
              <Badge
                variant="outline"
                className="gap-1.5 border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                Systems Operational
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="gap-1.5 border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
              >
                <AlertCircle className="h-3.5 w-3.5" />
                Degraded Performance
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {isOrgWorkspace
              ? `Operational metrics and deployment pipelines for ${activeOrgName || 'this organization'}.`
              : 'Overview of your assigned projects, triggered builds, and personal workspace activity.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefetchingAny}
            className="h-9"
          >
            <RefreshCw
              className={`mr-2 h-3.5 w-3.5 ${isRefetchingAny ? 'animate-spin' : ''}`}
            />
            Refresh
          </Button>
          <Button asChild size="sm" className="h-9">
            <Link href="/projects/new">
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Link>
          </Button>
        </div>
      </div>

      {/* Quick Action Shortcuts */}
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" size="sm" asChild className="h-8 text-xs">
          <Link href="/projects">
            <Briefcase className="mr-1.5 h-3.5 w-3.5" />
            All Projects
          </Link>
        </Button>
        {isOrgWorkspace && activeOrgId && (
          <>
            <Button variant="secondary" size="sm" asChild className="h-8 text-xs">
              <Link href={`/organizations/${activeOrgId}`}>
                <Building className="mr-1.5 h-3.5 w-3.5" />
                Manage Organization
              </Link>
            </Button>
            <Button variant="secondary" size="sm" asChild className="h-8 text-xs">
              <Link href="/teams">
                <Users className="mr-1.5 h-3.5 w-3.5" />
                Teams & Access
              </Link>
            </Button>
          </>
        )}
        <Button variant="secondary" size="sm" asChild className="h-8 text-xs">
          <Link href="/notifications">
            <Bell className="mr-1.5 h-3.5 w-3.5" />
            Notification Feed
          </Link>
        </Button>
      </div>

      {/* SYSTEM ADMINISTRATOR DATA SECTION (Rendered with clear label when admin data is accessible) */}
      {isSystemAdmin && (
        <div className="rounded-xl border border-primary/30 bg-card/60 p-6 shadow-sm space-y-4 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-border pb-4">
            <div className="flex items-center gap-2.5">
              <Badge
                variant="outline"
                className="gap-1.5 border-primary/40 bg-primary/10 text-primary font-semibold px-2.5 py-1"
              >
                <Shield className="h-3.5 w-3.5" />
                System Administrator View
              </Badge>
              <div>
                <h2 className="text-base font-semibold tracking-tight">
                  Platform System Infrastructure
                </h2>
                <p className="text-xs text-muted-foreground">
                  Global instance totals extracted from the system administration endpoint.
                </p>
              </div>
            </div>
            <span className="text-[11px] font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">
              Role: System Administrator
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="rounded-lg border border-border bg-background/50 p-4 space-y-1">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Total Organizations</span>
                <Building className="h-3.5 w-3.5 text-blue-500" />
              </div>
              <div className="text-xl font-bold font-mono">
                {isSystemLoading ? <Skeleton className="h-7 w-16" /> : systemMetrics?.total_organizations ?? 0}
              </div>
              <p className="text-[11px] text-muted-foreground">Tenants created</p>
            </div>

            <div className="rounded-lg border border-border bg-background/50 p-4 space-y-1">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Total Users</span>
                <UserCheck className="h-3.5 w-3.5 text-emerald-500" />
              </div>
              <div className="text-xl font-bold font-mono">
                {isSystemLoading ? <Skeleton className="h-7 w-16" /> : systemMetrics?.total_users ?? 0}
              </div>
              <p className="text-[11px] text-muted-foreground">Registered accounts</p>
            </div>

            <div className="rounded-lg border border-border bg-background/50 p-4 space-y-1">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Total Projects</span>
                <Briefcase className="h-3.5 w-3.5 text-purple-500" />
              </div>
              <div className="text-xl font-bold font-mono">
                {isSystemLoading ? <Skeleton className="h-7 w-16" /> : systemMetrics?.total_projects ?? 0}
              </div>
              <p className="text-[11px] text-muted-foreground">Platform repositories</p>
            </div>

            <div className="rounded-lg border border-border bg-background/50 p-4 space-y-1">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Total Deployments</span>
                <Layers className="h-3.5 w-3.5 text-amber-500" />
              </div>
              <div className="text-xl font-bold font-mono">
                {isSystemLoading ? <Skeleton className="h-7 w-16" /> : systemMetrics?.total_deployments ?? 0}
              </div>
              <p className="text-[11px] text-muted-foreground">Historical build runs</p>
            </div>
          </div>
        </div>
      )}

      {/* WORKSPACE METRICS & RECENT ACTIVITY */}
      {isWorkspaceError ? (
        <QueryErrorState
          title="Unable to load dashboard metrics"
          error={workspaceError}
          onRetry={handleRefresh}
          isRetrying={isRefetchingAny}
        />
      ) : isOrgWorkspace ? (
        // ORGANIZATION WORKSPACE VIEW
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="rounded-xl border border-border bg-card p-4 space-y-1 shadow-sm">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Members</span>
                <Users className="h-4 w-4 text-blue-500" />
              </div>
              <div className="text-2xl font-bold">
                {isOrgLoading ? <Skeleton className="h-8 w-12" /> : orgMetrics?.members_count ?? 0}
              </div>
              <p className="text-[11px] text-muted-foreground">Total members</p>
            </div>

            <div className="rounded-xl border border-border bg-card p-4 space-y-1 shadow-sm">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Projects</span>
                <Briefcase className="h-4 w-4 text-purple-500" />
              </div>
              <div className="text-2xl font-bold">
                {isOrgLoading ? <Skeleton className="h-8 w-12" /> : orgMetrics?.projects_count ?? 0}
              </div>
              <p className="text-[11px] text-muted-foreground">Configured services</p>
            </div>

            <div className="rounded-xl border border-border bg-card p-4 space-y-1 shadow-sm">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Teams</span>
                <Building className="h-4 w-4 text-indigo-500" />
              </div>
              <div className="text-2xl font-bold">
                {isOrgLoading ? <Skeleton className="h-8 w-12" /> : orgMetrics?.teams_count ?? 0}
              </div>
              <p className="text-[11px] text-muted-foreground">Squad groups</p>
            </div>

            <div className="rounded-xl border border-border bg-card p-4 space-y-1 shadow-sm">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Deployments</span>
                <Layers className="h-4 w-4 text-amber-500" />
              </div>
              <div className="text-2xl font-bold">
                {isOrgLoading ? <Skeleton className="h-8 w-12" /> : orgMetrics?.deployments_count ?? 0}
              </div>
              <p className="text-[11px] text-muted-foreground">Org-wide runs</p>
            </div>

            <div className="rounded-xl border border-border bg-card p-4 space-y-1 shadow-sm">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Success Rate</span>
                <Activity className="h-4 w-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {isOrgLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  `${(orgMetrics?.success_rate ?? 100).toFixed(1)}%`
                )}
              </div>
              <p className="text-[11px] text-muted-foreground">Passing builds</p>
            </div>

            <div className="rounded-xl border border-border bg-card p-4 space-y-1 shadow-sm">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Active Runs</span>
                <Server className="h-4 w-4 text-rose-500" />
              </div>
              <div className="text-2xl font-bold">
                {isOrgLoading ? <Skeleton className="h-8 w-12" /> : orgMetrics?.active_deployments_count ?? 0}
              </div>
              <p className="text-[11px] text-muted-foreground">In progress now</p>
            </div>
          </div>

          <DeploymentSummaryTable
            deployments={orgMetrics?.recent_deployments}
            isLoading={isOrgLoading}
            title="Organization Deployment Stream"
            description={`Recent build pipelines and deployments executed within ${activeOrgName || 'this organization'}.`}
            emptyMessage="No recent deployments found for this organization. Create a project to start deploying."
          />
        </>
      ) : (
        // PERSONAL WORKSPACE VIEW
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-xl border border-border bg-card p-5 space-y-2 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                  Assigned Projects
                </span>
                <div className="p-2 rounded-lg bg-muted text-blue-500">
                  <Briefcase className="h-4 w-4" />
                </div>
              </div>
              <div>
                {isUserLoading ? (
                  <Skeleton className="h-8 w-24 my-1" />
                ) : (
                  <div className="text-2xl font-bold">{userMetrics?.assigned_projects_count ?? 0} Active</div>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Projects you are a collaborator or owner of
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-5 space-y-2 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                  Deployments Triggered
                </span>
                <div className="p-2 rounded-lg bg-muted text-emerald-500">
                  <Server className="h-4 w-4" />
                </div>
              </div>
              <div>
                {isUserLoading ? (
                  <Skeleton className="h-8 w-24 my-1" />
                ) : (
                  <div className="text-2xl font-bold">{userMetrics?.deployments_triggered_count ?? 0} Executed</div>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Build and deployment runs initiated by you
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-5 space-y-2 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                  Organization Memberships
                </span>
                <div className="p-2 rounded-lg bg-muted text-purple-500">
                  <Building className="h-4 w-4" />
                </div>
              </div>
              <div>
                {isUserLoading ? (
                  <Skeleton className="h-8 w-24 my-1" />
                ) : (
                  <div className="text-2xl font-bold">{userMetrics?.org_memberships_count ?? 0} Orgs</div>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Tenant workspaces you have access to
                </p>
              </div>
            </div>
          </div>

          <DeploymentSummaryTable
            deployments={userMetrics?.recent_activity}
            isLoading={isUserLoading}
            title="Personal Deployment Activity"
            description="Recent builds and deployments triggered across your personal projects."
            emptyMessage="No recent activity found. Trigger a deployment from any of your assigned projects."
          />
        </>
      )}
    </div>
  );
}
