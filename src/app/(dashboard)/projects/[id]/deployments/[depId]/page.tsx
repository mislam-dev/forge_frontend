'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { SseLogViewer } from '@/components/shared/SseLogViewer';
import { Skeleton } from '@/components/ui/skeleton';
import { useDeploymentDetail, useCancelDeployment, useTriggerDeployment } from '@/lib/hooks/api/useDeployments';
import { useSseStream } from '@/lib/hooks/useSseStream';
import { useToast } from '@/components/ui/use-toast';
import {
  ArrowLeft,
  RotateCcw,
  StopCircle,
  GitBranch,
  GitCommit,
  User,
  Clock,
  Maximize2,
  Minimize2,
} from 'lucide-react';

export default function DeploymentConsolePage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();

  const projectId = (params?.id as string) || '';
  const depId = (params?.depId as string) || '';

  const { data: deployment, isLoading: isDepLoading } = useDeploymentDetail(projectId, depId);
  const cancelDeploy = useCancelDeployment(projectId);
  const triggerDeploy = useTriggerDeployment(projectId);

  const [isFullscreen, setIsFullscreen] = useState(false);

  // SSE Stream hook pointing to API log stream endpoint
  const sseUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/v1/projects/${projectId}/deployments/${depId}/logs/stream`;
  const { logLines, isConnected, clearLogs } = useSseStream({
    url: sseUrl,
    enabled: true,
  });

  const isOngoing = deployment && ['Building', 'Deploying', 'Queued', 'Running'].includes(deployment.status);

  const handleCancel = async () => {
    try {
      await cancelDeploy.mutateAsync(depId);
      toast({
        title: 'Deployment Cancelled',
        description: `Deployment #${deployment?.deployment_number} cancellation signal sent.`,
      });
    } catch (err: any) {
      toast({
        title: 'Cancel Failed',
        description: err?.message || 'Failed to cancel deployment.',
        variant: 'destructive',
      });
    }
  };

  const handleRedeploy = async () => {
    try {
      const newDep = await triggerDeploy.mutateAsync({
        branch: deployment?.branch,
        commit_sha: deployment?.commit_sha,
      });
      toast({
        title: 'Redeployment Queued',
        description: `Deployment #${newDep.deployment_number} queued.`,
      });
      router.push(`/projects/${projectId}/deployments/${newDep.id}`);
    } catch (err: any) {
      toast({
        title: 'Redeploy Failed',
        description: err?.message || 'Could not queue redeployment.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className={`space-y-6 ${isFullscreen ? 'fixed inset-0 z-50 bg-background p-6 overflow-auto' : ''}`}>
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Button variant="ghost" size="sm" asChild className="mb-2 -ml-2 text-xs">
            <Link href={`/projects/${projectId}/deployments`}>
              <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
              Back to Deployments
            </Link>
          </Button>

          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight font-mono">
              Deployment #{deployment?.deployment_number ?? '...'}
            </h1>
            {deployment && <StatusBadge status={deployment.status} />}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real-time Server-Sent Events (SSE) telemetry and build container logs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="h-9 text-xs"
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="mr-1.5 h-3.5 w-3.5" />
                Exit Fullscreen
              </>
            ) : (
              <>
                <Maximize2 className="mr-1.5 h-3.5 w-3.5" />
                Fullscreen
              </>
            )}
          </Button>

          {isOngoing && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleCancel}
              disabled={cancelDeploy.isPending}
              className="h-9 text-xs"
            >
              <StopCircle className="mr-1.5 h-3.5 w-3.5" />
              {cancelDeploy.isPending ? 'Cancelling...' : 'Cancel Build'}
            </Button>
          )}

          <Button
            size="sm"
            onClick={handleRedeploy}
            disabled={triggerDeploy.isPending}
            className="h-9 text-xs"
          >
            <RotateCcw className={`mr-1.5 h-3.5 w-3.5 ${triggerDeploy.isPending ? 'animate-spin' : ''}`} />
            {triggerDeploy.isPending ? 'Queuing...' : 'Redeploy'}
          </Button>
        </div>
      </div>

      {/* Deployment Metadata Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl border border-border bg-card text-xs">
        <div className="space-y-1">
          <span className="text-muted-foreground flex items-center gap-1">
            <GitBranch className="h-3 w-3" />
            Branch
          </span>
          <span className="font-mono font-medium block truncate">
            {deployment?.branch || 'main'}
          </span>
        </div>

        <div className="space-y-1">
          <span className="text-muted-foreground flex items-center gap-1">
            <GitCommit className="h-3 w-3" />
            Commit SHA
          </span>
          <span className="font-mono font-medium block truncate">
            {deployment?.commit_sha || '—'}
          </span>
        </div>

        <div className="space-y-1">
          <span className="text-muted-foreground flex items-center gap-1">
            <User className="h-3 w-3" />
            Initiator
          </span>
          <span className="font-medium block truncate">
            {deployment?.triggered_by || 'Unknown'}
          </span>
        </div>

        <div className="space-y-1">
          <span className="text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Elapsed Time
          </span>
          <span className="font-mono font-medium block">
            {deployment?.duration_seconds ? `${deployment.duration_seconds}s` : isOngoing ? 'Running...' : '—'}
          </span>
        </div>
      </div>

      {/* Terminal Log Console */}
      <div className="rounded-xl overflow-hidden shadow-sm">
        <SseLogViewer
          logLines={logLines}
          isConnected={isConnected}
        />
      </div>
    </div>
  );
}
