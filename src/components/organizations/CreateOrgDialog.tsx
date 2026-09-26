'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@/lib/validation/zodResolver';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { useCreateOrganization } from '@/lib/hooks/api/useOrganizations';
import { useWorkspaceStore } from '@/lib/store/useWorkspaceStore';
import { createOrgSchema, CreateOrgValues } from '@/lib/validation/organizations';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

interface CreateOrgDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (org: { id: string; name: string }) => void;
}

export function CreateOrgDialog({ isOpen, onOpenChange, onCreated }: CreateOrgDialogProps) {
  const { toast } = useToast();
  const { setActiveOrgId, setActiveOrgName } = useWorkspaceStore();
  const createOrg = useCreateOrganization();

  const form = useForm<CreateOrgValues>({
    resolver: zodResolver(createOrgSchema),
    defaultValues: {
      name: '',
      description: '',
      type: 'Team',
    },
  });

  const handleCreate = async (values: CreateOrgValues) => {
    try {
      const created = await createOrg.mutateAsync({
        name: values.name.trim(),
        description: values.description?.trim() || '',
        type: values.type,
      });

      toast({
        title: 'Organization Created',
        description: `Workspace "${created.name}" is now ready.`,
      });

      setActiveOrgId(created.id);
      setActiveOrgName(created.name);
      form.reset();
      onOpenChange(false);
      if (onCreated) {
        onCreated(created);
      }
    } catch (err: any) {
      toast({
        title: 'Creation Failed',
        description: err?.message || 'Could not create organization.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        onOpenChange(open);
        if (!open) form.reset();
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Organization</DialogTitle>
          <DialogDescription>
            Establish an isolated multi-tenant workspace for your team services and members.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form noValidate onSubmit={form.handleSubmit(handleCreate)} className="space-y-4 py-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organization Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Acme Corp" {...field} />
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
                      placeholder="Brief context about this organizational workspace..."
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Workspace Type</FormLabel>
                  <FormControl>
                    <select
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value as any)}
                      className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    >
                      <option value="Enterprise">Enterprise (Full governance and audit logs)</option>
                      <option value="Team">Team (Collaborative squad workspace)</option>
                      <option value="Personal">Personal (Individual sandbox)</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={createOrg.isPending}>
                {createOrg.isPending ? 'Creating...' : 'Create Organization'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
