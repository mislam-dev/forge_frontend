'use client';

import React, { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@/lib/validation/zodResolver';
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
import {
  projectRepoSettingsSchema,
  ProjectRepoSettingsValues,
} from '@/lib/validation/projects';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { FolderGit2, GitBranch, Key, Save } from 'lucide-react';

export default function ProjectRepositorySettingsPage() {
  const params = useParams();
  const { toast } = useToast();
  const projectId = (params?.id as string) || '';

  const { data: repo, isLoading } = useProjectRepository(projectId);
  const updateRepo = useUpdateProjectRepository(projectId);

  const form = useForm<ProjectRepoSettingsValues>({
    resolver: zodResolver(projectRepoSettingsSchema),
    defaultValues: {
      repository_url: '',
      branch: 'main',
      pat_token: '',
      auto_deploy: true,
    },
  });

  useEffect(() => {
    if (repo) {
      form.reset({
        repository_url: repo.repository_url || '',
        branch: repo.branch || 'main',
        pat_token: '',
        auto_deploy: repo.auto_deploy ?? true,
      });
    }
  }, [repo, form]);

  const onSubmit = async (values: ProjectRepoSettingsValues) => {
    try {
      await updateRepo.mutateAsync({
        repository_url: values.repository_url.trim(),
        branch: values.branch.trim(),
        pat_token: values.pat_token?.trim() || undefined,
        auto_deploy: values.auto_deploy,
      });

      toast({
        title: 'Repository Updated',
        description: 'Git repository settings have been saved.',
      });
      form.setValue('pat_token', '');
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
            <Form {...form}>
              <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField
                  control={form.control}
                  name="repository_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Repository URL (HTTPS) *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://github.com/organization/repository"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="branch"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Production Branch *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <GitBranch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="main"
                            className="pl-9 font-mono text-xs"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="pat_token"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Personal Access Token (PAT)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="password"
                            placeholder={
                              repo?.pat_token_set
                                ? '•••••••••••••••• (Configured. Enter new token to replace)'
                                : 'ghp_xxxxxxxxxxxxxxxxxxxx (Optional for public repos)'
                            }
                            className="pl-9 text-xs"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                      <FormDescription>
                        Encrypted at rest using AES-256-GCM. Required for private GitHub or GitLab repos.
                      </FormDescription>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="auto_deploy"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-3 pt-2 space-y-0">
                      <FormControl>
                        <input
                          type="checkbox"
                          id="auto-deploy"
                          checked={field.value}
                          onChange={(e) => field.onChange(e.target.checked)}
                          className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                        />
                      </FormControl>
                      <Label htmlFor="auto-deploy" className="text-xs font-normal cursor-pointer">
                        Automatically deploy new commits pushed to the production branch
                      </Label>
                    </FormItem>
                  )}
                />

                <div className="flex justify-end pt-4 border-t border-border">
                  <Button type="submit" disabled={updateRepo.isPending}>
                    <Save className="mr-2 h-4 w-4" />
                    {updateRepo.isPending ? 'Saving...' : 'Save Repository Settings'}
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </div>
      </div>
    </div>
  );
}
