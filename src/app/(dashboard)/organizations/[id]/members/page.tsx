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
import { useOrgMembers, useInviteOrgMember } from '@/lib/hooks/api/useOrganizations';
import { inviteMemberSchema, InviteMemberValues } from '@/lib/validation/organizations';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Users, UserPlus, Mail } from 'lucide-react';

export default function OrgMembersPage() {
  const params = useParams();
  const { toast } = useToast();
  const orgId = (params?.id as string) || '';

  const { data: members = [], isLoading } = useOrgMembers(orgId);
  const inviteMember = useInviteOrgMember(orgId);

  const [dialogOpen, setDialogOpen] = useState(false);

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
                        <Badge
                          variant={
                            member.role === 'Owner' || member.role === 'Admin'
                              ? 'default'
                              : 'secondary'
                          }
                          className="text-xs capitalize"
                        >
                          {member.role}
                        </Badge>
                      </td>

                      <td className="py-3.5 px-4 text-xs text-muted-foreground">
                        {member.joined_at ? new Date(member.joined_at).toLocaleDateString() : 'Active'}
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
