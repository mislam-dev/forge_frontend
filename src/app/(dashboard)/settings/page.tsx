'use client';

import React, { useState, useEffect } from 'react';
import { SettingsHeader } from '@/components/settings/SettingsHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { useUserProfile, useUpdateUserProfile } from '@/lib/hooks/api/useUserProfile';
import { Save, User, Mail, Phone, Image as ImageIcon } from 'lucide-react';

export default function ProfileSettingsPage() {
  const { toast } = useToast();
  const { data: profile, isLoading } = useUserProfile();
  const updateProfile = useUpdateUserProfile();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || '');
      setLastName(profile.last_name || '');
      setPhone(profile.phone || '');
      setImageUrl(profile.image || '');
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile.mutateAsync({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone: phone.trim() || undefined,
        image: imageUrl.trim() || undefined,
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
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first-name">First Name *</Label>
                <Input
                  id="first-name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="last-name">Last Name *</Label>
                <Input
                  id="last-name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  placeholder="+1 (555) 000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="pl-9 text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="image-url">Avatar Photo URL</Label>
              <div className="relative">
                <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="image-url"
                  placeholder="https://..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="pl-9 text-sm font-mono text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-border">
              <Button type="submit" disabled={updateProfile.isPending}>
                <Save className="mr-2 h-4 w-4" />
                {updateProfile.isPending ? 'Saving...' : 'Save Profile'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
