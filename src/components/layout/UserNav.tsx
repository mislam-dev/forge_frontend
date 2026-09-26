'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useWorkspaceStore } from '@/lib/store/useWorkspaceStore';
import {
  User,
  Settings,
  Shield,
  BookOpen,
  LogOut,
  Sun,
  Moon,
  Laptop,
  Building2,
} from 'lucide-react';

export function UserNav() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { activeOrgId } = useWorkspaceStore();
  const [userName, setUserName] = useState('Monirul Islam');
  const [userEmail, setUserEmail] = useState('monirul@forge.dev');

  useEffect(() => {
    // Attempt reading user details from storage if present
    const storedUser = localStorage.getItem('forge_user_profile');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        if (parsed.name) setUserName(parsed.name);
        if (parsed.email) setUserEmail(parsed.email);
      } catch {
        // use defaults
      }
    }
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem('forge_access_token');
    localStorage.removeItem('forge_refresh_token');
    localStorage.removeItem('forge_user_profile');
    document.cookie = 'forge_access_token=; path=/; max-age=0; SameSite=Lax';
    router.push('/login');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-9 w-9 rounded-full bg-primary/10 text-primary font-semibold text-xs border border-primary/20 hover:bg-primary/20"
        >
          {getInitials(userName)}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{userName}</p>
            <p className="text-xs leading-none text-muted-foreground truncate">
              {userEmail}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/settings" className="flex items-center cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              <span>Account Settings</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link href="/settings/profile" className="flex items-center cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              <span>Profile Information</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link href="/settings/security" className="flex items-center cursor-pointer">
              <Shield className="mr-2 h-4 w-4" />
              <span>Security & Keys</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link
              href={`/organizations/${activeOrgId || 'org-1'}`}
              className="flex items-center cursor-pointer"
            >
              <Building2 className="mr-2 h-4 w-4" />
              <span>Manage Organization</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link href="#" className="flex items-center cursor-pointer">
              <BookOpen className="mr-2 h-4 w-4" />
              <span>API Documentation</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="cursor-pointer"
          >
            {theme === 'dark' ? (
              <Sun className="mr-2 h-4 w-4" />
            ) : (
              <Moon className="mr-2 h-4 w-4" />
            )}
            <span>Toggle Theme</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={handleSignOut}
          className="text-destructive focus:text-destructive cursor-pointer"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
