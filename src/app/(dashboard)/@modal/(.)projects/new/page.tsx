'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { NewProjectWizard } from '@/components/projects/NewProjectWizard';

export default function InterceptedNewProjectModal() {
  const router = useRouter();

  const handleDismiss = () => {
    router.back();
  };

  const handleSuccess = (projectId: string) => {
    router.back();
    router.push(`/projects/${projectId}`);
  };

  return (
    <Dialog open onOpenChange={(open) => !open && handleDismiss()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-6">
        <NewProjectWizard
          isModal
          onCancel={handleDismiss}
          onSuccess={handleSuccess}
        />
      </DialogContent>
    </Dialog>
  );
}
