'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useOrganizationDetail } from '@/lib/hooks/api/useOrganizations';
import {
  Building2,
  Users,
  Shield,
  Layers,
} from 'lucide-react';

interface OrgHeaderProps {
  orgId: string;
}

export function OrgHeader({ orgId }: OrgHeaderProps) {
  const pathname = usePathname();
  const { data: org, isLoading } = useOrganizationDetail(orgId);

  const navLinks = [
    { label: 'Overview', href: `/organizations/${orgId}`, exact: true, icon: Building2 },
    { label: 'Members', href: `/organizations/${orgId}/members`, icon: Users },
    { label: 'Teams', href: `/organizations/${orgId}/teams`, icon: Layers },
  ];

  if (isLoading) {
    return (
      <div className="space-y-4 pb-4 border-b border-border">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-8 w-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-2 border-b border-border">
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-sm">
            {org?.name ? org.name.slice(0, 2).toUpperCase() : 'OR'}
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              {org?.name || 'Organization'}
            </h1>
            <p className="text-xs text-muted-foreground font-mono">
              ID: {orgId}
            </p>
          </div>
          <Badge variant="outline" className="capitalize text-xs">
            {org?.type || 'Team'}
          </Badge>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = link.exact
            ? pathname === link.href
            : pathname.startsWith(link.href);

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors shrink-0 ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {link.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
