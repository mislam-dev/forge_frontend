'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@/lib/validation/zodResolver';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { useOrganizationsList, useCreateOrganization } from '@/lib/hooks/api/useOrganizations';
import { useWorkspaceStore } from '@/lib/store/useWorkspaceStore';
import { createOrgSchema, CreateOrgValues } from '@/lib/validation/organizations';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Building2,
  Plus,
  ArrowRight,
  Check,
} from 'lucide-react';

export default function OrganizationsPage() {
  const { toast } = useToast();
  const { activeOrgId, setActiveOrgId, setActiveOrgName } = useWorkspaceStore();
  const { data: orgs = [], isLoading } = useOrganizationsList();
  const createOrg = useCreateOrganization();

  const [dialogOpen, setDialogOpen] = useState(false);

  const form = useForm<CreateOrgValues>({
    resolver: zodResolver(createOrgSchema),
    defaultValues: {
      name: '',
      description: '',
      type: 'Team',
    },
  });

  const handleCreate = async (values: CreateOrgValues) => {
    try {
      const created = await createOrg.mutateAsync({
        name: values.name.trim(),
        description: values.description?.trim() || '',
        type: values.type,
      });

      toast({
        title: 'Organization Created',
        description: `Workspace "${created.name}" is now ready.`,
      });

      setActiveOrgId(created.id);
      setActiveOrgName(created.name);
      form.reset();
      setDialogOpen(false);
    } catch (err: any) {
      toast({
        title: 'Creation Failed',
        description: err?.message || 'Could not create organization.',
        variant: 'destructive',
      });
    }
  };

  const handleSelectWorkspace = (id: string, orgName: string) => {
    setActiveOrgId(id);
    setActiveOrgName(orgName);
    toast({
      title: 'Workspace Switched',
      description: `Active organization context set to "${orgName}".`,
    });
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Organizations</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your company workspaces, tenant boundaries, and team billing entities.
          </p>
        </div>

        <Dialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) {
              form.reset();
            }
          }}
        >
          <DialogTrigger asChild>
            <Button className="h-9 text-xs">
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              New Organization
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Organization</DialogTitle>
              <DialogDescription>
                Establish a dedicated workspace for shared projects, repositories, and members.
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form noValidate onSubmit={form.handleSubmit(handleCreate)} className="space-y-4 py-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Organization Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Acme Corp" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Brief summary of company or business unit..."
                          rows={2}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Workspace Type</FormLabel>
                      <FormControl>
                        <select
                          value={field.value}
                          onChange={(e) => field.onChange(e.target.value as any)}
                          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                        >
                          <option value="Team">Team (Collaborative)</option>
                          <option value="Enterprise">Enterprise (SAML SSO, Vault)</option>
                          <option value="Personal">Personal (Sandbox)</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-2 pt-2 border-t border-border">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" disabled={createOrg.isPending}>
                    {createOrg.isPending ? 'Creating...' : 'Create Workspace'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Organizations Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-5 space-y-4">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-8 w-24" />
            </div>
          ))}
        </div>
      ) : orgs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/40 p-12 text-center space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
            <Building2 className="h-6 w-6" />
          </div>
          <h3 className="font-semibold text-base">No Organizations</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Create an organization to collaborate with your team and isolate project environments.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {orgs.map((org) => {
            const isActive = activeOrgId === org.id;

            return (
              <div
                key={org.id}
                className={`group flex flex-col justify-between rounded-xl border bg-card p-5 shadow-sm transition-all ${
                  isActive
                    ? 'border-primary ring-1 ring-primary/20 bg-primary/[0.02]'
                    : 'border-border hover:border-border/80'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-sm">
                        {org.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <Link
                          href={`/organizations/${org.id}`}
                          className="font-semibold text-base tracking-tight hover:underline block truncate"
                        >
                          {org.name}
                        </Link>
                        <span className="text-xs text-muted-foreground font-mono">
                          {org.slug}
                        </span>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs shrink-0 capitalize">
                      {org.type}
                    </Badge>
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed min-h-[2.5rem]">
                    {org.description || 'Enterprise workspace organization for cloud microservices.'}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-xs">
                  {isActive ? (
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                      <Check className="h-3.5 w-3.5" />
                      Active Workspace
                    </span>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSelectWorkspace(org.id, org.name)}
                      className="h-8 text-xs text-muted-foreground hover:text-foreground"
                    >
                      Set Active
                    </Button>
                  )}

                  <Button variant="outline" size="sm" asChild className="h-8 text-xs gap-1">
                    <Link href={`/organizations/${org.id}`}>
                      Manage
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
