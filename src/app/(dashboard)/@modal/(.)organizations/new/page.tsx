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
import { CreateOrgForm } from '@/components/organizations/CreateOrgForm';

export default function InterceptedNewOrganizationModal() {
  const router = useRouter();

  return (
    <Dialog open onOpenChange={(open) => !open && router.back()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Organization</DialogTitle>
          <DialogDescription>
            Establish an isolated multi-tenant workspace for your team services and members.
          </DialogDescription>
        </DialogHeader>

        <CreateOrgForm
          onSuccess={() => router.back()}
          onCancel={() => router.back()}
        />
      </DialogContent>
    </Dialog>
  );
}
