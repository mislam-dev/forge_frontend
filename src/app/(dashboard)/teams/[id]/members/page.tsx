'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { TeamMembersManager } from '@/components/teams/TeamMembersManager';
import { useTeamDetail } from '@/lib/hooks/api/useTeams';
import { ArrowLeft, Users, ShieldAlert } from 'lucide-react';

export default function TeamMembersStandalonePage() {
  const params = useParams();
  const teamId = (params?.id as string) || '';

  const { data: team, isLoading, isError } = useTeamDetail(teamId);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="-ml-2 text-xs text-muted-foreground hover:text-foreground"
        >
          <Link href="/teams">
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
            Back to Teams
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-3 w-80" />
            </div>
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center space-y-3">
          <ShieldAlert className="mx-auto h-8 w-8 text-destructive" />
          <h2 className="text-base font-semibold">Failed to Load Team</h2>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            The requested squad or team roster could not be retrieved. It may have been removed or you may lack permissions.
          </p>
          <Button variant="outline" size="sm" asChild className="text-xs">
            <Link href="/teams">Return to Teams Directory</Link>
          </Button>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary mt-0.5">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">{team?.name || 'Team Roster'}</h1>
                <p className="text-xs text-muted-foreground mt-0.5 max-w-xl">
                  {team?.description || 'Manage squad roster and assigned operational roles across deployments.'}
                </p>
              </div>
            </div>

            <div className="text-xs text-muted-foreground font-mono shrink-0 sm:text-right">
              ID: {teamId}
            </div>
          </div>

          <TeamMembersManager
            teamId={teamId}
            teamName={team?.name}
            isModal={false}
          />
        </div>
      )}
    </div>
  );
}
