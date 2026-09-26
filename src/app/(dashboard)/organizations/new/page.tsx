'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CreateOrgForm } from '@/components/organizations/CreateOrgForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Building2 } from 'lucide-react';
import { useWorkspaceStore } from '@/lib/store/useWorkspaceStore';

export default function NewOrganizationPage() {
  const router = useRouter();
  const { activeOrgId } = useWorkspaceStore();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild className="-ml-2 text-xs text-muted-foreground hover:text-foreground">
          <Link href={`/organizations/${activeOrgId || 'org-1'}`}>
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
            Back to Workspace
          </Link>
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-border">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Create New Organization</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Establish a dedicated multi-tenant workspace for shared projects and members.
            </p>
          </div>
        </div>

        <CreateOrgForm
          onSuccess={(org) => router.push(`/organizations/${org.id}`)}
          onCancel={() => router.push(`/organizations/${activeOrgId || 'org-1'}`)}
        />
      </div>
    </div>
  );
}
