'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CreateTeamForm } from '@/components/teams/CreateTeamForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users } from 'lucide-react';

export default function NewTeamPage() {
  const router = useRouter();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild className="-ml-2 text-xs text-muted-foreground hover:text-foreground">
          <Link href="/teams">
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
            Back to Teams
          </Link>
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-border">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Create New Team</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Establish a squad to collaborate across services and repository permissions.
            </p>
          </div>
        </div>

        <CreateTeamForm
          onSuccess={() => router.push('/teams')}
          onCancel={() => router.push('/teams')}
        />
      </div>
    </div>
  );
}
