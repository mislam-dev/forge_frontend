'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@/lib/validation/zodResolver';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { useCreateProject } from '@/lib/hooks/api/useProjects';
import { useWorkspaceStore } from '@/lib/store/useWorkspaceStore';
import { ProjectRuntime, ProjectType } from '@/lib/api/types';
import {
  projectStep1Schema,
  projectStep2Schema,
  ProjectStep1Values,
  ProjectStep2Values,
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
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FolderGit2,
  GitBranch,
  Key,
  Layers,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  X,
} from 'lucide-react';

interface EnvVarRow {
  key: string;
  value: string;
  environment: string;
}

interface NewProjectWizardProps {
  isModal?: boolean;
  onCancel?: () => void;
}

export function NewProjectWizard({ isModal = false, onCancel }: NewProjectWizardProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { activeOrgId } = useWorkspaceStore();
  const createProject = useCreateProject();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [visibleSecrets, setVisibleSecrets] = useState<Record<number, boolean>>({});

  const toggleSecretVisibility = (index: number) => {
    setVisibleSecrets((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const step1Form = useForm<ProjectStep1Values>({
    resolver: zodResolver(projectStep1Schema),
    defaultValues: {
      name: '',
      description: '',
      runtime: 'rust',
      project_type: 'repo',
    },
  });

  const step2Form = useForm<ProjectStep2Values>({
    resolver: zodResolver(projectStep2Schema),
    defaultValues: {
      repository_url: '',
      branch: 'main',
      pat_token: '',
    },
  });

  // Step 3 state
  const [envVars, setEnvVars] = useState<EnvVarRow[]>([
    { key: 'PORT', value: '8080', environment: 'all' },
  ]);

  const addEnvRow = () => {
    setEnvVars((prev) => [...prev, { key: '', value: '', environment: 'all' }]);
  };

  const updateEnvRow = (index: number, field: keyof EnvVarRow, val: string) => {
    setEnvVars((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: val } : row))
    );
  };

  const removeEnvRow = (index: number) => {
    setEnvVars((prev) => prev.filter((_, i) => i !== index));
  };

  const handleNextFromStep1 = () => {
    setStep(2);
  };

  const handleNextFromStep2 = () => {
    setStep(3);
  };

  const handleSubmit = async () => {
    try {
      const step1 = step1Form.getValues();
      const step2 = step2Form.getValues();
      const validEnvVars = envVars.filter((ev) => ev.key.trim().length > 0);

      const created = await createProject.mutateAsync({
        name: step1.name.trim(),
        description: step1.description?.trim() || '',
        runtime: step1.runtime as ProjectRuntime,
        project_type: step1.project_type as ProjectType,
        organization_id: activeOrgId || 'org-1',
        repository_url: step2.repository_url.trim(),
        branch: step2.branch.trim() || 'main',
        pat_token: step2.pat_token?.trim() || undefined,
        env_vars: validEnvVars,
      });

      toast({
        title: 'Project Created',
        description: `Project "${created.name}" is ready.`,
      });

      router.push(`/projects/${created.id}`);
    } catch (err: any) {
      toast({
        title: 'Creation Failed',
        description: err?.message || 'Could not create project. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const runtimes: { id: ProjectRuntime; label: string; desc: string }[] = [
    { id: 'rust', label: 'Rust', desc: 'Axum, Actix-web, or Cargo binary' },
    { id: 'node', label: 'Node.js', desc: 'Next.js, Express, or Fastify' },
    { id: 'python', label: 'Python', desc: 'FastAPI, Flask, or Django worker' },
    { id: 'go', label: 'Go', desc: 'Standard net/http or Gin service' },
    { id: 'docker', label: 'Dockerfile', desc: 'Custom multi-stage container build' },
  ];

  return (
    <div className={`space-y-6 ${isModal ? '' : 'max-w-3xl mx-auto py-4'}`}>
      {/* Header */}
      <div>
        {!isModal && (
          <Button variant="ghost" size="sm" asChild className="mb-3 -ml-2 text-xs">
            <Link href="/projects">
              <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
              Back to Projects
            </Link>
          </Button>
        )}
        <h1 className="text-2xl font-bold tracking-tight">Create a New Project</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Configure runtime environment, link a Git repository, and define environment secrets.
        </p>
      </div>

      {/* Step Indicators */}
      <div className="grid grid-cols-3 gap-3 text-xs font-medium">
        <div
          className={`flex items-center gap-2 p-2.5 rounded-lg border transition-colors ${
            step === 1
              ? 'border-primary bg-primary/10 text-primary font-semibold'
              : step > 1
              ? 'border-border bg-muted/40 text-foreground'
              : 'border-border text-muted-foreground'
          }`}
        >
          {step > 1 ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
          ) : (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px]">
              1
            </span>
          )}
          <span>General Info</span>
        </div>

        <div
          className={`flex items-center gap-2 p-2.5 rounded-lg border transition-colors ${
            step === 2
              ? 'border-primary bg-primary/10 text-primary font-semibold'
              : step > 2
              ? 'border-border bg-muted/40 text-foreground'
              : 'border-border text-muted-foreground'
          }`}
        >
          {step > 2 ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
          ) : (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted-foreground text-card text-[10px]">
              2
            </span>
          )}
          <span>Git Repository</span>
        </div>

        <div
          className={`flex items-center gap-2 p-2.5 rounded-lg border transition-colors ${
            step === 3
              ? 'border-primary bg-primary/10 text-primary font-semibold'
              : 'border-border text-muted-foreground'
          }`}
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted-foreground text-card text-[10px]">
            3
          </span>
          <span>Environment Vars</span>
        </div>
      </div>

      {/* Step 1: General Info */}
      {step === 1 && (
        <Form {...step1Form}>
          <form
            noValidate
            onSubmit={step1Form.handleSubmit(handleNextFromStep1)}
            className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-5"
          >
            <div className="space-y-4">
              <FormField
                control={step1Form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Payments Gateway" {...field} />
                    </FormControl>
                    <FormMessage />
                    <FormDescription>
                      A human-readable title for your application service.
                    </FormDescription>
                  </FormItem>
                )}
              />

              <FormField
                control={step1Form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Brief summary of service responsibilities and dependencies..."
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={step1Form.control}
                name="runtime"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Target Runtime Engine *</FormLabel>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {runtimes.map((r) => (
                        <div
                          key={r.id}
                          onClick={() => field.onChange(r.id)}
                          className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                            field.value === r.id
                              ? 'border-primary bg-primary/5 text-foreground ring-1 ring-primary'
                              : 'border-border bg-card hover:bg-muted/40 text-muted-foreground'
                          }`}
                        >
                          <div className="mt-0.5">
                            {r.id === 'rust' && <Layers className="h-4 w-4 text-orange-500" />}
                            {r.id === 'node' && <Layers className="h-4 w-4 text-emerald-500" />}
                            {r.id === 'python' && <Layers className="h-4 w-4 text-blue-500" />}
                            {r.id === 'go' && <Layers className="h-4 w-4 text-cyan-500" />}
                            {r.id === 'docker' && <Layers className="h-4 w-4 text-purple-500" />}
                          </div>
                          <div>
                            <p className="font-semibold text-xs text-foreground">{r.label}</p>
                            <p className="text-[11px] text-muted-foreground">{r.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={step1Form.control}
                name="project_type"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Project Structure *</FormLabel>
                    <div className="grid grid-cols-2 gap-2.5">
                      <div
                        onClick={() => field.onChange('repo')}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          field.value === 'repo'
                            ? 'border-primary bg-primary/5 text-foreground ring-1 ring-primary'
                            : 'border-border bg-card hover:bg-muted/40 text-muted-foreground'
                        }`}
                      >
                        <p className="font-semibold text-xs text-foreground">Standard Repository</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          Direct single-service repo with runtime configs at root.
                        </p>
                      </div>

                      <div
                        onClick={() => field.onChange('dockerfile')}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          field.value === 'dockerfile'
                            ? 'border-primary bg-primary/5 text-foreground ring-1 ring-primary'
                            : 'border-border bg-card hover:bg-muted/40 text-muted-foreground'
                        }`}
                      >
                        <p className="font-semibold text-xs text-foreground">Dockerfile / Container</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          Custom multi-stage Docker build with container registry support.
                        </p>
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border">
              {isModal && onCancel ? (
                <Button type="button" variant="outline" size="sm" onClick={onCancel}>
                  Cancel
                </Button>
              ) : (
                <div />
              )}
              <Button type="submit" size="sm">
                Next: Git Repository
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </form>
        </Form>
      )}

      {/* Step 2: Git Repository */}
      {step === 2 && (
        <Form {...step2Form}>
          <form
            noValidate
            onSubmit={step2Form.handleSubmit(handleNextFromStep2)}
            className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-5"
          >
            <div className="space-y-4">
              <FormField
                control={step2Form.control}
                name="repository_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Git Repository URL *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://github.com/organization/repository"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                    <FormDescription>
                      HTTPS clone URL for your GitHub, GitLab, or self-hosted Git repository.
                    </FormDescription>
                  </FormItem>
                )}
              />

              <FormField
                control={step2Form.control}
                name="branch"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Production Branch *</FormLabel>
                    <FormControl>
                      <Input placeholder="main" {...field} />
                    </FormControl>
                    <FormMessage />
                    <FormDescription>
                      Branch targeted for production deployments and automated webhooks.
                    </FormDescription>
                  </FormItem>
                )}
              />

              <FormField
                control={step2Form.control}
                name="pat_token"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Personal Access Token (PAT) for Private Repos</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="ghp_xxxxxxxxxxxxxxxxxxxx (Optional if public repo)"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                    <FormDescription>
                      Encrypted with AES-256-GCM before storage. Only used to clone private code during build.
                    </FormDescription>
                  </FormItem>
                )}
              />
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border">
              <Button type="button" variant="outline" size="sm" onClick={() => setStep(1)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button type="submit" size="sm">
                Next: Environment Variables
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </form>
        </Form>
      )}

      {/* Step 3: Environment Variables */}
      {step === 3 && (
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-sm">Initial Environment Variables</h3>
                <p className="text-xs text-muted-foreground">
                  Variables can also be added, masked, or updated later in Project Settings.
                </p>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addEnvRow} className="h-8 text-xs">
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Add Variable
              </Button>
            </div>

            <div className="space-y-2.5">
              {envVars.map((row, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Input
                    placeholder="KEY_NAME (POSIX)"
                    value={row.key}
                    onChange={(e) => updateEnvRow(idx, 'key', e.target.value.toUpperCase())}
                    className="font-mono text-xs flex-1 uppercase h-9"
                  />
                  <div className="relative flex-1">
                    <Input
                      placeholder="Secret value"
                      type={visibleSecrets[idx] ? 'text' : 'password'}
                      value={row.value}
                      onChange={(e) => updateEnvRow(idx, 'value', e.target.value)}
                      className="font-mono text-xs pr-9 h-9"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleSecretVisibility(idx)}
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-foreground"
                      title={visibleSecrets[idx] ? 'Hide secret value' : 'Show secret value'}
                    >
                      {visibleSecrets[idx] ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </Button>
                  </div>
                  <select
                    value={row.environment}
                    onChange={(e) => updateEnvRow(idx, 'environment', e.target.value)}
                    className="h-9 rounded-md border border-input bg-background px-3 text-xs"
                  >
                    <option value="all">All Envs</option>
                    <option value="production">Production</option>
                    <option value="preview">Preview</option>
                  </select>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeEnvRow(idx)}
                    className="h-9 w-9 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border">
            <Button type="button" variant="outline" size="sm" onClick={() => setStep(2)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSubmit}
              disabled={createProject.isPending}
            >
              {createProject.isPending ? 'Creating Project...' : 'Create & Finish'}
              <CheckCircle2 className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
