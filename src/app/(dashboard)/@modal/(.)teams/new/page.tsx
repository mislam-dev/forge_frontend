'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CreateTeamForm } from '@/components/teams/CreateTeamForm';

export default function InterceptedNewTeamModal() {
  const router = useRouter();

  return (
    <Dialog open onOpenChange={(open) => !open && router.back()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Team</DialogTitle>
          <DialogDescription>
            Define a new collaborative team inside your active workspace.
          </DialogDescription>
        </DialogHeader>

        <CreateTeamForm
          onSuccess={() => router.back()}
          onCancel={() => router.back()}
        />
      </DialogContent>
    </Dialog>
  );
}
