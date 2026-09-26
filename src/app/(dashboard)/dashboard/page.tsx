'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useDashboardMetrics, useSystemHealth } from '@/lib/hooks/api/useDashboard';
import { useWorkspaceStore } from '@/lib/store/useWorkspaceStore';
import {
  Server,
  Activity,
  Briefcase,
  Building,
  Plus,
  ArrowUpRight,
  ShieldCheck,
  AlertCircle,
  Users,
  Bell,
  RefreshCw,
} from 'lucide-react';

export default function DashboardPage() {
  const { activeOrgId } = useWorkspaceStore();
  const { data: metrics, isLoading: isMetricsLoading, refetch, isRefetching } = useDashboardMetrics();
  const { data: health, isLoading: isHealthLoading } = useSystemHealth();

  const metricCards = [
    {
      title: 'Active Deployments',
      value: isMetricsLoading ? null : `${metrics?.active_deployments ?? 0} Running`,
      subtext: 'Across all workspaces',
      icon: Server,
      color: 'text-blue-500',
    },
    {
      title: 'Success Rate (24h)',
      value: isMetricsLoading ? null : `${metrics?.success_rate_percent ?? 98.4}%`,
      subtext: 'Passing CI/CD pipelines',
      icon: Activity,
      color: 'text-emerald-500',
    },
    {
      title: 'Total Projects',
      value: isMetricsLoading ? null : `${metrics?.total_projects ?? 0} Active`,
      subtext: 'Configured microservices',
      icon: Briefcase,
      color: 'text-purple-500',
    },
  ];

  const recentDeployments = metrics?.recent_deployments || [];

  return (
    <div className="space-y-8">
      {/* Header section with System Health Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Dashboard Overview
            </h1>
            {isHealthLoading ? (
              <Skeleton className="h-6 w-24 rounded-full" />
            ) : health?.status === 'healthy' ? (
              <Badge variant="outline" className="gap-1.5 border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="h-3.5 w-3.5" />
                Systems Operational
              </Badge>
            ) : (
              <Badge variant="outline" className="gap-1.5 border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <AlertCircle className="h-3.5 w-3.5" />
                Degraded Performance
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time status of cloud microservices, build pipelines, and environments.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isRefetching}
            className="h-9"
          >
            <RefreshCw className={`mr-2 h-3.5 w-3.5 ${isRefetching ? 'animate-spin' : ''}`} />
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
        <Button variant="secondary" size="sm" asChild className="h-8 text-xs">
          <Link href={`/organizations/${activeOrgId || 'org-1'}`}>
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
        <Button variant="secondary" size="sm" asChild className="h-8 text-xs">
          <Link href="/notifications">
            <Bell className="mr-1.5 h-3.5 w-3.5" />
            Notification Feed
          </Link>
        </Button>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {metricCards.map((metric) => {
          const Icon = metric.icon;
          return (
            <div
              key={metric.title}
              className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                  {metric.title}
                </span>
                <div className={`p-2 rounded-lg bg-muted ${metric.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div>
                {isMetricsLoading ? (
                  <Skeleton className="h-8 w-28 my-1" />
                ) : (
                  <div className="text-2xl font-bold">{metric.value}</div>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  {metric.subtext}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity Table Container */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">
              Recent Deployment Activity
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Live state updates from the build and deployment engine.
            </p>
          </div>
          <Button variant="ghost" size="sm" asChild className="text-xs">
            <Link href="/projects">
              View All Projects
              <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-muted-foreground font-medium">
                <th className="pb-3 font-medium">Project</th>
                <th className="pb-3 font-medium">Deployment</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Branch</th>
                <th className="pb-3 font-medium">Triggered By</th>
                <th className="pb-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isMetricsLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="py-3">
                      <Skeleton className="h-6 w-full" />
                    </td>
                  </tr>
                ))
              ) : recentDeployments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-sm text-muted-foreground">
                    No recent deployments found. Start a new deployment from any project page.
                  </td>
                </tr>
              ) : (
                recentDeployments.map((dep) => (
                  <tr key={dep.id} className="hover:bg-muted/40 transition-colors">
                    <td className="py-3 font-semibold">
                      <Link
                        href={`/projects/${dep.project_id}`}
                        className="hover:underline text-foreground"
                      >
                        {dep.project_name || dep.project_id}
                      </Link>
                    </td>
                    <td className="py-3 text-muted-foreground font-mono text-xs">
                      #{dep.deployment_number}
                    </td>
                    <td className="py-3">
                      <StatusBadge status={dep.status} />
                    </td>
                    <td className="py-3 font-mono text-xs text-muted-foreground">
                      {dep.branch}
                    </td>
                    <td className="py-3 text-xs text-muted-foreground">
                      {dep.triggered_by}
                    </td>
                    <td className="py-3 text-right">
                      <Button variant="ghost" size="sm" asChild className="h-8 text-xs">
                        <Link href={`/projects/${dep.project_id}/deployments/${dep.id}`}>
                          View Console
                        </Link>
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
