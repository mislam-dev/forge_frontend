'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@/lib/validation/zodResolver';
import { SettingsHeader } from '@/components/settings/SettingsHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import {
  useChangePassword,
  useActiveSessions,
  useRevokeSession,
} from '@/lib/hooks/api/useUserProfile';
import {
  securityPasswordSchema,
  SecurityPasswordValues,
} from '@/lib/validation/settings';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Lock,
  KeyRound,
  ShieldCheck,
  Laptop,
  Smartphone,
  Trash2,
} from 'lucide-react';

export default function SecuritySettingsPage() {
  const { toast } = useToast();
  const changePassword = useChangePassword();
  const { data: sessions = [], isLoading: isSessionsLoading } = useActiveSessions();
  const revokeSession = useRevokeSession();

  const form = useForm<SecurityPasswordValues>({
    resolver: zodResolver(securityPasswordSchema),
    defaultValues: {
      current_password: '',
      new_password: '',
      confirm_password: '',
    },
  });

  const handleChangePassword = async (values: SecurityPasswordValues) => {
    try {
      await changePassword.mutateAsync({
        current_password: values.current_password,
        new_password: values.new_password,
      });

      toast({
        title: 'Password Updated',
        description: 'Your account password has been changed successfully.',
      });
      form.reset({
        current_password: '',
        new_password: '',
        confirm_password: '',
      });
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

        <Form {...form}>
          <form
            noValidate
            onSubmit={form.handleSubmit(handleChangePassword)}
            className="space-y-4 max-w-md"
          >
            <FormField
              control={form.control}
              name="current_password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Password *</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="new_password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password *</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirm_password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm New Password *</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="pt-2">
              <Button type="submit" size="sm" disabled={changePassword.isPending}>
                <KeyRound className="mr-2 h-4 w-4" />
                {changePassword.isPending ? 'Updating...' : 'Update Password'}
              </Button>
            </div>
          </form>
        </Form>
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
