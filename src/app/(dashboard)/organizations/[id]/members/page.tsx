'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@/lib/validation/zodResolver';
import { OrgHeader } from '@/components/organizations/OrgHeader';
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
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import {
  useOrgMembers,
  useInviteOrgMember,
  useRemoveOrgMember,
  useUpdateOrgMemberRole,
} from '@/lib/hooks/api/useOrganizations';
import { inviteMemberSchema, InviteMemberValues } from '@/lib/validation/organizations';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Users, UserPlus, Mail, Trash2 } from 'lucide-react';

export default function OrgMembersPage() {
  const params = useParams();
  const { toast } = useToast();
  const orgId = (params?.id as string) || '';

  const { data: members = [], isLoading } = useOrgMembers(orgId);
  const inviteMember = useInviteOrgMember(orgId);
  const removeMember = useRemoveOrgMember(orgId);
  const updateRole = useUpdateOrgMemberRole(orgId);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingRemoveMember, setPendingRemoveMember] = useState<{ id: string; name: string } | null>(null);

  const handleRoleChange = async (memberId: string, memberName: string, newRole: string) => {
    try {
      await updateRole.mutateAsync({ memberId, role: newRole });
      toast({
        title: 'Role Updated',
        description: `Updated ${memberName}'s role to ${newRole}.`,
      });
    } catch (err: any) {
      toast({
        title: 'Role Update Failed',
        description: err?.message || 'Could not update role.',
        variant: 'destructive',
      });
    }
  };

  const form = useForm<InviteMemberValues>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: {
      email: '',
      role: 'Member',
    },
  });

  const handleInvite = async (values: InviteMemberValues) => {
    try {
      await inviteMember.mutateAsync({
        email: values.email.trim(),
        role: values.role,
      });

      toast({
        title: 'Invitation Sent',
        description: `Invited ${values.email} with role "${values.role}".`,
      });
      form.reset({
        email: '',
        role: 'Member',
      });
      setDialogOpen(false);
    } catch (err: any) {
      toast({
        title: 'Invitation Failed',
        description: err?.message || 'Could not send invitation.',
        variant: 'destructive',
      });
    }
  };

  const handleConfirmRemoveMember = async () => {
    if (!pendingRemoveMember) return;
    try {
      await removeMember.mutateAsync(pendingRemoveMember.id);
      toast({
        title: 'Member Removed',
        description: `${pendingRemoveMember.name} was removed from the organization.`,
      });
      setPendingRemoveMember(null);
    } catch (err: any) {
      toast({
        title: 'Failed to Remove Member',
        description: err?.message || 'Could not remove member.',
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
              <Users className="h-5 w-5 text-primary" />
              Organization Members
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Manage user access, role permissions, and pending workspace invitations.
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
                Invite Member
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Invite Teammate to Organization</DialogTitle>
                <DialogDescription>
                  Send an email invitation link with customized workspace permissions.
                </DialogDescription>
              </DialogHeader>

              <Form {...form}>
                <form noValidate onSubmit={form.handleSubmit(handleInvite)} className="space-y-4 py-2">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Teammate Email Address *</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              type="email"
                              placeholder="colleague@company.com"
                              className="pl-9 text-sm"
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
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Organization Role</FormLabel>
                        <FormControl>
                          <select
                            value={field.value}
                            onChange={(e) => field.onChange(e.target.value as any)}
                            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                          >
                            <option value="Admin">Admin (Manage members, all projects, billing)</option>
                            <option value="Member">Member (Create and deploy projects)</option>
                            <option value="Viewer">Viewer (Read-only access across projects)</option>
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
                    <Button type="submit" size="sm" disabled={inviteMember.isPending}>
                      {inviteMember.isPending ? 'Sending...' : 'Send Invitation'}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Members Table */}
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-6 space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30 text-xs text-muted-foreground font-medium">
                    <th className="py-3 px-4 font-medium">User</th>
                    <th className="py-3 px-4 font-medium">Email</th>
                    <th className="py-3 px-4 font-medium">Role</th>
                    <th className="py-3 px-4 font-medium">Joined</th>
                    <th className="py-3 px-4 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {members.map((member) => (
                    <tr key={member.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3.5 px-4 font-medium text-xs">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                            {member.name.slice(0, 2).toUpperCase()}
                          </div>
                          <span>{member.name}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-xs text-muted-foreground">
                        {member.email}
                      </td>

                      <td className="py-3.5 px-4">
                        <select
                          value={member.role}
                          onChange={(e) => handleRoleChange(member.id, member.name, e.target.value)}
                          disabled={updateRole.isPending}
                          className="h-7 rounded border border-input bg-background px-2 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary capitalize"
                          aria-label={`Change ${member.name}'s role`}
                        >
                          <option value="Owner">Owner</option>
                          <option value="Admin">Admin</option>
                          <option value="Member">Member</option>
                          <option value="Viewer">Viewer</option>
                        </select>
                      </td>

                      <td className="py-3.5 px-4 text-xs text-muted-foreground">
                        {member.joined_at ? new Date(member.joined_at).toLocaleDateString() : 'Active'}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setPendingRemoveMember({ id: member.id, name: member.name })}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          title="Remove member"
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

      <ConfirmDialog
        isOpen={Boolean(pendingRemoveMember)}
        onOpenChange={(open) => !open && setPendingRemoveMember(null)}
        title="Remove Member from Organization"
        description={`Are you sure you want to remove ${pendingRemoveMember?.name || ''} from this organization? They will immediately lose access to all workspace repositories and secrets.`}
        confirmText="Remove Member"
        variant="destructive"
        isLoading={removeMember.isPending}
        onConfirm={handleConfirmRemoveMember}
      />
    </div>
  );
}
