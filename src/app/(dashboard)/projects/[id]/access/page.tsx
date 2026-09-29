'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@/lib/validation/zodResolver';
import { ProjectHeader } from '@/components/projects/ProjectHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { useWorkspaceStore } from '@/lib/store/useWorkspaceStore';
import {
  useProjectMembers,
  useAssignProjectMember,
  useRemoveProjectMember,
  useProjectTeams,
  useAssignProjectTeam,
  useRemoveProjectTeam,
} from '@/lib/hooks/api/useProjectAccess';
import { useTeamsList } from '@/lib/hooks/api/useTeams';
import {
  projectMemberAssignSchema,
  projectTeamAssignSchema,
  ProjectMemberAssignValues,
  ProjectTeamAssignValues,
} from '@/lib/validation/projects';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Users, UserPlus, Users2, Trash2, Shield } from 'lucide-react';

export default function ProjectAccessPage() {
  const params = useParams();
  const { toast } = useToast();
  const projectId = (params?.id as string) || '';

  // Workspace context: personal vs organization
  const activeOrgId = useWorkspaceStore((state) => state.activeOrgId);
  const isOrgWorkspace = Boolean(activeOrgId);

  // Direct project members
  const { data: members = [], isLoading: isLoadingMembers } = useProjectMembers(projectId);
  const assignMember = useAssignProjectMember(projectId);
  const removeMember = useRemoveProjectMember(projectId);

  // Project team assignments (enabled only in organization workspace)
  const { data: teams = [], isLoading: isLoadingTeams } = useProjectTeams(projectId, {
    enabled: isOrgWorkspace,
  });
  const { data: orgTeams = [], isLoading: isLoadingOrgTeams } = useTeamsList(activeOrgId || undefined);
  const assignTeam = useAssignProjectTeam(projectId);
  const removeTeam = useRemoveProjectTeam(projectId);

  // Dialog & confirm states
  const [memberDialogOpen, setMemberDialogOpen] = useState(false);
  const [teamDialogOpen, setTeamDialogOpen] = useState(false);
  const [pendingRevoke, setPendingRevoke] = useState<{
    id: string;
    name: string;
    type: 'member' | 'team';
  } | null>(null);

  // Form for Member Assignment
  const memberForm = useForm<ProjectMemberAssignValues>({
    resolver: zodResolver(projectMemberAssignSchema),
    defaultValues: {
      user_id: '',
      role: 'developer',
    },
  });

  // Form for Team Assignment
  const teamForm = useForm<ProjectTeamAssignValues>({
    resolver: zodResolver(projectTeamAssignSchema),
    defaultValues: {
      team_id: '',
      role: 'developer',
    },
  });

  const handleAssignMember = async (values: ProjectMemberAssignValues) => {
    try {
      await assignMember.mutateAsync({
        user_id: values.user_id.trim(),
        role: values.role,
      });

      toast({
        title: 'Collaborator Assigned',
        description: `Granted ${values.role} role to ${values.user_id}.`,
      });
      memberForm.reset({
        user_id: '',
        role: 'developer',
      });
      setMemberDialogOpen(false);
    } catch (err: any) {
      toast({
        title: 'Assignment Failed',
        description: err?.message || 'Could not assign project collaborator.',
        variant: 'destructive',
      });
    }
  };

  const handleAssignTeam = async (values: ProjectTeamAssignValues) => {
    try {
      await assignTeam.mutateAsync({
        team_id: values.team_id,
        role: values.role,
      });

      toast({
        title: 'Team Assigned',
        description: `Assigned team to project with ${values.role} role.`,
      });
      teamForm.reset({
        team_id: '',
        role: 'developer',
      });
      setTeamDialogOpen(false);
    } catch (err: any) {
      toast({
        title: 'Team Assignment Failed',
        description: err?.message || 'Could not assign team to project.',
        variant: 'destructive',
      });
    }
  };

  const handleConfirmRevoke = async () => {
    if (!pendingRevoke) return;

    try {
      if (pendingRevoke.type === 'member') {
        await removeMember.mutateAsync(pendingRevoke.id);
        toast({
          title: 'Access Revoked',
          description: `Removed collaborator access for "${pendingRevoke.name}".`,
        });
      } else {
        await removeTeam.mutateAsync(pendingRevoke.id);
        toast({
          title: 'Team Removed',
          description: `Removed team "${pendingRevoke.name}" from project.`,
        });
      }
      setPendingRevoke(null);
    } catch (err: any) {
      toast({
        title: 'Revocation Failed',
        description: err?.message || 'Could not revoke access.',
        variant: 'destructive',
      });
    }
  };

  // Helper to format role badge variant
  const getRoleBadgeVariant = (role: string) => {
    const lower = role.toLowerCase();
    if (lower === 'admin') return 'default';
    if (lower === 'developer' || lower === 'member') return 'secondary';
    return 'outline';
  };

  // Renders the Direct Members Table
  const renderMembersTable = () => (
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      {isLoadingMembers ? (
        <div className="p-6 space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : members.length === 0 ? (
        <div className="p-12 text-center space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
            <Users className="h-6 w-6" />
          </div>
          <h3 className="font-semibold text-base">No Collaborators Assigned</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Only the project owner currently has access. Grant individual user collaborators access above.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30 text-xs text-muted-foreground font-medium">
                <th className="py-3 px-4 font-medium">User Collaborator</th>
                <th className="py-3 px-4 font-medium">Role</th>
                <th className="py-3 px-4 font-medium">Assigned</th>
                <th className="py-3 px-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {members.map((member) => (
                <tr key={member.id || member.user_id} className="hover:bg-muted/30 transition-colors">
                  <td className="py-3.5 px-4 font-medium text-xs">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                        {(member.name || member.email || member.user_id).slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-foreground">{member.name || member.email || member.user_id}</div>
                        {member.email && member.name && (
                          <div className="text-[11px] text-muted-foreground">{member.email}</div>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <Badge variant={getRoleBadgeVariant(member.role)} className="text-xs capitalize">
                      {member.role}
                    </Badge>
                  </td>

                  <td className="py-3.5 px-4 text-xs text-muted-foreground">
                    {member.created_at ? new Date(member.created_at).toLocaleDateString() : 'Active'}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        setPendingRevoke({
                          id: member.user_id || member.id,
                          name: member.name || member.email || member.user_id,
                          type: 'member',
                        })
                      }
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
  );

  // Renders the Assigned Teams Table (Organization Space only)
  const renderTeamsTable = () => (
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      {isLoadingTeams ? (
        <div className="p-6 space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : teams.length === 0 ? (
        <div className="p-12 text-center space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
            <Users2 className="h-6 w-6" />
          </div>
          <h3 className="font-semibold text-base">No Teams Assigned</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Assign an organization team to grant team members inherited access to this project.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30 text-xs text-muted-foreground font-medium">
                <th className="py-3 px-4 font-medium">Assigned Team</th>
                <th className="py-3 px-4 font-medium">Role</th>
                <th className="py-3 px-4 font-medium">Team Members</th>
                <th className="py-3 px-4 font-medium">Assigned</th>
                <th className="py-3 px-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {teams.map((team) => (
                <tr key={team.id || team.team_id} className="hover:bg-muted/30 transition-colors">
                  <td className="py-3.5 px-4 font-medium text-xs">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-secondary-foreground text-xs font-bold">
                        <Users2 className="h-3.5 w-3.5" />
                      </div>
                      <span className="font-medium text-foreground">{team.name || team.team_id}</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <Badge variant={getRoleBadgeVariant(team.role)} className="text-xs capitalize">
                      {team.role}
                    </Badge>
                  </td>

                  <td className="py-3.5 px-4 text-xs text-muted-foreground">
                    {team.member_count !== undefined ? `${team.member_count} members` : 'Team roster'}
                  </td>

                  <td className="py-3.5 px-4 text-xs text-muted-foreground">
                    {team.created_at ? new Date(team.created_at).toLocaleDateString() : 'Active'}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        setPendingRevoke({
                          id: team.team_id || team.id,
                          name: team.name || team.team_id,
                          type: 'team',
                        })
                      }
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      title="Remove team"
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
  );

  return (
    <div className="space-y-8">
      <ProjectHeader projectId={projectId} />

      <div className="space-y-6">
        {/* Workspace Info & Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="font-semibold text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              {isOrgWorkspace ? 'Project Access & Permissions' : 'Project Access & Collaborators'}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isOrgWorkspace
                ? 'Manage individual collaborators and assign organization teams to this project.'
                : 'Control which user collaborators have deploy, read, or admin privileges for this personal project.'}
            </p>
          </div>

          {/* If personal workspace, show Assign User button directly in header */}
          {!isOrgWorkspace && (
            <Dialog
              open={memberDialogOpen}
              onOpenChange={(open) => {
                setMemberDialogOpen(open);
                if (!open) memberForm.reset();
              }}
            >
              <DialogTrigger asChild>
                <Button size="sm" className="h-9 text-xs">
                  <UserPlus className="mr-1.5 h-3.5 w-3.5" />
                  Assign User
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Grant Project Access</DialogTitle>
                  <DialogDescription>
                    Grant a user collaborator role-based access privileges on this project.
                  </DialogDescription>
                </DialogHeader>

                <Form {...memberForm}>
                  <form
                    noValidate
                    onSubmit={memberForm.handleSubmit(handleAssignMember)}
                    className="space-y-4 py-2"
                  >
                    <FormField
                      control={memberForm.control}
                      name="user_id"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel>User Identifier or Email *</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. alex@forge.dev or user UUID" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={memberForm.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel>Access Level</FormLabel>
                          <FormControl>
                            <select
                              value={field.value}
                              onChange={(e) => field.onChange(e.target.value as any)}
                              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                            >
                              <option value="admin">Admin (Full Control, Secrets, Delete)</option>
                              <option value="developer">Developer (Deploy, View Logs, Trigger)</option>
                              <option value="viewer">Viewer (Read-only, View Logs)</option>
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
                        onClick={() => setMemberDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" size="sm" disabled={assignMember.isPending}>
                        {assignMember.isPending ? 'Assigning...' : 'Confirm Assignment'}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Content View: Personal Space (no tabs) vs Organization Space (Tabs) */}
        {!isOrgWorkspace ? (
          // Personal Workspace: Direct Collaborators Only
          renderMembersTable()
        ) : (
          // Organization Workspace: Tabs for Direct Members & Assigned Teams
          <Tabs defaultValue="users" className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border pb-3">
              <TabsList>
                <TabsTrigger value="users" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>Direct Collaborators</span>
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px]">
                    {members.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="teams" className="flex items-center gap-2">
                  <Users2 className="h-4 w-4" />
                  <span>Assigned Teams</span>
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px]">
                    {teams.length}
                  </Badge>
                </TabsTrigger>
              </TabsList>

              <div className="flex items-center gap-2">
                {/* Assign User Dialog */}
                <Dialog
                  open={memberDialogOpen}
                  onOpenChange={(open) => {
                    setMemberDialogOpen(open);
                    if (!open) memberForm.reset();
                  }}
                >
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline" className="h-8 text-xs">
                      <UserPlus className="mr-1.5 h-3.5 w-3.5" />
                      Assign User
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Grant Project Access</DialogTitle>
                      <DialogDescription>
                        Grant an individual collaborator access to this project.
                      </DialogDescription>
                    </DialogHeader>

                    <Form {...memberForm}>
                      <form
                        noValidate
                        onSubmit={memberForm.handleSubmit(handleAssignMember)}
                        className="space-y-4 py-2"
                      >
                        <FormField
                          control={memberForm.control}
                          name="user_id"
                          render={({ field }) => (
                            <FormItem className="space-y-2">
                              <FormLabel>User Identifier or Email *</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. alex@forge.dev or user UUID" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={memberForm.control}
                          name="role"
                          render={({ field }) => (
                            <FormItem className="space-y-2">
                              <FormLabel>Access Level</FormLabel>
                              <FormControl>
                                <select
                                  value={field.value}
                                  onChange={(e) => field.onChange(e.target.value as any)}
                                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                                >
                                  <option value="admin">Admin (Full Control, Secrets, Delete)</option>
                                  <option value="developer">Developer (Deploy, View Logs, Trigger)</option>
                                  <option value="viewer">Viewer (Read-only, View Logs)</option>
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
                            onClick={() => setMemberDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button type="submit" size="sm" disabled={assignMember.isPending}>
                            {assignMember.isPending ? 'Assigning...' : 'Confirm Assignment'}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>

                {/* Assign Team Dialog */}
                <Dialog
                  open={teamDialogOpen}
                  onOpenChange={(open) => {
                    setTeamDialogOpen(open);
                    if (!open) teamForm.reset();
                  }}
                >
                  <DialogTrigger asChild>
                    <Button size="sm" className="h-8 text-xs">
                      <Users2 className="mr-1.5 h-3.5 w-3.5" />
                      Assign Team
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Assign Team to Project</DialogTitle>
                      <DialogDescription>
                        Grant an organization team shared access privileges on this project.
                      </DialogDescription>
                    </DialogHeader>

                    <Form {...teamForm}>
                      <form
                        noValidate
                        onSubmit={teamForm.handleSubmit(handleAssignTeam)}
                        className="space-y-4 py-2"
                      >
                        <FormField
                          control={teamForm.control}
                          name="team_id"
                          render={({ field }) => (
                            <FormItem className="space-y-2">
                              <FormLabel>Select Organization Team *</FormLabel>
                              <FormControl>
                                {isLoadingOrgTeams ? (
                                  <Skeleton className="h-10 w-full" />
                                ) : orgTeams.length === 0 ? (
                                  <div className="text-xs text-muted-foreground p-3 border border-border rounded-md bg-muted/20">
                                    No teams found in this organization. Create a team under Organization Teams first.
                                  </div>
                                ) : (
                                  <select
                                    value={field.value}
                                    onChange={(e) => field.onChange(e.target.value)}
                                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                                  >
                                    <option value="">-- Choose a team --</option>
                                    {orgTeams.map((t) => (
                                      <option key={t.id} value={t.id}>
                                        {t.name}
                                      </option>
                                    ))}
                                  </select>
                                )}
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={teamForm.control}
                          name="role"
                          render={({ field }) => (
                            <FormItem className="space-y-2">
                              <FormLabel>Team Access Level</FormLabel>
                              <FormControl>
                                <select
                                  value={field.value}
                                  onChange={(e) => field.onChange(e.target.value as any)}
                                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                                >
                                  <option value="developer">Developer (Deploy, View Logs, Trigger)</option>
                                  <option value="viewer">Viewer (Read-only, View Logs)</option>
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
                            onClick={() => setTeamDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            size="sm"
                            disabled={assignTeam.isPending || orgTeams.length === 0}
                          >
                            {assignTeam.isPending ? 'Assigning...' : 'Assign Team'}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <TabsContent value="users" className="mt-0">
              {renderMembersTable()}
            </TabsContent>

            <TabsContent value="teams" className="mt-0">
              {renderTeamsTable()}
            </TabsContent>
          </Tabs>
        )}
      </div>

      {/* Revocation Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(pendingRevoke)}
        onOpenChange={(open) => !open && setPendingRevoke(null)}
        title={pendingRevoke?.type === 'team' ? 'Remove Team Access' : 'Revoke Collaborator Access'}
        description={
          pendingRevoke?.type === 'team'
            ? `Are you sure you want to remove team "${pendingRevoke?.name || ''}" from this project? Team members will lose inherited access privileges.`
            : `Are you sure you want to revoke project access for "${pendingRevoke?.name || ''}"? They will lose access to deployments and repository secrets.`
        }
        confirmText={pendingRevoke?.type === 'team' ? 'Remove Team' : 'Revoke Access'}
        variant="destructive"
        isLoading={removeMember.isPending || removeTeam.isPending}
        onConfirm={handleConfirmRevoke}
      />
    </div>
  );
}
