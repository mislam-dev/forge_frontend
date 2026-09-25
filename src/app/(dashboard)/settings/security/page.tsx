'use client';

import React, { useState } from 'react';
import { SettingsHeader } from '@/components/settings/SettingsHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import {
  useChangePassword,
  useActiveSessions,
  useRevokeSession,
} from '@/lib/hooks/api/useUserProfile';
import {
  Lock,
  KeyRound,
  ShieldCheck,
  Laptop,
  Smartphone,
  Trash2,
  CheckCircle2,
} from 'lucide-react';

export default function SecuritySettingsPage() {
  const { toast } = useToast();
  const changePassword = useChangePassword();
  const { data: sessions = [], isLoading: isSessionsLoading } = useActiveSessions();
  const revokeSession = useRevokeSession();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({
        title: 'Validation Error',
        description: 'New password and confirmation do not match.',
        variant: 'destructive',
      });
      return;
    }

    if (newPassword.length < 8) {
      toast({
        title: 'Weak Password',
        description: 'Password must be at least 8 characters long.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await changePassword.mutateAsync({
        current_password: currentPassword,
        new_password: newPassword,
      });

      toast({
        title: 'Password Updated',
        description: 'Your account password has been changed successfully.',
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast({
        title: 'Update Failed',
        description: err?.message || 'Could not update password. Check current password.',
        variant: 'destructive',
      });
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    try {
      await revokeSession.mutateAsync(sessionId);
      toast({
        title: 'Session Revoked',
        description: 'The selected device has been logged out.',
      });
    } catch (err: any) {
      toast({
        title: 'Revoke Failed',
        description: err?.message || 'Could not revoke session.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="max-w-3xl space-y-8">
      <SettingsHeader />

      {/* Password Rotation Form */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-6">
        <div>
          <h2 className="font-semibold text-lg flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            Change Password
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Passwords must contain at least 8 characters, with letters, numbers, and symbols.
          </p>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
          <div className="space-y-2">
            <Label htmlFor="current-pw">Current Password</Label>
            <Input
              id="current-pw"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-pw">New Password</Label>
            <Input
              id="new-pw"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-pw">Confirm New Password</Label>
            <Input
              id="confirm-pw"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <div className="pt-2">
            <Button type="submit" size="sm" disabled={changePassword.isPending}>
              <KeyRound className="mr-2 h-4 w-4" />
              {changePassword.isPending ? 'Updating...' : 'Update Password'}
            </Button>
          </div>
        </form>
      </div>

      {/* MFA Security Status */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="h-5 w-5 text-emerald-500" />
            <div>
              <h3 className="font-semibold text-base">Two-Factor Authentication (MFA)</h3>
              <p className="text-xs text-muted-foreground">
                Protect your account with Time-based One-Time Passwords (TOTP) or hardware security keys.
              </p>
            </div>
          </div>
          <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs">
            Enabled
          </Badge>
        </div>
      </div>

      {/* Active Sessions */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-6">
        <div>
          <h2 className="font-semibold text-lg flex items-center gap-2">
            <Laptop className="h-5 w-5 text-primary" />
            Active Sessions & Devices
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Devices that are currently signed into your Forge account across web and CLI clients.
          </p>
        </div>

        {isSessionsLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        ) : (
          <div className="divide-y divide-border">
            {sessions.map((sess) => (
              <div
                key={sess.id}
                className="py-3.5 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    {sess.device.includes('iPhone') ? (
                      <Smartphone className="h-4 w-4" />
                    ) : (
                      <Laptop className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-xs text-foreground">
                        {sess.device}
                      </span>
                      {sess.is_current && (
                        <Badge variant="default" className="text-[10px] h-4 px-1.5">
                          Current
                        </Badge>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground font-mono">
                      {sess.browser} • {sess.ip_address} • {sess.last_active}
                    </p>
                  </div>
                </div>

                {!sess.is_current && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRevokeSession(sess.id)}
                    className="h-8 text-xs text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" />
                    Revoke
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
