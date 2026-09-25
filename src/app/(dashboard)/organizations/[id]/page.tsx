'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { OrgHeader } from '@/components/organizations/OrgHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useOrganizationDetail, useOrgMembers, useOrgTeams } from '@/lib/hooks/api/useOrganizations';
import { Building2, Users, Layers, ShieldCheck, ArrowRight } from 'lucide-react';

export default function OrganizationDetailPage() {
  const params = useParams();
  const orgId = (params?.id as string) || '';

  const { data: org, isLoading: isOrgLoading } = useOrganizationDetail(orgId);
  const { data: members = [], isLoading: isMembersLoading } = useOrgMembers(orgId);
  const { data: teams = [], isLoading: isTeamsLoading } = useOrgTeams(orgId);

  if (isOrgLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <OrgHeader orgId={orgId} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="rounded-xl border border-border bg-card p-5 space-y-2">
          <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
            <Users className="h-4 w-4 text-primary" />
            Total Members
          </span>
          <div className="text-2xl font-bold">{members.length}</div>
          <p className="text-xs text-muted-foreground">Collaborators in this tenant</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 space-y-2">
          <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
            <Layers className="h-4 w-4 text-primary" />
            Internal Teams
          </span>
          <div className="text-2xl font-bold">{teams.length}</div>
          <p className="text-xs text-muted-foreground">Functional groups and guilds</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 space-y-2">
          <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-primary" />
            Workspace Tier
          </span>
          <div className="text-2xl font-bold capitalize">{org?.type || 'Team'}</div>
          <p className="text-xs text-muted-foreground">Enterprise compliance active</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Quick Members Preview */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-base flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              Members Preview
            </h3>
            <Button variant="ghost" size="sm" asChild className="text-xs h-8">
              <Link href={`/organizations/${orgId}/members`}>
                Manage All
                <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>

          <div className="space-y-2.5">
            {members.slice(0, 4).map((m) => (
              <div key={m.id} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                    {m.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium truncate">{m.name}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{m.email}</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-[10px] capitalize">
                  {m.role}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Teams Preview */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-base flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" />
              Teams Preview
            </h3>
            <Button variant="ghost" size="sm" asChild className="text-xs h-8">
              <Link href={`/organizations/${orgId}/teams`}>
                Manage All
                <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>

          <div className="space-y-2.5">
            {teams.length === 0 ? (
              <p className="text-xs text-muted-foreground py-4 text-center">
                No teams formed yet in this organization.
              </p>
            ) : (
              teams.slice(0, 4).map((t) => (
                <div key={t.id} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30">
                  <div>
                    <p className="text-xs font-medium">{t.name}</p>
                    <p className="text-[11px] text-muted-foreground truncate max-w-xs">{t.description}</p>
                  </div>
                  <span className="text-[11px] text-muted-foreground font-mono">
                    {t.member_count ?? 1} members
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
