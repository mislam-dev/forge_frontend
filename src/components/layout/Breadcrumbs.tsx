'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';

export function Breadcrumbs() {
  const pathname = usePathname();

  // Split path into segments, ignoring empty parts
  const segments = pathname.split('/').filter(Boolean);

  const formatSegment = (str: string) => {
    // If it's a UUID or hex commit/depId, truncate gracefully
    if (str.length > 20 && /^[a-f0-9-]+$/i.test(str)) {
      return `${str.slice(0, 8)}...`;
    }
    return str
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  return (
    <nav aria-label="Breadcrumb" className="flex items-center text-sm font-medium text-muted-foreground">
      <ol className="flex items-center space-x-1.5 sm:space-x-2">
        <li className="flex items-center">
          <Link
            href="/dashboard"
            className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <Home className="h-4 w-4" />
            <span className="sr-only">Dashboard</span>
          </Link>
        </li>

        {segments.map((segment, index) => {
          const href = `/${segments.slice(0, index + 1).join('/')}`;
          const isLast = index === segments.length - 1;
          const formatted = formatSegment(segment);

          return (
            <li key={href} className="flex items-center space-x-1.5 sm:space-x-2">
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60 flex-shrink-0" />
              {isLast ? (
                <span className="font-semibold text-foreground truncate max-w-[200px]">
                  {formatted}
                </span>
              ) : (
                <Link
                  href={href}
                  className="hover:text-foreground transition-colors truncate max-w-[150px]"
                >
                  {formatted}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
