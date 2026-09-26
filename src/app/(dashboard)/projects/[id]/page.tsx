'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ProjectHeader } from '@/components/projects/ProjectHeader';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Skeleton } from '@/components/ui/skeleton';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { useProjectDetail, useDeleteProject } from '@/lib/hooks/api/useProjects';
import { useDeploymentsList } from '@/lib/hooks/api/useDeployments';
import { useToast } from '@/components/ui/use-toast';
import {
  Calendar,
  GitBranch,
  Layers,
  Terminal,
  ExternalLink,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';

export default function ProjectOverviewPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const projectId = (params?.id as string) || '';

  const { data: project, isLoading: isProjectLoading } = useProjectDetail(projectId);
  const { data: deployments = [], isLoading: isDeploymentsLoading } = useDeploymentsList(projectId);
  const deleteProject = useDeleteProject();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const latestDeployment = deployments[0];

  const handleConfirmDelete = async () => {
    try {
      await deleteProject.mutateAsync(projectId);
      toast({
        title: 'Project Deleted',
        description: `Project "${project?.name}" was deleted.`,
      });
      setShowDeleteConfirm(false);
      router.push('/projects');
    } catch (err: any) {
      toast({
        title: 'Delete Failed',
        description: err?.message || 'Failed to delete project.',
        variant: 'destructive',
      });
    }
  };

  if (isProjectLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-28 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <ProjectHeader projectId={projectId} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Service Specifications Card */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-base">Service Specifications</h2>
          </div>

          <div className="divide-y divide-border text-xs">
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-muted-foreground">Runtime Engine</span>
              <span className="font-mono font-medium uppercase">{project?.runtime}</span>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-muted-foreground">Project Type</span>
              <span className="font-mono">{project?.project_type || 'Repository'}</span>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-muted-foreground">Organization ID</span>
              <span className="font-mono text-muted-foreground">{project?.organization_id}</span>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-muted-foreground">Created At</span>
              <span className="text-muted-foreground">
                {project?.created_at ? new Date(project.created_at).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Latest Deployment Summary Card */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="h-5 w-5 text-primary" />
              <h2 className="font-semibold text-base">Latest Deployment</h2>
            </div>
            <Button variant="ghost" size="sm" asChild className="text-xs h-8">
              <Link href={`/projects/${projectId}/deployments`}>
                History
                <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>

          {isDeploymentsLoading ? (
            <Skeleton className="h-24 w-full" />
          ) : !latestDeployment ? (
            <div className="py-6 text-center text-xs text-muted-foreground">
              No deployments recorded yet.
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold">
                  Deployment #{latestDeployment.deployment_number}
                </span>
                <StatusBadge status={latestDeployment.status} />
              </div>

              <div className="rounded-lg bg-muted/50 p-3 space-y-1.5 text-xs">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <GitBranch className="h-3.5 w-3.5" />
                  <span className="font-mono">{latestDeployment.branch}</span>
                  <span className="font-mono">({latestDeployment.commit_sha})</span>
                </div>
                <p className="text-muted-foreground line-clamp-1 italic">
                  {latestDeployment.commit_message || 'Manual build trigger'}
                </p>
              </div>

              <div className="flex justify-end pt-1">
                <Button size="sm" variant="outline" asChild className="h-8 text-xs">
                  <Link href={`/projects/${projectId}/deployments/${latestDeployment.id}`}>
                    Open Live Build Console
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-6 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-destructive font-semibold text-sm">
          <AlertTriangle className="h-4 w-4" />
          Danger Zone
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-foreground">
              Delete Project
            </p>
            <p className="text-xs text-muted-foreground">
              Permanently delete this project, environment secrets, and all past deployment build logs.
            </p>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowDeleteConfirm(true)}
            disabled={deleteProject.isPending}
            className="shrink-0"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Project
          </Button>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Delete Project"
        description={`Are you sure you want to delete project "${project?.name || ''}"? This action cannot be undone and will permanently remove all deployments and environment secrets.`}
        confirmText="Delete Project"
        variant="destructive"
        isLoading={deleteProject.isPending}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
