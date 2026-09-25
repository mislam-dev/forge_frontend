'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { useCreateProject } from '@/lib/hooks/api/useProjects';
import { useWorkspaceStore } from '@/lib/store/useWorkspaceStore';
import { ProjectRuntime, ProjectType } from '@/lib/api/types';
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
} from 'lucide-react';

interface EnvVarRow {
  key: string;
  value: string;
  environment: string;
}

export default function NewProjectWizardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { activeOrgId } = useWorkspaceStore();
  const createProject = useCreateProject();

  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [runtime, setRuntime] = useState<ProjectRuntime>('rust');
  const [projectType, setProjectType] = useState<ProjectType>('repo');

  // Step 2 state
  const [repoUrl, setRepoUrl] = useState('');
  const [branch, setBranch] = useState('main');
  const [patToken, setPatToken] = useState('');

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

  const handleNextFromStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Project name is required.',
        variant: 'destructive',
      });
      return;
    }
    setStep(2);
  };

  const handleNextFromStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoUrl.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Git repository URL is required.',
        variant: 'destructive',
      });
      return;
    }
    setStep(3);
  };

  const handleSubmit = async () => {
    try {
      const validEnvVars = envVars.filter((ev) => ev.key.trim().length > 0);

      const created = await createProject.mutateAsync({
        name: name.trim(),
        description: description.trim(),
        runtime,
        project_type: projectType,
        organization_id: activeOrgId || 'org-1',
        repository_url: repoUrl.trim(),
        branch: branch.trim() || 'main',
        pat_token: patToken.trim() || undefined,
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
    <div className="max-w-3xl mx-auto space-y-8 py-4">
      {/* Back button and title */}
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-3 -ml-2 text-xs">
          <Link href="/projects">
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
            Back to Projects
          </Link>
        </Button>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Create a New Project</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configure runtime environment, link a Git repository, and define environment secrets.
        </p>
      </div>

      {/* Step Indicators */}
      <div className="grid grid-cols-3 gap-3 text-xs font-medium">
        <div
          className={`flex items-center gap-2 p-3 rounded-lg border transition-colors ${
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
          className={`flex items-center gap-2 p-3 rounded-lg border transition-colors ${
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
          className={`flex items-center gap-2 p-3 rounded-lg border transition-colors ${
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
        <form onSubmit={handleNextFromStep1} className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="project-name">Project Name *</Label>
              <Input
                id="project-name"
                placeholder="e.g. Payments Gateway"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                A human-readable title for your application service.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="project-desc">Description (Optional)</Label>
              <Textarea
                id="project-desc"
                placeholder="Brief summary of service responsibilities and dependencies..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-3">
              <Label>Application Runtime *</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {runtimes.map((rt) => (
                  <button
                    type="button"
                    key={rt.id}
                    onClick={() => setRuntime(rt.id)}
                    className={`flex flex-col text-left p-3.5 rounded-lg border transition-all ${
                      runtime === rt.id
                        ? 'border-primary bg-primary/5 ring-1 ring-primary'
                        : 'border-border hover:bg-muted/50'
                    }`}
                  >
                    <span className="font-semibold text-sm">{rt.label}</span>
                    <span className="text-xs text-muted-foreground mt-0.5">{rt.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-border">
            <Button type="submit">
              Next: Git Repository
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </form>
      )}

      {/* Step 2: Git Repository */}
      {step === 2 && (
        <form onSubmit={handleNextFromStep2} className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="repo-url">Git Repository URL *</Label>
              <Input
                id="repo-url"
                placeholder="https://github.com/organization/repository"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                HTTPS clone URL for your GitHub, GitLab, or self-hosted Git repository.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="branch">Production Branch *</Label>
              <Input
                id="branch"
                placeholder="main"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                Branch targeted for production deployments and automated webhooks.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pat-token">Personal Access Token (PAT) for Private Repos</Label>
              <Input
                id="pat-token"
                type="password"
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx (Optional if public repo)"
                value={patToken}
                onChange={(e) => setPatToken(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Encrypted with AES-256-GCM before storage. Only used to clone private code during build.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={() => setStep(1)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button type="submit">
              Next: Environment Variables
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </form>
      )}

      {/* Step 3: Environment Variables */}
      {step === 3 && (
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-base">Initial Environment Variables</h3>
                <p className="text-xs text-muted-foreground">
                  Variables can also be added, masked, or updated later in Project Settings.
                </p>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addEnvRow}>
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
                    className="font-mono text-xs flex-1 uppercase"
                  />
                  <Input
                    placeholder="Secret value"
                    type="password"
                    value={row.value}
                    onChange={(e) => updateEnvRow(idx, 'value', e.target.value)}
                    className="font-mono text-xs flex-1"
                  />
                  <select
                    value={row.environment}
                    onChange={(e) => updateEnvRow(idx, 'environment', e.target.value)}
                    className="h-10 rounded-md border border-input bg-background px-3 text-xs"
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
                    className="h-10 w-10 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={() => setStep(2)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button
              type="button"
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
