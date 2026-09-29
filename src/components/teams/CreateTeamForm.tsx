'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@/lib/validation/zodResolver';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { useCreateTeam } from '@/lib/hooks/api/useTeams';
import { useOrganizationsList } from '@/lib/hooks/api/useOrganizations';
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
  organizationId?: string;
  onSuccess?: (team: TeamDTO) => void;
  onCancel?: () => void;
  className?: string;
}

export function CreateTeamForm({ organizationId, onSuccess, onCancel, className }: CreateTeamFormProps) {
  const { toast } = useToast();
  const { activeOrgId } = useWorkspaceStore();
  const createTeam = useCreateTeam();

  const { data: orgs = [], isLoading: isOrgsLoading } = useOrganizationsList();
  const [selectedOrg, setSelectedOrg] = React.useState<string>(organizationId || activeOrgId || '');

  React.useEffect(() => {
    if (!selectedOrg && (organizationId || activeOrgId)) {
      setSelectedOrg(organizationId || activeOrgId || '');
    } else if (!selectedOrg && orgs.length > 0) {
      setSelectedOrg(orgs[0].id);
    }
  }, [organizationId, activeOrgId, orgs, selectedOrg]);

  const form = useForm<CreateTeamValues>({
    resolver: zodResolver(createTeamSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  const handleSubmit = async (values: CreateTeamValues) => {
    const targetOrgId = organizationId || activeOrgId || selectedOrg;
    if (!targetOrgId) {
      toast({
        title: 'Organization Required',
        description: 'Please select an organization before creating a team.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const created = await createTeam.mutateAsync({
        name: values.name.trim(),
        descriptions: values.description?.trim() || null,
        organization_id: targetOrgId,
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
        {!organizationId && !activeOrgId && (
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Organization *
            </label>
            {isOrgsLoading ? (
              <div className="h-10 rounded-md bg-muted animate-pulse" />
            ) : orgs.length === 0 ? (
              <div className="text-xs text-muted-foreground p-3 border border-border rounded-md bg-muted/20">
                No organizations found. Please create an organization before creating teams.
              </div>
            ) : (
              <select
                value={selectedOrg}
                onChange={(e) => setSelectedOrg(e.target.value)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-input"
              >
                <option value="">-- Select Organization --</option>
                {orgs.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

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
