'use client';

import React, { useState } from 'react';
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
  useHealthDeep,
} from '@/lib/hooks/api/useDashboard';
import { useWorkspaceStore } from '@/lib/store/useWorkspaceStore';
import { useIsSystemAdmin } from '@/lib/hooks/api/useUserProfile';
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
  Clock,
  CheckCircle2,
} from 'lucide-react';

export default function DashboardPage() {
  const { activeOrgId, activeOrgName } = useWorkspaceStore();
  const isOrgWorkspace = Boolean(activeOrgId);
  const { isSystemAdmin } = useIsSystemAdmin();
  const [showAdminView, setShowAdminView] = useState(false);

  // 1. Personal Workspace Query - strictly enabled ONLY when in personal workspace and not in admin view
  const {
    data: userMetrics,
    isLoading: isUserLoading,
    isError: isUserError,
    error: userError,
    refetch: refetchUser,
    isRefetching: isUserRefetching,
  } = useUserDashboard({
    enabled: !isOrgWorkspace && !showAdminView,
  });

  // 2. Organization Workspace Query - strictly enabled ONLY when in org workspace and not in admin view
  const {
    data: orgMetrics,
    isLoading: isOrgLoading,
    isError: isOrgError,
    error: orgError,
    refetch: refetchOrg,
    isRefetching: isOrgRefetching,
  } = useOrgDashboard(activeOrgId, {
    enabled: isOrgWorkspace && !showAdminView,
  });

  // 3. System Administrator Query - strictly enabled ONLY if user is verified system admin AND viewing admin view
  const {
    data: systemMetrics,
    isLoading: isSystemLoading,
    isError: isSystemError,
    error: systemError,
    refetch: refetchSystem,
    isRefetching: isSystemRefetching,
  } = useSystemDashboard({
    enabled: isSystemAdmin && showAdminView,
  });

  // 4. System Health Status (Readiness Probe)
  const {
    data: health,
    isLoading: isHealthLoading,
    isError: isHealthError,
    refetch: refetchHealth,
  } = useSystemHealth();

  // 5. Deep Health Diagnostic Query - enabled ONLY when system admin is viewing admin view
  const {
    data: deepHealth,
    isLoading: isDeepHealthLoading,
    refetch: refetchDeepHealth,
  } = useHealthDeep({
    enabled: isSystemAdmin && showAdminView,
  });

  const isRefetchingAny =
    isUserRefetching || isOrgRefetching || isSystemRefetching;

  const handleRefresh = () => {
    refetchHealth();
    if (showAdminView) {
      refetchSystem();
      refetchDeepHealth();
    } else if (isOrgWorkspace) {
      refetchOrg();
    } else {
      refetchUser();
    }
  };

  const isCurrentLoading = showAdminView
    ? isSystemLoading
    : isOrgWorkspace
    ? isOrgLoading
    : isUserLoading;

  const isCurrentError = showAdminView
    ? isSystemError
    : isOrgWorkspace
    ? isOrgError
    : isUserError;

  const currentError = showAdminView
    ? systemError
    : isOrgWorkspace
    ? orgError
    : userError;

  return (
    <div className="space-y-8">
      {/* Header section with Context & Health Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              {showAdminView
                ? 'System Administration'
                : isOrgWorkspace
                ? `${activeOrgName || 'Organization'} Dashboard`
                : 'Personal Dashboard'}
            </h1>

            <Badge variant="secondary" className="text-xs">
              {showAdminView
                ? 'Platform Infrastructure'
                : isOrgWorkspace
                ? 'Organization Workspace'
                : 'Personal Workspace'}
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
            ) : health?.status === 'healthy' || health?.status === 'ready' ? (
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
            {showAdminView
              ? 'Platform-wide aggregated infrastructure metrics across all tenants.'
              : isOrgWorkspace
              ? `Operational metrics and deployment pipelines for ${activeOrgName || 'this organization'}.`
              : 'Overview of your assigned projects, triggered builds, and personal workspace activity.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* System Administrator View Toggle (Rendered ONLY if verified system admin) */}
          {isSystemAdmin && (
            <div className="flex items-center bg-muted p-1 rounded-lg border border-border">
              <Button
                variant={!showAdminView ? 'default' : 'ghost'}
                size="sm"
                className="h-7 text-xs px-2.5"
                onClick={() => setShowAdminView(false)}
              >
                Workspace View
              </Button>
              <Button
                variant={showAdminView ? 'default' : 'ghost'}
                size="sm"
                className="h-7 text-xs px-2.5 gap-1.5"
                onClick={() => setShowAdminView(true)}
              >
                <Shield className="h-3.5 w-3.5 text-primary" />
                System Admin
              </Button>
            </div>
          )}

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

          {!showAdminView && (
            <Button asChild size="sm" className="h-9">
              <Link href="/projects/new">
                <Plus className="mr-2 h-4 w-4" />
                New Project
              </Link>
            </Button>
          )}
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

      {/* ERROR STATE */}
      {isCurrentError ? (
        <QueryErrorState
          title="Unable to load dashboard metrics"
          error={currentError}
          onRetry={handleRefresh}
          isRetrying={isRefetchingAny}
        />
      ) : showAdminView ? (
        // SYSTEM ADMINISTRATOR VIEW (Triggered only when admin view is active)
        <div className="space-y-6">
          <div className="rounded-xl border border-primary/30 bg-card p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <Badge
                variant="outline"
                className="gap-1.5 border-primary/40 bg-primary/10 text-primary font-semibold"
              >
                <Shield className="h-3.5 w-3.5" />
                System Administration Overview
              </Badge>
              <span className="text-xs text-muted-foreground font-mono">
                API: /api/v1/dashboard
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="rounded-lg border border-border bg-background/50 p-4 space-y-1">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Total Organizations</span>
                  <Building className="h-3.5 w-3.5 text-blue-500" />
                </div>
                <div className="text-xl font-bold font-mono">
                  {isCurrentLoading ? (
                    <Skeleton className="h-7 w-16" />
                  ) : (
                    systemMetrics?.total_organizations ?? 0
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground">Tenant organizations</p>
              </div>

              <div className="rounded-lg border border-border bg-background/50 p-4 space-y-1">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Total Users</span>
                  <UserCheck className="h-3.5 w-3.5 text-emerald-500" />
                </div>
                <div className="text-xl font-bold font-mono">
                  {isCurrentLoading ? (
                    <Skeleton className="h-7 w-16" />
                  ) : (
                    systemMetrics?.total_users ?? 0
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground">Registered users</p>
              </div>

              <div className="rounded-lg border border-border bg-background/50 p-4 space-y-1">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Total Projects</span>
                  <Briefcase className="h-3.5 w-3.5 text-purple-500" />
                </div>
                <div className="text-xl font-bold font-mono">
                  {isCurrentLoading ? (
                    <Skeleton className="h-7 w-16" />
                  ) : (
                    systemMetrics?.total_projects ?? 0
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground">Configured microservices</p>
              </div>

              <div className="rounded-lg border border-border bg-background/50 p-4 space-y-1">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Total Deployments</span>
                  <Layers className="h-3.5 w-3.5 text-amber-500" />
                </div>
                <div className="text-xl font-bold font-mono">
                  {isCurrentLoading ? (
                    <Skeleton className="h-7 w-16" />
                  ) : (
                    systemMetrics?.total_deployments ?? 0
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground">Platform build executions</p>
              </div>
            </div>
          </div>

          {/* Deep Health & Infrastructure Diagnostics Panel */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="gap-1.5 border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold"
                >
                  <Activity className="h-3.5 w-3.5" />
                  Deep Infrastructure Diagnostics
                </Badge>
                <span className="text-xs text-muted-foreground font-mono">
                  API: /api/v1/health/deep &amp; /api/v1/health/ready
                </span>
              </div>
              {deepHealth?.environment && (
                <Badge variant="secondary" className="capitalize text-xs font-mono">
                  Env: {deepHealth.environment}
                </Badge>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="rounded-lg border border-border bg-background/50 p-4 space-y-1">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Platform Service</span>
                  <Server className="h-3.5 w-3.5 text-blue-500" />
                </div>
                <div className="text-lg font-bold font-mono">
                  {isDeepHealthLoading ? (
                    <Skeleton className="h-6 w-24" />
                  ) : (
                    deepHealth?.service ?? 'forge-platform'
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground">v{deepHealth?.version ?? '1.0.0'}</p>
              </div>

              <div className="rounded-lg border border-border bg-background/50 p-4 space-y-1">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Uptime</span>
                  <Clock className="h-3.5 w-3.5 text-emerald-500" />
                </div>
                <div className="text-lg font-bold font-mono">
                  {isDeepHealthLoading ? (
                    <Skeleton className="h-6 w-20" />
                  ) : deepHealth?.uptime_seconds ? (
                    `${Math.floor(deepHealth.uptime_seconds / 86400)}d ${Math.floor((deepHealth.uptime_seconds % 86400) / 3600)}h`
                  ) : (
                    'N/A'
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground">System operational time</p>
              </div>

              <div className="rounded-lg border border-border bg-background/50 p-4 space-y-1">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Deep Probe Status</span>
                  <ShieldCheck className="h-3.5 w-3.5 text-purple-500" />
                </div>
                <div className="text-lg font-bold font-mono capitalize">
                  {isDeepHealthLoading ? (
                    <Skeleton className="h-6 w-16" />
                  ) : (
                    deepHealth?.status ?? 'healthy'
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground">Aggregated health check</p>
              </div>

              <div className="rounded-lg border border-border bg-background/50 p-4 space-y-1">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Readiness Probe</span>
                  <Activity className="h-3.5 w-3.5 text-amber-500" />
                </div>
                <div className="text-lg font-bold font-mono capitalize">
                  {isHealthLoading ? (
                    <Skeleton className="h-6 w-16" />
                  ) : (
                    health?.status ?? 'ready'
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground">Traffic routing readiness</p>
              </div>
            </div>

            {/* Core Dependency Checks Breakdown */}
            {health?.checks && (
              <div className="pt-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                  Core Dependency Checks
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {Object.entries(health.checks).map(([key, check]) => {
                    if (!check) return null;
                    const isHealthy = check.status === 'healthy';
                    return (
                      <div
                        key={key}
                        className={`rounded-lg border p-3 flex items-center justify-between ${
                          isHealthy
                            ? 'border-border bg-background/50'
                            : 'border-destructive/30 bg-destructive/5'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          {isHealthy ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
                          )}
                          <div>
                            <p className="text-xs font-medium capitalize">
                              {key.replace(/_/g, ' ')}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              {check.message || (isHealthy ? 'Healthy' : 'Unavailable')}
                            </p>
                          </div>
                        </div>
                        {check.latency_ms !== null && check.latency_ms !== undefined && (
                          <Badge variant="secondary" className="font-mono text-[10px] h-5 px-1.5">
                            {check.latency_ms}ms
                          </Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : isOrgWorkspace ? (
        // ORGANIZATION WORKSPACE VIEW (Triggered only when in org space)
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="rounded-xl border border-border bg-card p-4 space-y-1 shadow-sm">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Members</span>
                <Users className="h-4 w-4 text-blue-500" />
              </div>
              <div className="text-2xl font-bold">
                {isCurrentLoading ? <Skeleton className="h-8 w-12" /> : orgMetrics?.members_count ?? 0}
              </div>
              <p className="text-[11px] text-muted-foreground">Total members</p>
            </div>

            <div className="rounded-xl border border-border bg-card p-4 space-y-1 shadow-sm">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Projects</span>
                <Briefcase className="h-4 w-4 text-purple-500" />
              </div>
              <div className="text-2xl font-bold">
                {isCurrentLoading ? <Skeleton className="h-8 w-12" /> : orgMetrics?.projects_count ?? 0}
              </div>
              <p className="text-[11px] text-muted-foreground">Configured services</p>
            </div>

            <div className="rounded-xl border border-border bg-card p-4 space-y-1 shadow-sm">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Teams</span>
                <Building className="h-4 w-4 text-indigo-500" />
              </div>
              <div className="text-2xl font-bold">
                {isCurrentLoading ? <Skeleton className="h-8 w-12" /> : orgMetrics?.teams_count ?? 0}
              </div>
              <p className="text-[11px] text-muted-foreground">Squad groups</p>
            </div>

            <div className="rounded-xl border border-border bg-card p-4 space-y-1 shadow-sm">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Deployments</span>
                <Layers className="h-4 w-4 text-amber-500" />
              </div>
              <div className="text-2xl font-bold">
                {isCurrentLoading ? <Skeleton className="h-8 w-12" /> : orgMetrics?.deployments_count ?? 0}
              </div>
              <p className="text-[11px] text-muted-foreground">Org-wide runs</p>
            </div>

            <div className="rounded-xl border border-border bg-card p-4 space-y-1 shadow-sm">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Success Rate</span>
                <Activity className="h-4 w-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {isCurrentLoading ? (
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
                {isCurrentLoading ? <Skeleton className="h-8 w-12" /> : orgMetrics?.active_deployments_count ?? 0}
              </div>
              <p className="text-[11px] text-muted-foreground">In progress now</p>
            </div>
          </div>

          <DeploymentSummaryTable
            deployments={orgMetrics?.recent_deployments}
            isLoading={isCurrentLoading}
            title="Organization Deployment Stream"
            description={`Recent build pipelines and deployments executed within ${activeOrgName || 'this organization'}.`}
            emptyMessage="No recent deployments found for this organization. Create a project to start deploying."
          />
        </>
      ) : (
        // PERSONAL WORKSPACE VIEW (Triggered only when in personal space)
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
                {isCurrentLoading ? (
                  <Skeleton className="h-8 w-24 my-1" />
                ) : (
                  <div className="text-2xl font-bold">
                    {userMetrics?.assigned_projects_count ?? 0} Active
                  </div>
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
                {isCurrentLoading ? (
                  <Skeleton className="h-8 w-24 my-1" />
                ) : (
                  <div className="text-2xl font-bold">
                    {userMetrics?.deployments_triggered_count ?? 0} Executed
                  </div>
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
                {isCurrentLoading ? (
                  <Skeleton className="h-8 w-24 my-1" />
                ) : (
                  <div className="text-2xl font-bold">
                    {userMetrics?.org_memberships_count ?? 0} Orgs
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Tenant workspaces you have access to
                </p>
              </div>
            </div>
          </div>

          <DeploymentSummaryTable
            deployments={userMetrics?.recent_activity}
            isLoading={isCurrentLoading}
            title="Personal Deployment Activity"
            description="Recent builds and deployments triggered across your personal projects."
            emptyMessage="No recent activity found. Trigger a deployment from any of your assigned projects."
          />
        </>
      )}
    </div>
  );
}
