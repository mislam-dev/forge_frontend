'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@/lib/validation/zodResolver';
import { SettingsHeader } from '@/components/settings/SettingsHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { useUserProfile, useUpdateUserProfile } from '@/lib/hooks/api/useUserProfile';
import {
  profileSettingsSchema,
  ProfileSettingsValues,
} from '@/lib/validation/settings';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Save, Phone, Image as ImageIcon } from 'lucide-react';

export default function ProfileSettingsPage() {
  const { toast } = useToast();
  const { data: profile, isLoading } = useUserProfile();
  const updateProfile = useUpdateUserProfile();

  const form = useForm<ProfileSettingsValues>({
    resolver: zodResolver(profileSettingsSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      phone: '',
      image: '',
    },
  });

  const firstName = form.watch('first_name');
  const lastName = form.watch('last_name');

  useEffect(() => {
    if (profile) {
      form.reset({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        phone: profile.phone || '',
        image: profile.image || '',
      });
    }
  }, [profile, form]);

  const onSubmit = async (values: ProfileSettingsValues) => {
    try {
      await updateProfile.mutateAsync({
        first_name: values.first_name.trim(),
        last_name: values.last_name.trim(),
        phone: values.phone?.trim() || undefined,
        image: values.image?.trim() || undefined,
      });

      toast({
        title: 'Profile Updated',
        description: 'Your profile changes have been saved.',
      });
    } catch (err: any) {
      toast({
        title: 'Update Failed',
        description: err?.message || 'Could not update profile.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="max-w-3xl space-y-8">
      <SettingsHeader />

      <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-6">
        <div className="flex items-center gap-4 pb-4 border-b border-border">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary font-bold text-xl">
            {firstName && lastName
              ? `${firstName[0]}${lastName[0]}`.toUpperCase()
              : 'ME'}
          </div>
          <div>
            <h2 className="font-semibold text-lg">
              {firstName} {lastName}
            </h2>
            <p className="text-xs text-muted-foreground font-mono">
              User ID: {profile?.user_id || 'user-1'}
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <Form {...form}>
            <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="first_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Monirul" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="last_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Islam" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="+1 (555) 000-0000"
                          className="pl-9 text-sm"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Avatar Photo URL</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="https://..."
                          className="pl-9 text-sm font-mono text-xs"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end pt-4 border-t border-border">
                <Button type="submit" disabled={updateProfile.isPending}>
                  <Save className="mr-2 h-4 w-4" />
                  {updateProfile.isPending ? 'Saving...' : 'Save Profile'}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </div>
    </div>
  );
}
