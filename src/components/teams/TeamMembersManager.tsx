'use client';

import React, { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@/lib/validation/zodResolver';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import {
  useTeamMembers,
  useAddTeamMember,
  useRemoveTeamMember,
  useUpdateTeamMemberRole,
  useTeamDetail,
} from '@/lib/hooks/api/useTeams';
import { useOrgMembers } from '@/lib/hooks/api/useOrganizations';
import { useWorkspaceStore } from '@/lib/store/useWorkspaceStore';
import { OrgMemberDTO } from '@/lib/api/types';
import { addTeamMemberSchema, AddTeamMemberValues } from '@/lib/validation/teams';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Users, UserPlus, Trash2 } from 'lucide-react';

export interface TeamMembersManagerProps {
  teamId: string;
  teamName?: string;
  isModal?: boolean;
  onClose?: () => void;
  className?: string;
}

const SUPPORTED_ROLES = [
  { value: 'admin', label: 'Admin' },
  { value: 'lead', label: 'Lead' },
  { value: 'maintainer', label: 'Maintainer' },
  { value: 'member', label: 'Member' },
  { value: 'developer', label: 'Developer' },
  { value: 'viewer', label: 'Viewer' },
];

export function TeamMembersManager({
  teamId,
  teamName: initialTeamName,
  isModal = false,
  onClose,
  className = '',
}: TeamMembersManagerProps) {
  const { toast } = useToast();
  const activeOrgId = useWorkspaceStore((state) => state.activeOrgId);

  const { data: teamDetail } = useTeamDetail(teamId);
  const teamName = initialTeamName || teamDetail?.name || 'Team';

  const { data: orgMembers = [] } = useOrgMembers(activeOrgId || '');

  const orgMemberMap = useMemo(() => {
    const map = new Map<string, OrgMemberDTO>();
    for (const m of orgMembers) {
      if (m.user_id) map.set(m.user_id, m);
      if (m.id) map.set(m.id, m);
    }
    return map;
  }, [orgMembers]);

  const { data: members = [], isLoading } = useTeamMembers(teamId);
  const addMemberMutation = useAddTeamMember(teamId);
  const removeMemberMutation = useRemoveTeamMember(teamId);
  const updateRoleMutation = useUpdateTeamMemberRole(teamId);

  const availableOrgMembers = useMemo(() => {
    return orgMembers.filter(
      (om) => !members.some((m) => m.user_id === om.user_id || m.id === om.id)
    );
  }, [orgMembers, members]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [isManualInput, setIsManualInput] = useState(false);
  const [deletingMemberId, setDeletingMemberId] = useState<string | null>(null);
  const [pendingRemoveMember, setPendingRemoveMember] = useState<{ id: string; name: string } | null>(null);

  const handleRoleChange = async (memberId: string, memberName: string, newRole: string) => {
    try {
      await updateRoleMutation.mutateAsync({ memberId, role: newRole });
      toast({
        title: 'Role Updated',
        description: `Updated ${memberName}'s role to ${newRole}.`,
      });
    } catch (err: any) {
      toast({
        title: 'Update Failed',
        description: err?.message || 'Could not update role.',
        variant: 'destructive',
      });
    }
  };

  const form = useForm<AddTeamMemberValues>({
    resolver: zodResolver(addTeamMemberSchema),
    defaultValues: {
      user_id: '',
      role: 'member',
    },
  });

  const handleAddMember = async (values: AddTeamMemberValues) => {
    try {
      const trimmedUserId = values.user_id.trim();
      const trimmedRole = values.role.trim().toLowerCase();

      await addMemberMutation.mutateAsync({
        user_id: trimmedUserId,
        role: trimmedRole,
      });

      const matchedOrgUser = orgMemberMap.get(trimmedUserId);
      const userLabel = matchedOrgUser?.name || matchedOrgUser?.email || `User (${trimmedUserId.slice(0, 8)})`;

      toast({
        title: 'Member Added',
        description: `${userLabel} has been added to ${teamName}.`,
      });

      form.reset({
        user_id: '',
        role: 'member',
      });
      setShowAddForm(false);
    } catch (err: any) {
      toast({
        title: 'Failed to Add Member',
        description: err?.message || 'Could not assign member to this team.',
        variant: 'destructive',
      });
    }
  };

  const handleConfirmRemoveMember = async () => {
    if (!pendingRemoveMember) return;

    setDeletingMemberId(pendingRemoveMember.id);
    try {
      await removeMemberMutation.mutateAsync(pendingRemoveMember.id);
      toast({
        title: 'Member Removed',
        description: `${pendingRemoveMember.name} was removed from ${teamName}.`,
      });
      setPendingRemoveMember(null);
    } catch (err: any) {
      toast({
        title: 'Failed to Remove Member',
        description: err?.message || 'Could not remove member.',
        variant: 'destructive',
      });
    } finally {
      setDeletingMemberId(null);
    }
  };

  return (
    <div className={`flex flex-col space-y-4 ${className}`}>
      {/* Action Bar / Stats */}
      <div className="flex items-center justify-between pt-1 pb-2 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">
            {members.length} {members.length === 1 ? 'member' : 'members'} enrolled
          </span>
        </div>
        <Button
          type="button"
          variant={showAddForm ? 'outline' : 'default'}
          size="sm"
          onClick={() => {
            setShowAddForm(!showAddForm);
            if (showAddForm) form.reset();
          }}
          className="h-8 text-xs"
        >
          <UserPlus className="mr-1.5 h-3.5 w-3.5" />
          {showAddForm ? 'Cancel' : 'Add Member'}
        </Button>
      </div>

      {/* Add Member Form */}
      {showAddForm && (
        <Form {...form}>
          <form
            noValidate
            onSubmit={form.handleSubmit(handleAddMember)}
            className="p-4 rounded-lg border border-border bg-muted/40 space-y-3 animate-in fade-in duration-200"
          >
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Add New Member
            </h4>

            <div className="space-y-3">
              {availableOrgMembers.length > 0 && !isManualInput ? (
                <FormField
                  control={form.control}
                  name="user_id"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <FormLabel className="text-xs">User Collaborator *</FormLabel>
                        <button
                          type="button"
                          onClick={() => {
                            setIsManualInput(true);
                            field.onChange('');
                          }}
                          className="text-[11px] text-primary hover:underline"
                        >
                          Enter UUID manually
                        </button>
                      </div>
                      <FormControl>
                        <select
                          value={field.value}
                          onChange={(e) => field.onChange(e.target.value)}
                          className="h-8 w-full rounded-md border border-input bg-background px-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                        >
                          <option value="">-- Select Organization Member --</option>
                          {availableOrgMembers.map((om) => (
                            <option key={om.user_id || om.id} value={om.user_id}>
                              {om.name ? `${om.name} (${om.email})` : om.email}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                <FormField
                  control={form.control}
                  name="user_id"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <FormLabel className="text-xs">User UUID *</FormLabel>
                        {availableOrgMembers.length > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              setIsManualInput(false);
                              field.onChange('');
                            }}
                            className="text-[11px] text-primary hover:underline"
                          >
                            Select from org members
                          </button>
                        )}
                      </div>
                      <FormControl>
                        <Input
                          placeholder="e.g. 77371d01-2e92-4e51-99ae-f4dd337d6085"
                          className="h-8 text-xs font-mono"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-xs">Team Role *</FormLabel>
                    <FormControl>
                      <select
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                        className="h-8 w-full rounded-md border border-input bg-background px-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                      >
                        <option value="member">Member (Deployments & environment access)</option>
                        <option value="admin">Admin (Full administrative squad privileges)</option>
                        <option value="lead">Lead (Team lead & architecture ownership)</option>
                        <option value="maintainer">Maintainer (Service updates & configurations)</option>
                        <option value="developer">Developer (Build & pipeline access)</option>
                        <option value="viewer">Viewer (Read-only observability)</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => {
                  setShowAddForm(false);
                  form.reset();
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="h-7 text-xs"
                disabled={addMemberMutation.isPending}
              >
                {addMemberMutation.isPending ? 'Adding...' : 'Add to Team'}
              </Button>
            </div>
          </form>
        </Form>
      )}

      {/* Member List */}
      <div
        className={`flex-1 overflow-y-auto divide-y divide-border rounded-md border border-border ${
          isModal ? 'min-h-[160px] max-h-[320px]' : 'min-h-[240px]'
        }`}
      >
        {isLoading ? (
          <div className="p-4 space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : members.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <Users className="mx-auto h-8 w-8 text-muted-foreground/60" />
            <p className="text-xs text-muted-foreground">No members assigned to this team yet.</p>
            <Button
              type="button"
              variant="link"
              size="sm"
              className="text-xs h-auto p-0 text-primary"
              onClick={() => setShowAddForm(true)}
            >
              Add the first member
            </Button>
          </div>
        ) : (
          members.map((member, index) => {
            const memberIdentifier = member.user_id || member.id || `member-${index}`;
            const orgMember = member.user_id ? orgMemberMap.get(member.user_id) : (member.id ? orgMemberMap.get(member.id) : undefined);

            const displayName =
              member.name ||
              orgMember?.name ||
              member.email ||
              orgMember?.email ||
              (member.user_id ? `User (${member.user_id.slice(0, 8)})` : 'Team Member');

            const displayEmail = member.email || orgMember?.email;
            const avatarInitials = (displayName || member.user_id || 'TM').slice(0, 2).toUpperCase();
            const normalizedRole = (member.role || 'member').toLowerCase();

            return (
              <div
                key={memberIdentifier}
                className="flex items-center justify-between p-3.5 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                    {avatarInitials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">{displayName}</p>
                    {displayEmail ? (
                      <p className="text-[11px] text-muted-foreground font-mono truncate">
                        {displayEmail}
                      </p>
                    ) : member.user_id ? (
                      <p className="text-[10px] text-muted-foreground font-mono truncate">
                        ID: {member.user_id.slice(0, 8)}...
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={normalizedRole}
                    onChange={(e) => handleRoleChange(memberIdentifier, displayName, e.target.value)}
                    disabled={updateRoleMutation.isPending}
                    className="h-7 rounded border border-input bg-background px-2 text-[11px] font-medium capitalize focus:outline-none focus:ring-1 focus:ring-primary"
                    aria-label={`Change ${displayName}'s role`}
                  >
                    {SUPPORTED_ROLES.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                    {!SUPPORTED_ROLES.some((r) => r.value === normalizedRole) && (
                      <option value={normalizedRole}>
                        {member.role}
                      </option>
                    )}
                  </select>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive transition-colors"
                    onClick={() => setPendingRemoveMember({ id: memberIdentifier, name: displayName })}
                    disabled={deletingMemberId === memberIdentifier}
                    title="Remove member from team"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {onClose && (
        <div className="flex justify-end pt-3 border-t border-border">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="h-8 text-xs"
          >
            Close
          </Button>
        </div>
      )}

      <ConfirmDialog
        isOpen={Boolean(pendingRemoveMember)}
        onOpenChange={(open) => !open && setPendingRemoveMember(null)}
        title="Remove Team Member"
        description={`Are you sure you want to remove ${pendingRemoveMember?.name || ''} from ${teamName}? They will lose access to projects managed by this squad.`}
        confirmText="Remove Member"
        variant="destructive"
        isLoading={removeMemberMutation.isPending}
        onConfirm={handleConfirmRemoveMember}
      />
    </div>
  );
}
