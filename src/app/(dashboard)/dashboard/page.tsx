import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/StatusBadge';
import {
  Server,
  Activity,
  Briefcase,
  Building,
  Plus,
  ArrowUpRight,
} from 'lucide-react';

export default function DashboardPage() {
  const metrics = [
    {
      title: 'Active Deployments',
      value: '4 Active',
      subtext: 'Across 3 projects',
      icon: Server,
      color: 'text-blue-500',
    },
    {
      title: 'Success Rate (24h)',
      value: '98.4%',
      subtext: '+2.1% from yesterday',
      icon: Activity,
      color: 'text-emerald-500',
    },
    {
      title: 'Total Projects',
      value: '12 Active',
      subtext: '4 with automated CI/CD',
      icon: Briefcase,
      color: 'text-purple-500',
    },
    {
      title: 'Organizations',
      value: '3 Workspaces',
      subtext: 'Acme Corp, DevOps Inc',
      icon: Building,
      color: 'text-amber-500',
    },
  ];

  const recentDeployments = [
    {
      id: 'dep-104',
      project: 'forge-api-gateway',
      number: 104,
      status: 'Building' as const,
      duration: '1m 45s',
      branch: 'main',
    },
    {
      id: 'dep-103',
      project: 'forge-web-client',
      number: 103,
      status: 'Running' as const,
      duration: '4h 12m',
      branch: 'main',
    },
    {
      id: 'dep-102',
      project: 'worker-service-go',
      number: 102,
      status: 'Success' as const,
      duration: '45s',
      branch: 'feat/queue-perf',
    },
    {
      id: 'dep-101',
      project: 'forge-api-gateway',
      number: 101,
      status: 'Failed' as const,
      duration: '2m 10s',
      branch: 'fix/auth-leak',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time status of your cloud deployments, services, and environments.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild>
            <Link href="/projects/new">
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Link>
          </Button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => {
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
                <div className="text-2xl font-bold">{metric.value}</div>
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
                <th className="pb-3 font-medium">Duration</th>
                <th className="pb-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {recentDeployments.map((dep) => (
                <tr key={dep.id} className="hover:bg-muted/40 transition-colors">
                  <td className="py-3 font-semibold">{dep.project}</td>
                  <td className="py-3 text-muted-foreground font-mono text-xs">
                    #{dep.number}
                  </td>
                  <td className="py-3">
                    <StatusBadge status={dep.status} />
                  </td>
                  <td className="py-3 font-mono text-xs text-muted-foreground">
                    {dep.branch}
                  </td>
                  <td className="py-3 text-xs text-muted-foreground">
                    {dep.duration}
                  </td>
                  <td className="py-3 text-right">
                    <Button variant="ghost" size="sm" asChild className="h-8 text-xs">
                      <Link href={`/projects/${dep.project}/deployments/${dep.id}`}>
                        View Logs
                      </Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
