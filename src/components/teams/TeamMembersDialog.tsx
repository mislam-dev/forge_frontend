'use client';

import React, { useState } from 'react';
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
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import {
  useTeamMembers,
  useAddTeamMember,
  useRemoveTeamMember,
} from '@/lib/hooks/api/useTeams';
import { Users, UserPlus, Trash2, Mail, Shield } from 'lucide-react';

interface TeamMembersDialogProps {
  teamId: string;
  teamName: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const roleBadgeVariants: Record<
  string,
  'default' | 'secondary' | 'outline' | 'destructive'
> = {
  Lead: 'default',
  Maintainer: 'secondary',
  Member: 'outline',
  Viewer: 'outline',
};

export function TeamMembersDialog({
  teamId,
  teamName,
  isOpen,
  onOpenChange,
}: TeamMembersDialogProps) {
  const { toast } = useToast();
  const { data: members = [], isLoading } = useTeamMembers(teamId);
  const addMemberMutation = useAddTeamMember(teamId);
  const removeMemberMutation = useRemoveTeamMember(teamId);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'Lead' | 'Maintainer' | 'Member' | 'Viewer'>('Member');
  const [showAddForm, setShowAddForm] = useState(false);
  const [deletingMemberId, setDeletingMemberId] = useState<string | null>(null);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Name and email are both required.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await addMemberMutation.mutateAsync({
        name: name.trim(),
        email: email.trim(),
        role,
      });

      toast({
        title: 'Member Added',
        description: `${name} has been added to ${teamName}.`,
      });
      setName('');
      setEmail('');
      setRole('Member');
      setShowAddForm(false);
    } catch (err: any) {
      toast({
        title: 'Failed to Add Member',
        description: err?.message || 'Could not assign member to this team.',
        variant: 'destructive',
      });
    }
  };

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    if (!confirm(`Are you sure you want to remove ${memberName} from ${teamName}?`)) {
      return;
    }

    setDeletingMemberId(memberId);
    try {
      await removeMemberMutation.mutateAsync(memberId);
      toast({
        title: 'Member Removed',
        description: `${memberName} was removed from ${teamName}.`,
      });
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
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Users className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle className="text-lg">Team Members: {teamName}</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Manage squad roster and assigned operational roles.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex items-center justify-between pt-2 pb-1 border-b border-border">
          <span className="text-xs font-medium text-muted-foreground">
            {members.length} {members.length === 1 ? 'member' : 'members'} enrolled
          </span>
          <Button
            type="button"
            variant={showAddForm ? 'outline' : 'default'}
            size="sm"
            onClick={() => setShowAddForm(!showAddForm)}
            className="h-8 text-xs"
          >
            <UserPlus className="mr-1.5 h-3.5 w-3.5" />
            {showAddForm ? 'Cancel' : 'Add Member'}
          </Button>
        </div>

        {/* Add Member Form */}
        {showAddForm && (
          <form
            onSubmit={handleAddMember}
            className="p-4 rounded-lg border border-border bg-muted/40 space-y-3 animate-in fade-in duration-200"
          >
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Add New Member
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="member-name" className="text-xs">
                  Full Name *
                </Label>
                <Input
                  id="member-name"
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-8 text-xs"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="member-email" className="text-xs">
                  Email Address *
                </Label>
                <Input
                  id="member-email"
                  type="email"
                  placeholder="e.g. john@forge.dev"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-8 text-xs"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="member-role" className="text-xs">
                Team Role
              </Label>
              <select
                id="member-role"
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="h-8 w-full rounded-md border border-input bg-background px-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="Lead">Lead (Team lead & architecture ownership)</option>
                <option value="Maintainer">Maintainer (Service updates & configurations)</option>
                <option value="Member">Member (Deployments & environment access)</option>
                <option value="Viewer">Viewer (Read-only observability)</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => setShowAddForm(false)}
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
        )}

        {/* Member List */}
        <div className="flex-1 overflow-y-auto min-h-[160px] max-h-[320px] divide-y divide-border rounded-md border border-border">
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
            members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-3 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                    {member.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">{member.name}</p>
                    <p className="text-[11px] text-muted-foreground font-mono truncate">
                      {member.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 ml-3">
                  <Badge
                    variant={roleBadgeVariants[member.role] || 'outline'}
                    className="text-[10px] px-2 py-0.5"
                  >
                    {member.role}
                  </Badge>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive transition-colors"
                    onClick={() => handleRemoveMember(member.id, member.name)}
                    disabled={deletingMemberId === member.id}
                    title="Remove member from team"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex justify-end pt-3 border-t border-border">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="h-8 text-xs"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
