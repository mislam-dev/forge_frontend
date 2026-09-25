'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { useProjectsList } from '@/lib/hooks/api/useProjects';
import { useWorkspaceStore } from '@/lib/store/useWorkspaceStore';
import {
  FolderGit2,
  Plus,
  Search,
  ExternalLink,
  GitBranch,
  Layers,
  ArrowRight,
  Filter,
} from 'lucide-react';

export default function ProjectsPage() {
  const { activeOrgId } = useWorkspaceStore();
  const { data: projects = [], isLoading } = useProjectsList(activeOrgId || undefined);

  const [search, setSearch] = useState('');
  const [runtimeFilter, setRuntimeFilter] = useState('all');

  const runtimes = ['all', 'rust', 'node', 'python', 'go', 'docker'];

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch =
        project.name.toLowerCase().includes(search.toLowerCase()) ||
        project.slug.toLowerCase().includes(search.toLowerCase()) ||
        (project.description && project.description.toLowerCase().includes(search.toLowerCase())) ||
        (project.repository_url && project.repository_url.toLowerCase().includes(search.toLowerCase()));

      const matchesRuntime =
        runtimeFilter === 'all' || project.runtime.toLowerCase() === runtimeFilter.toLowerCase();

      return matchesSearch && matchesRuntime;
    });
  }, [projects, search, runtimeFilter]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your deployed microservices, worker daemons, and application runtimes.
          </p>
        </div>
        <Button asChild>
          <Link href="/projects/new">
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Link>
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects by name, slug, or repo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <Filter className="h-4 w-4 text-muted-foreground mr-1 hidden sm:inline-block" />
          {runtimes.map((rt) => (
            <Button
              key={rt}
              variant={runtimeFilter === rt ? 'default' : 'outline'}
              size="sm"
              onClick={() => setRuntimeFilter(rt)}
              className="capitalize h-8 text-xs"
            >
              {rt}
            </Button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-5 space-y-4">
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-16" />
              </div>
              <Skeleton className="h-12 w-full" />
              <div className="flex items-center justify-between pt-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-20" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/40 p-12 text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
            <FolderGit2 className="h-7 w-7" />
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold text-lg">No projects found</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              {search || runtimeFilter !== 'all'
                ? 'Try adjusting your search query or runtime filters.'
                : 'Get started by creating your first project and deploying code.'}
            </p>
          </div>
          {search || runtimeFilter !== 'all' ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearch('');
                setRuntimeFilter('all');
              }}
            >
              Reset Filters
            </Button>
          ) : (
            <Button asChild size="sm">
              <Link href="/projects/new">
                <Plus className="mr-2 h-4 w-4" />
                Create First Project
              </Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="group relative flex flex-col justify-between rounded-xl border border-border bg-card p-5 shadow-sm hover:border-primary/40 hover:shadow-md transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-xs uppercase">
                      {project.runtime.slice(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <Link
                        href={`/projects/${project.id}`}
                        className="font-semibold text-base tracking-tight hover:underline block truncate"
                      >
                        {project.name}
                      </Link>
                      <span className="text-xs text-muted-foreground font-mono">
                        {project.slug}
                      </span>
                    </div>
                  </div>
                  <Badge variant="outline" className="capitalize text-xs shrink-0">
                    {project.runtime}
                  </Badge>
                </div>

                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed min-h-[2.5rem]">
                  {project.description || 'No description provided.'}
                </p>

                {project.repository_url && (
                  <div className="flex items-center gap-3 text-xs text-muted-foreground font-mono truncate pt-1">
                    <div className="flex items-center gap-1 truncate">
                      <ExternalLink className="h-3 w-3 shrink-0" />
                      <span className="truncate">{project.repository_url.replace('https://', '')}</span>
                    </div>
                    {project.branch && (
                      <div className="flex items-center gap-1 shrink-0">
                        <GitBranch className="h-3 w-3" />
                        <span>{project.branch}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-5 pt-4 border-t border-border flex items-center justify-between text-xs">
                <div>
                  {project.latest_deployment_status ? (
                    <StatusBadge status={project.latest_deployment_status} />
                  ) : (
                    <span className="text-muted-foreground">Not deployed yet</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" asChild className="h-8 text-xs gap-1 group-hover:text-primary">
                    <Link href={`/projects/${project.id}`}>
                      Overview
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
