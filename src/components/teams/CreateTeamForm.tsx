'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@/lib/validation/zodResolver';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { useCreateTeam } from '@/lib/hooks/api/useTeams';
import { useWorkspaceStore } from '@/lib/store/useWorkspaceStore';
import { createTeamSchema, CreateTeamValues } from '@/lib/validation/teams';
import { TeamDTO } from '@/lib/api/types';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

interface CreateTeamFormProps {
  onSuccess?: (team: TeamDTO) => void;
  onCancel?: () => void;
  className?: string;
}

export function CreateTeamForm({ onSuccess, onCancel, className }: CreateTeamFormProps) {
  const { toast } = useToast();
  const { activeOrgId } = useWorkspaceStore();
  const createTeam = useCreateTeam();

  const form = useForm<CreateTeamValues>({
    resolver: zodResolver(createTeamSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  const handleSubmit = async (values: CreateTeamValues) => {
    try {
      const created = await createTeam.mutateAsync({
        name: values.name.trim(),
        description: values.description?.trim() || '',
        org_id: activeOrgId || 'org-1',
      });

      toast({
        title: 'Team Created',
        description: `Team "${values.name}" created successfully.`,
      });

      form.reset();
      onSuccess?.(created);
    } catch (err: any) {
      toast({
        title: 'Creation Failed',
        description: err?.message || 'Failed to create team.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Form {...form}>
      <form noValidate onSubmit={form.handleSubmit(handleSubmit)} className={`space-y-4 ${className || ''}`}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Team Name *</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Frontend Guild" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Responsibilities, microservices owned, or communication channels..."
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-3 border-t border-border">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onCancel}
              disabled={createTeam.isPending}
            >
              Cancel
            </Button>
          )}
          <Button type="submit" size="sm" disabled={createTeam.isPending}>
            {createTeam.isPending ? 'Creating...' : 'Create Team'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
