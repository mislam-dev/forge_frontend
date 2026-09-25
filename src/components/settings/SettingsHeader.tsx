'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, ShieldCheck } from 'lucide-react';

export function SettingsHeader() {
  const pathname = usePathname();

  const navLinks = [
    { label: 'Profile Information', href: '/settings', exact: true, icon: User },
    { label: 'Security & Sessions', href: '/settings/security', icon: ShieldCheck },
  ];

  return (
    <div className="space-y-4 pb-2 border-b border-border">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Account Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Personal identity, credential rotation, active session security, and preferences.
        </p>
      </div>

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
