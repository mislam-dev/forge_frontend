'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWorkspaceStore } from '@/lib/store/useWorkspaceStore';
import { Skeleton } from '@/components/ui/skeleton';

export default function OrganizationsRedirectPage() {
  const router = useRouter();
  const { activeOrgId } = useWorkspaceStore();

  useEffect(() => {
    const targetOrgId = activeOrgId || 'org-1';
    router.replace(`/organizations/${targetOrgId}`);
  }, [activeOrgId, router]);

  return (
    <div className="space-y-4 max-w-xl mx-auto py-12">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-24 w-full" />
    </div>
  );
}
