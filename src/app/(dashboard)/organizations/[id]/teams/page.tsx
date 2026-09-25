'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { OrgHeader } from '@/components/organizations/OrgHeader';
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
import { useOrgTeams } from '@/lib/hooks/api/useOrganizations';
import { useCreateTeam } from '@/lib/hooks/api/useTeams';
import { Layers, Plus, Users } from 'lucide-react';

export default function OrgTeamsPage() {
  const params = useParams();
  const { toast } = useToast();
  const orgId = (params?.id as string) || '';

  const { data: teams = [], isLoading } = useOrgTeams(orgId);
  const createTeam = useCreateTeam();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [teamDesc, setTeamDesc] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Team name is required.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await createTeam.mutateAsync({
        name: teamName.trim(),
        description: teamDesc.trim(),
        org_id: orgId,
      });

      toast({
        title: 'Team Created',
        description: `Team "${teamName}" created successfully.`,
      });
      setTeamName('');
      setTeamDesc('');
      setDialogOpen(false);
    } catch (err: any) {
      toast({
        title: 'Creation Failed',
        description: err?.message || 'Failed to create team.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-8">
      <OrgHeader orgId={orgId} />

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="font-semibold text-lg flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" />
              Organization Teams
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Organize members into functional squads to simplify project access delegation.
            </p>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="h-9 text-xs">
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Create Team
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Team</DialogTitle>
                <DialogDescription>
                  Group developers, DevOps engineers, and viewers for collective project permissions.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleCreate} className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="t-name">Team Name *</Label>
                  <Input
                    id="t-name"
                    placeholder="e.g. SRE & Infrastructure"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="t-desc">Description</Label>
                  <Textarea
                    id="t-desc"
                    placeholder="Responsibilities and projects owned by this team..."
                    value={teamDesc}
                    onChange={(e) => setTeamDesc(e.target.value)}
                    rows={2}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-border">
                  <Button type="button" variant="outline" size="sm" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" disabled={createTeam.isPending}>
                    {createTeam.isPending ? 'Creating...' : 'Create Team'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Teams Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : teams.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card/40 p-12 text-center space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
              <Layers className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-base">No Teams in this Organization</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Create your first team to assign bulk roles and manage shared microservices.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {teams.map((team) => (
              <div
                key={team.id}
                className="flex flex-col justify-between rounded-xl border border-border bg-card p-5 shadow-sm space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-base">{team.name}</h3>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {team.member_count ?? 1} members
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {team.description || 'No description provided.'}
                  </p>
                </div>

                <div className="pt-3 border-t border-border text-xs text-muted-foreground">
                  Created {new Date(team.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
