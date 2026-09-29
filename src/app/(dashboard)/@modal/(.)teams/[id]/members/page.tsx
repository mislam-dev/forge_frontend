'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { TeamMembersManager } from '@/components/teams/TeamMembersManager';
import { useTeamDetail } from '@/lib/hooks/api/useTeams';
import { Users } from 'lucide-react';

export default function InterceptedTeamMembersModal() {
  const router = useRouter();
  const params = useParams();
  const teamId = (params?.id as string) || '';

  const { data: team, isLoading } = useTeamDetail(teamId);
  const teamName = team?.name || (isLoading ? 'Loading...' : 'Team Members');

  return (
    <Dialog open onOpenChange={(open) => !open && router.back()}>
      <DialogContent className="max-w-xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Users className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle className="text-lg">Team Members: {teamName}</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                {team?.description || 'Manage squad roster and assigned operational roles.'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <TeamMembersManager
          teamId={teamId}
          teamName={team?.name}
          isModal={true}
          onClose={() => router.back()}
        />
      </DialogContent>
    </Dialog>
  );
}
