'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Skeleton } from '@/components/ui/skeleton';
import { useProjectDetail } from '@/lib/hooks/api/useProjects';
import { useTriggerDeployment } from '@/lib/hooks/api/useDeployments';
import { useToast } from '@/components/ui/use-toast';
import {
  ArrowLeft,
  Play,
  Layers,
  Terminal,
  Key,
  FolderGit2,
  Users,
  ExternalLink,
} from 'lucide-react';

interface ProjectHeaderProps {
  projectId: string;
}

export function ProjectHeader({ projectId }: ProjectHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const { data: project, isLoading } = useProjectDetail(projectId);
  const triggerDeploy = useTriggerDeployment(projectId);

  const navLinks = [
    { label: 'Overview', href: `/projects/${projectId}`, icon: Layers, exact: true },
    { label: 'Deployments', href: `/projects/${projectId}/deployments`, icon: Terminal },
    { label: 'Environment Vars', href: `/projects/${projectId}/env-vars`, icon: Key },
    { label: 'Repository', href: `/projects/${projectId}/repository`, icon: FolderGit2 },
    { label: 'Access & Teams', href: `/projects/${projectId}/access`, icon: Users },
  ];

  const handleDeploy = async () => {
    try {
      const dep = await triggerDeploy.mutateAsync();
      toast({
        title: 'Deployment Queued',
        description: `Deployment #${dep.deployment_number} queued successfully.`,
      });
      router.push(`/projects/${projectId}/deployments/${dep.id}`);
    } catch (err: any) {
      toast({
        title: 'Deploy Failed',
        description: err?.message || 'Could not queue deployment.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 pb-4 border-b border-border">
        <Skeleton className="h-4 w-32" />
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-9 w-32" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-2 border-b border-border">
      {/* Top breadcrumb & quick back */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Button variant="ghost" size="sm" asChild className="mb-2 -ml-2 text-xs">
            <Link href="/projects">
              <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
              All Projects
            </Link>
          </Button>

          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              {project?.name || 'Project'}
            </h1>
            <Badge variant="outline" className="capitalize text-xs">
              {project?.runtime || 'Rust'}
            </Badge>
            {project?.latest_deployment_status && (
              <StatusBadge status={project.latest_deployment_status} />
            )}
          </div>
          <p className="text-xs text-muted-foreground font-mono mt-1">
            ID: {projectId}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {project?.repository_url && (
            <Button variant="outline" size="sm" asChild className="h-9 text-xs">
              <a href={project.repository_url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                Repo
              </a>
            </Button>
          )}
          <Button
            size="sm"
            onClick={handleDeploy}
            disabled={triggerDeploy.isPending}
            className="h-9 text-xs"
          >
            <Play className={`mr-1.5 h-3.5 w-3.5 ${triggerDeploy.isPending ? 'animate-spin' : ''}`} />
            {triggerDeploy.isPending ? 'Queuing...' : 'Deploy Now'}
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = link.exact
            ? pathname === link.href
            : pathname.startsWith(link.href);

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors shrink-0 ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {link.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
