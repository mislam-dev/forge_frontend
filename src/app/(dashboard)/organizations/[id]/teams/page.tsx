'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

export default function OrgTeamsRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/teams');
  }, [router]);

  return (
    <div className="space-y-4 max-w-xl mx-auto py-12">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-24 w-full" />
    </div>
  );
}
