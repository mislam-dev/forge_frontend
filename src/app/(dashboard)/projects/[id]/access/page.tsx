'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@/lib/validation/zodResolver';
import { ProjectHeader } from '@/components/projects/ProjectHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import {
  useProjectAccess,
  useAssignProjectRole,
  useRevokeProjectRole,
} from '@/lib/hooks/api/useProjectAccess';
import {
  projectAccessAssignSchema,
  ProjectAccessAssignValues,
} from '@/lib/validation/projects';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Users, UserPlus, Trash2 } from 'lucide-react';

export default function ProjectAccessPage() {
  const params = useParams();
  const { toast } = useToast();
  const projectId = (params?.id as string) || '';

  const { data: accessList = [], isLoading } = useProjectAccess(projectId);
  const assignRole = useAssignProjectRole(projectId);
  const revokeRole = useRevokeProjectRole(projectId);

  const [dialogOpen, setDialogOpen] = useState(false);

  const form = useForm<ProjectAccessAssignValues>({
    resolver: zodResolver(projectAccessAssignSchema),
    defaultValues: {
      target_type: 'team',
      target_id: '',
      role: 'Member',
    },
  });

  const targetType = form.watch('target_type');

  const handleAssign = async (values: ProjectAccessAssignValues) => {
    try {
      await assignRole.mutateAsync({
        target_id: values.target_id.trim(),
        target_type: values.target_type,
        role: values.role,
      });

      toast({
        title: 'Role Assigned',
        description: `${values.role} role assigned to ${values.target_id}.`,
      });
      form.reset({
        target_type: 'team',
        target_id: '',
        role: 'Member',
      });
      setDialogOpen(false);
    } catch (err: any) {
      toast({
        title: 'Assignment Failed',
        description: err?.message || 'Could not assign project role.',
        variant: 'destructive',
      });
    }
  };

  const handleRevoke = async (id: string, name: string) => {
    if (!confirm(`Revoke project access for "${name}"?`)) return;

    try {
      await revokeRole.mutateAsync(id);
      toast({
        title: 'Access Revoked',
        description: `Removed access for ${name}.`,
      });
    } catch (err: any) {
      toast({
        title: 'Revocation Failed',
        description: err?.message || 'Could not revoke access.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-8">
      <ProjectHeader projectId={projectId} />

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="font-semibold text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Project Access & Permissions
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Control which teams and individual developers have deploy, read, or admin privileges for this service.
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
              <Button size="sm" className="h-9 text-xs">
                <UserPlus className="mr-1.5 h-3.5 w-3.5" />
                Assign Role
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Assign Project Role</DialogTitle>
                <DialogDescription>
                  Grant a team or team member role-based privileges on this project.
                </DialogDescription>
              </DialogHeader>

              <Form {...form}>
                <form
                  noValidate
                  onSubmit={form.handleSubmit(handleAssign)}
                  className="space-y-4 py-2"
                >
                  <FormField
                    control={form.control}
                    name="target_type"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel>Grant Access To</FormLabel>
                        <FormControl>
                          <div className="grid grid-cols-2 gap-2">
                            <Button
                              type="button"
                              variant={field.value === 'team' ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => field.onChange('team')}
                              className="text-xs"
                            >
                              Team
                            </Button>
                            <Button
                              type="button"
                              variant={field.value === 'user' ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => field.onChange('user')}
                              className="text-xs"
                            >
                              Individual User
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="target_id"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel>
                          {targetType === 'team' ? 'Team Name *' : 'User Email or Handle *'}
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder={
                              targetType === 'team'
                                ? 'e.g. SRE & Infra Team'
                                : 'e.g. alex@forge.dev'
                            }
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel>Access Level</FormLabel>
                        <FormControl>
                          <select
                            value={field.value}
                            onChange={(e) => field.onChange(e.target.value)}
                            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                          >
                            <option value="Admin">Admin (Full Control, Secrets, Delete)</option>
                            <option value="Member">Member (Deploy, View Logs, Trigger)</option>
                            <option value="Viewer">Viewer (Read-only, View Logs)</option>
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
                    <Button type="submit" size="sm" disabled={assignRole.isPending}>
                      {assignRole.isPending ? 'Assigning...' : 'Confirm Assignment'}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Access List Table */}
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-6 space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : accessList.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-base">No Roles Configured</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Only organization administrators currently have access to this project.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30 text-xs text-muted-foreground font-medium">
                    <th className="py-3 px-4 font-medium">Member / Team</th>
                    <th className="py-3 px-4 font-medium">Type</th>
                    <th className="py-3 px-4 font-medium">Role</th>
                    <th className="py-3 px-4 font-medium">Assigned</th>
                    <th className="py-3 px-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {accessList.map((item) => (
                    <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3.5 px-4 font-medium text-xs">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                            {item.name.slice(0, 2).toUpperCase()}
                          </div>
                          <span>{item.name}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <Badge variant="outline" className="capitalize text-xs">
                          {item.type}
                        </Badge>
                      </td>

                      <td className="py-3.5 px-4">
                        <Badge
                          variant={
                            item.role === 'Admin'
                              ? 'default'
                              : item.role === 'Member'
                              ? 'secondary'
                              : 'outline'
                          }
                          className="text-xs"
                        >
                          {item.role}
                        </Badge>
                      </td>

                      <td className="py-3.5 px-4 text-xs text-muted-foreground">
                        {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Active'}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRevoke(item.id, item.name)}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          title="Revoke access"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
