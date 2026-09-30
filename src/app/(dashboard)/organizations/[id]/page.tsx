'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { OrgHeader } from '@/components/organizations/OrgHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useOrganizationDetail, useOrgMembers } from '@/lib/hooks/api/useOrganizations';
import { useWorkspaceStore } from '@/lib/store/useWorkspaceStore';
import { Building2, Users, ShieldCheck, ArrowRight } from 'lucide-react';

export default function OrganizationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orgId = (params?.id as string) || '';

  const hasHydrated = useWorkspaceStore((state) => state.hasHydrated);
  const activeOrgId = useWorkspaceStore((state) => state.activeOrgId);

  // Enforce workspace isolation
  useEffect(() => {
    if (!hasHydrated) return;
    if (activeOrgId === null) {
      router.replace('/dashboard');
    } else if (activeOrgId !== orgId) {
      router.replace(`/organizations/${activeOrgId}`);
    }
  }, [hasHydrated, activeOrgId, orgId, router]);

  const { data: org, isLoading: isOrgLoading } = useOrganizationDetail(orgId);
  const { data: members = [], isLoading: isMembersLoading } = useOrgMembers(orgId);

  if (!hasHydrated || activeOrgId === null || activeOrgId !== orgId || isOrgLoading) {
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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
            <ShieldCheck className="h-4 w-4 text-primary" />
            Workspace Tier
          </span>
          <div className="text-2xl font-bold capitalize">{org?.type || 'Team'}</div>
          <p className="text-xs text-muted-foreground">Enterprise compliance active</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
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
            {members.length === 0 ? (
              <p className="text-xs text-muted-foreground py-4 text-center">
                No members joined yet in this organization.
              </p>
            ) : (
              members.slice(0, 4).map((m) => {
                const displayName = m.name || m.email || m.user_id || 'Member';
                const initials = (m.name || m.email || m.user_id || 'MB').slice(0, 2).toUpperCase();
                const memberKey = m.user_id || m.id || displayName;

                return (
                  <div key={memberKey} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium truncate">{displayName}</p>
                        {m.email && <p className="text-[11px] text-muted-foreground truncate">{m.email}</p>}
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[10px] capitalize">
                      {m.role}
                    </Badge>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
