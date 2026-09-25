'use client';

import React, { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ProjectHeader } from '@/components/projects/ProjectHeader';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Skeleton } from '@/components/ui/skeleton';
import { useDeploymentsList, useTriggerDeployment } from '@/lib/hooks/api/useDeployments';
import { useToast } from '@/components/ui/use-toast';
import {
  Terminal,
  Play,
  GitBranch,
  GitCommit,
  Clock,
  User,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { DeploymentStatus } from '@/lib/api/types';

export default function ProjectDeploymentsHistoryPage() {
  const params = useParams();
  const { toast } = useToast();
  const projectId = (params?.id as string) || '';

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { data: deployments = [], isLoading } = useDeploymentsList(projectId, statusFilter);
  const triggerDeploy = useTriggerDeployment(projectId);

  const statuses = ['all', 'Success', 'Building', 'Failed', 'Cancelled'];

  const filteredDeployments = useMemo(() => {
    if (statusFilter === 'all') return deployments;
    return deployments.filter((d) => d.status.toLowerCase() === statusFilter.toLowerCase());
  }, [deployments, statusFilter]);

  const handleTriggerDeploy = async () => {
    try {
      const dep = await triggerDeploy.mutateAsync();
      toast({
        title: 'Deployment Queued',
        description: `Deployment #${dep.deployment_number} has been queued.`,
      });
    } catch (err: any) {
      toast({
        title: 'Deployment Trigger Failed',
        description: err?.message || 'Could not queue deployment.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-8">
      <ProjectHeader projectId={projectId} />

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="font-semibold text-lg flex items-center gap-2">
              <Terminal className="h-5 w-5 text-primary" />
              Deployment History
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Review previous container builds, commit provenance, durations, and runtime logs.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handleTriggerDeploy}
              disabled={triggerDeploy.isPending}
              className="h-9 text-xs"
            >
              <Play className={`mr-1.5 h-3.5 w-3.5 ${triggerDeploy.isPending ? 'animate-spin' : ''}`} />
              {triggerDeploy.isPending ? 'Queuing...' : 'Trigger Deployment'}
            </Button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <Filter className="h-4 w-4 text-muted-foreground mr-1 shrink-0" />
          {statuses.map((st) => (
            <Button
              key={st}
              variant={statusFilter === st ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(st)}
              className="capitalize h-8 text-xs shrink-0"
            >
              {st}
            </Button>
          ))}
        </div>

        {/* Deployments List */}
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-6 space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : filteredDeployments.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                <Terminal className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-base">No deployments found</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                {statusFilter !== 'all'
                  ? 'No deployments match the selected status filter.'
                  : 'No deployments have occurred for this project yet.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30 text-xs text-muted-foreground font-medium">
                    <th className="py-3 px-4 font-medium">Deployment</th>
                    <th className="py-3 px-4 font-medium">Status</th>
                    <th className="py-3 px-4 font-medium">Commit & Message</th>
                    <th className="py-3 px-4 font-medium">Branch</th>
                    <th className="py-3 px-4 font-medium">Initiator</th>
                    <th className="py-3 px-4 font-medium">Duration</th>
                    <th className="py-3 px-4 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredDeployments.map((dep) => (
                    <tr key={dep.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-semibold text-xs">
                        #{dep.deployment_number}
                      </td>

                      <td className="py-3.5 px-4">
                        <StatusBadge status={dep.status} />
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
                          <GitCommit className="h-3.5 w-3.5 shrink-0" />
                          <span>{dep.commit_sha}</span>
                        </div>
                        {dep.commit_message && (
                          <p className="text-xs text-foreground truncate mt-0.5" title={dep.commit_message}>
                            {dep.commit_message}
                          </p>
                        )}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <GitBranch className="h-3 w-3 shrink-0" />
                          <span>{dep.branch}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3 shrink-0" />
                          <span>{dep.triggered_by}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-xs text-muted-foreground">
                        {dep.duration_seconds ? `${dep.duration_seconds}s` : '—'}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <Button variant="ghost" size="sm" asChild className="h-8 text-xs gap-1">
                          <Link href={`/projects/${projectId}/deployments/${dep.id}`}>
                            View Console
                            <ArrowRight className="h-3 w-3" />
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
