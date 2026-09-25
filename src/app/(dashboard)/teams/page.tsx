'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { useForm } from 'react-hook-form';
import { zodResolver } from '@/lib/validation/zodResolver';
import { useTeamsList, useCreateTeam, useDeleteTeam } from '@/lib/hooks/api/useTeams';
import { useWorkspaceStore } from '@/lib/store/useWorkspaceStore';
import { TeamMembersDialog } from '@/components/teams/TeamMembersDialog';
import { createTeamSchema, CreateTeamValues } from '@/lib/validation/teams';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Users, Plus, Trash2, Search, Layers, UserCheck } from 'lucide-react';

export default function GlobalTeamsPage() {
  const { toast } = useToast();
  const { activeOrgId } = useWorkspaceStore();
  const { data: teams = [], isLoading } = useTeamsList();
  const createTeam = useCreateTeam();
  const deleteTeam = useDeleteTeam();

  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [managingTeam, setManagingTeam] = useState<{ id: string; name: string } | null>(null);

  const form = useForm<CreateTeamValues>({
    resolver: zodResolver(createTeamSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  const filteredTeams = teams.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    (t.description && t.description.toLowerCase().includes(search.toLowerCase()))
  );

  const handleCreate = async (values: CreateTeamValues) => {
    try {
      await createTeam.mutateAsync({
        name: values.name.trim(),
        description: values.description?.trim() || '',
        org_id: activeOrgId || 'org-1',
      });

      toast({
        title: 'Team Created',
        description: `Team "${values.name}" created successfully.`,
      });
      form.reset();
      setDialogOpen(false);
    } catch (err: any) {
      toast({
        title: 'Creation Failed',
        description: err?.message || 'Failed to create team.',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string, teamName: string) => {
    if (!confirm(`Are you sure you want to remove team "${teamName}"?`)) return;

    try {
      await deleteTeam.mutateAsync(id);
      toast({
        title: 'Team Removed',
        description: `Team "${teamName}" was removed.`,
      });
    } catch (err: any) {
      toast({
        title: 'Removal Failed',
        description: err?.message || 'Could not remove team.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Teams Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create functional squads, assign project roles, and manage cross-service access policies.
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
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              New Team
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create Team</DialogTitle>
              <DialogDescription>
                Define a new collaborative team inside your active workspace.
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form noValidate onSubmit={form.handleSubmit(handleCreate)} className="space-y-4 py-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Team Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Frontend Guild" {...field} />
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
                          placeholder="Responsibilities, microservices owned, or communication channels..."
                          rows={2}
                          {...field}
                        />
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
                  <Button type="submit" size="sm" disabled={createTeam.isPending}>
                    {createTeam.isPending ? 'Creating...' : 'Create Team'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Filter teams by name or description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-10"
        />
      </div>

      {/* Teams Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-5 space-y-4">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      ) : filteredTeams.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/40 p-12 text-center space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
            <Users className="h-6 w-6" />
          </div>
          <h3 className="font-semibold text-base">No Teams Found</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            {search ? 'No teams match your search keyword.' : 'Get started by creating your first team.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTeams.map((team) => (
            <div
              key={team.id}
              className="flex flex-col justify-between rounded-xl border border-border bg-card p-5 shadow-sm space-y-4 hover:border-primary/30 transition-colors"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Layers className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-base tracking-tight">{team.name}</h3>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {team.member_count ?? 1} members
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setManagingTeam({ id: team.id, name: team.name })}
                      className="h-8 px-2.5 text-xs font-normal"
                      title="Manage members"
                    >
                      <UserCheck className="mr-1.5 h-3.5 w-3.5 text-primary" />
                      Members
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(team.id, team.name)}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      title="Delete team"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed min-h-[2.5rem]">
                  {team.description || 'No description provided.'}
                </p>
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                <span>Created {new Date(team.created_at).toLocaleDateString()}</span>
                <span className="font-mono text-[11px]">ID: {team.id}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {managingTeam && (
        <TeamMembersDialog
          teamId={managingTeam.id}
          teamName={managingTeam.name}
          isOpen={Boolean(managingTeam)}
          onOpenChange={(open) => {
            if (!open) setManagingTeam(null);
          }}
        />
      )}
    </div>
  );
}
