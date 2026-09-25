'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ProjectHeader } from '@/components/projects/ProjectHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import {
  useProjectRepository,
  useUpdateProjectRepository,
} from '@/lib/hooks/api/useProjectRepo';
import { FolderGit2, GitBranch, Key, Save, CheckCircle2 } from 'lucide-react';

export default function ProjectRepositorySettingsPage() {
  const params = useParams();
  const { toast } = useToast();
  const projectId = (params?.id as string) || '';

  const { data: repo, isLoading } = useProjectRepository(projectId);
  const updateRepo = useUpdateProjectRepository(projectId);

  const [repoUrl, setRepoUrl] = useState('');
  const [branch, setBranch] = useState('main');
  const [patToken, setPatToken] = useState('');
  const [autoDeploy, setAutoDeploy] = useState(true);

  useEffect(() => {
    if (repo) {
      setRepoUrl(repo.repository_url || '');
      setBranch(repo.branch || 'main');
      setAutoDeploy(repo.auto_deploy ?? true);
    }
  }, [repo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateRepo.mutateAsync({
        repository_url: repoUrl.trim(),
        branch: branch.trim(),
        pat_token: patToken.trim() || undefined,
        auto_deploy: autoDeploy,
      });

      toast({
        title: 'Repository Updated',
        description: 'Git repository settings have been saved.',
      });
      setPatToken('');
    } catch (err: any) {
      toast({
        title: 'Update Failed',
        description: err?.message || 'Could not update repository settings.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-8">
      <ProjectHeader projectId={projectId} />

      <div className="max-w-2xl">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-6">
          <div className="space-y-1">
            <h2 className="font-semibold text-lg flex items-center gap-2">
              <FolderGit2 className="h-5 w-5 text-primary" />
              Git Repository Configuration
            </h2>
            <p className="text-xs text-muted-foreground">
              Configure the remote repository and authentication tokens used by Forge build workers.
            </p>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="repo-url">Repository URL (HTTPS)</Label>
                <Input
                  id="repo-url"
                  placeholder="https://github.com/organization/repository"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="branch">Production Branch</Label>
                <div className="relative">
                  <GitBranch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="branch"
                    placeholder="main"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className="pl-9 font-mono text-xs"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pat">Personal Access Token (PAT)</Label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="pat"
                    type="password"
                    placeholder={
                      repo?.pat_token_set
                        ? '•••••••••••••••• (Configured. Enter new token to replace)'
                        : 'ghp_xxxxxxxxxxxxxxxxxxxx (Optional for public repos)'
                    }
                    value={patToken}
                    onChange={(e) => setPatToken(e.target.value)}
                    className="pl-9 text-xs"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Encrypted at rest using AES-256-GCM. Required for private GitHub or GitLab repos.
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="auto-deploy"
                  checked={autoDeploy}
                  onChange={(e) => setAutoDeploy(e.target.checked)}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                />
                <Label htmlFor="auto-deploy" className="text-xs font-normal cursor-pointer">
                  Automatically deploy new commits pushed to the production branch
                </Label>
              </div>

              <div className="flex justify-end pt-4 border-t border-border">
                <Button type="submit" disabled={updateRepo.isPending}>
                  <Save className="mr-2 h-4 w-4" />
                  {updateRepo.isPending ? 'Saving...' : 'Save Repository Settings'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
