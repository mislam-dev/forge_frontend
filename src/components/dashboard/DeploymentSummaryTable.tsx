'use client';

import React from 'react';
import Link from 'next/link';
import { DeploymentSummaryItem } from '@/lib/api/types';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowUpRight, GitBranch, GitCommit, Terminal, Calendar } from 'lucide-react';

interface DeploymentSummaryTableProps {
  deployments?: DeploymentSummaryItem[];
  isLoading?: boolean;
  title?: string;
  description?: string;
  emptyMessage?: string;
  viewAllHref?: string;
}

export function DeploymentSummaryTable({
  deployments = [],
  isLoading = false,
  title = 'Recent Deployment Activity',
  description = 'Live state updates from the build and deployment engine.',
  emptyMessage = 'No recent deployments found. Start a new deployment from any project page.',
  viewAllHref = '/projects',
}: DeploymentSummaryTableProps) {
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
          {description && (
            <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
          )}
        </div>
        {viewAllHref && (
          <Button variant="ghost" size="sm" asChild className="text-xs">
            <Link href={viewAllHref}>
              View All Projects
              <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </Button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs text-muted-foreground font-medium">
              <th className="pb-3 font-medium">Project</th>
              <th className="pb-3 font-medium">Deployment</th>
              <th className="pb-3 font-medium">Status</th>
              <th className="pb-3 font-medium">Branch</th>
              <th className="pb-3 font-medium">Commit</th>
              <th className="pb-3 font-medium">Created</th>
              <th className="pb-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan={7} className="py-3">
                    <Skeleton className="h-6 w-full" />
                  </td>
                </tr>
              ))
            ) : deployments.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-sm text-muted-foreground">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              deployments.map((dep) => {
                const shortProjectId = dep.project_id
                  ? `${dep.project_id.slice(0, 8)}...`
                  : 'Project';
                const shortDeployId = dep.id ? dep.id.slice(0, 8) : '—';
                const shortCommit = dep.commit_hash
                  ? dep.commit_hash.slice(0, 7)
                  : '—';

                return (
                  <tr key={dep.id} className="hover:bg-muted/40 transition-colors">
                    <td className="py-3 font-semibold">
                      <Link
                        href={`/projects/${dep.project_id}`}
                        className="hover:underline text-foreground inline-flex items-center gap-1.5"
                      >
                        <span className="font-mono text-xs">{shortProjectId}</span>
                      </Link>
                    </td>
                    <td className="py-3 text-muted-foreground font-mono text-xs">
                      #{shortDeployId}
                    </td>
                    <td className="py-3">
                      <StatusBadge status={dep.status} />
                    </td>
                    <td className="py-3 font-mono text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <GitBranch className="h-3 w-3 text-muted-foreground" />
                        {dep.branch || 'main'}
                      </span>
                    </td>
                    <td className="py-3 font-mono text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <GitCommit className="h-3 w-3 text-muted-foreground" />
                        {shortCommit}
                      </span>
                    </td>
                    <td className="py-3 text-xs text-muted-foreground whitespace-nowrap">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        {formatDate(dep.created_at)}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <Button variant="ghost" size="sm" asChild className="h-8 text-xs">
                        <Link href={`/projects/${dep.project_id}/deployments/${dep.id}`}>
                          <Terminal className="h-3 w-3 mr-1" />
                          Console
                        </Link>
                      </Button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
