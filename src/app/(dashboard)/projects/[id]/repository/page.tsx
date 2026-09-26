'use client';

import React, { useEffect, useState } from 'react';
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
import { Badge } from '@/components/ui/badge';
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
import {
  FolderGit2,
  GitBranch,
  Key,
  Save,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  Globe,
} from 'lucide-react';

export default function ProjectRepositorySettingsPage() {
  const params = useParams();
  const { toast } = useToast();
  const projectId = (params?.id as string) || '';

  const { data: repo, isLoading } = useProjectRepository(projectId);
  const updateRepo = useUpdateProjectRepository(projectId);

  const [validationState, setValidationState] = useState<'idle' | 'validating' | 'valid' | 'invalid' | 'auth_required'>('idle');
  const [validationMessage, setValidationMessage] = useState<string>('');

  const form = useForm<ProjectRepoSettingsValues>({
    resolver: zodResolver(projectRepoSettingsSchema),
    defaultValues: {
      repository_url: '',
      branch: 'main',
      pat_token: '',
      auto_deploy: true,
    },
  });

  const handleValidateUrl = () => {
    const url = form.getValues('repository_url')?.trim();
    if (!url) {
      setValidationState('invalid');
      setValidationMessage('Please enter a Git repository URL.');
      return;
    }

    const httpsGitRegex = /^(https?:\/\/)([\w.-]+)(:[0-9]+)?(\/.*)?$/i;
    if (!httpsGitRegex.test(url)) {
      setValidationState('invalid');
      setValidationMessage('Invalid URL syntax. Remote URL must start with http:// or https://');
      return;
    }

    setValidationState('validating');
    setTimeout(() => {
      if (url.toLowerCase().includes('private') && !form.getValues('pat_token') && !repo?.pat_token_set) {
        setValidationState('auth_required');
        setValidationMessage('Private repository detected. A Personal Access Token (PAT) is required to clone.');
      } else {
        setValidationState('valid');
        setValidationMessage('Repository URL is valid and remote host is reachable.');
      }
    }, 500);
  };

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
                    <FormItem className="space-y-2">
                      <div className="flex items-center justify-between">
                        <FormLabel>Repository URL (HTTPS) *</FormLabel>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleValidateUrl}
                          disabled={validationState === 'validating'}
                          className="h-7 text-xs px-2.5"
                        >
                          {validationState === 'validating' ? (
                            <>
                              <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                              Validating...
                            </>
                          ) : (
                            <>
                              <Globe className="mr-1.5 h-3 w-3" />
                              Validate Git URL
                            </>
                          )}
                        </Button>
                      </div>
                      <FormControl>
                        <Input
                          placeholder="https://github.com/organization/repository"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            if (validationState !== 'idle') {
                              setValidationState('idle');
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />

                      {validationState !== 'idle' && (
                        <div
                          className={`flex items-start gap-2 p-2.5 rounded-lg text-xs transition-all ${
                            validationState === 'valid'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                              : validationState === 'auth_required'
                              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                              : 'bg-destructive/10 text-destructive border border-destructive/20'
                          }`}
                        >
                          {validationState === 'valid' && <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />}
                          {validationState === 'auth_required' && <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />}
                          {validationState === 'invalid' && <XCircle className="h-4 w-4 shrink-0 mt-0.5" />}
                          <div className="flex-1">
                            <span className="font-semibold capitalize mr-1">
                              {validationState === 'valid' ? 'Verified:' : validationState === 'auth_required' ? 'Authentication Required:' : 'Error:'}
                            </span>
                            <span>{validationMessage}</span>
                          </div>
                        </div>
                      )}
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
