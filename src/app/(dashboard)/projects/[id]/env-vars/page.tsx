'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ProjectHeader } from '@/components/projects/ProjectHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { EncryptedValueMasker } from '@/components/shared/EncryptedValueMasker';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { useProjectEnvVars, useSaveEnvVars } from '@/lib/hooks/api/useEnvVars';
import {
  Key,
  Plus,
  Save,
  Trash2,
  FileCode,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

interface EditableEnvVar {
  id: string;
  key: string;
  value: string;
  masked_value?: string;
  environment: string;
}

const POSIX_KEY_REGEX = /^[A-Z_][A-Z0-9_]*$/;

export default function ProjectEnvVarsPage() {
  const params = useParams();
  const { toast } = useToast();
  const projectId = (params?.id as string) || '';

  const { data: serverEnvVars, isLoading } = useProjectEnvVars(projectId);
  const saveEnvVars = useSaveEnvVars(projectId);

  const [envVars, setEnvVars] = useState<EditableEnvVar[]>([]);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [bulkInput, setBulkInput] = useState('');
  const [bulkError, setBulkError] = useState<string | null>(null);

  useEffect(() => {
    if (serverEnvVars) {
      setEnvVars(
        serverEnvVars.map((ev) => ({
          id: ev.id,
          key: ev.key,
          value: ev.value || '',
          masked_value: ev.masked_value || '••••••••••••••••',
          environment: ev.environment,
        }))
      );
    }
  }, [serverEnvVars]);

  const addRow = () => {
    setEnvVars((prev) => [
      ...prev,
      {
        id: `temp-${Date.now()}-${Math.random()}`,
        key: '',
        value: '',
        environment: 'all',
      },
    ]);
  };

  const updateRow = (id: string, field: keyof EditableEnvVar, value: string) => {
    setEnvVars((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  const removeRow = (id: string) => {
    setEnvVars((prev) => prev.filter((row) => row.id !== id));
  };

  const handleBulkImport = () => {
    setBulkError(null);
    const lines = bulkInput.split('\n');
    const newVars: EditableEnvVar[] = [];
    const invalidLines: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line || line.startsWith('#')) continue;

      const equalIndex = line.indexOf('=');
      if (equalIndex === -1) {
        invalidLines.push(`Line ${i + 1}: Missing '=' sign`);
        continue;
      }

      const key = line.slice(0, equalIndex).trim().toUpperCase();
      let val = line.slice(equalIndex + 1).trim();

      // strip surrounding quotes if present
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }

      if (!POSIX_KEY_REGEX.test(key)) {
        invalidLines.push(`Line ${i + 1}: Key "${key}" does not match POSIX uppercase format`);
        continue;
      }

      newVars.push({
        id: `bulk-${Date.now()}-${i}`,
        key,
        value: val,
        environment: 'all',
      });
    }

    if (invalidLines.length > 0) {
      setBulkError(invalidLines.slice(0, 3).join('\n') + (invalidLines.length > 3 ? ` ...and ${invalidLines.length - 3} more` : ''));
      return;
    }

    if (newVars.length === 0) {
      setBulkError('No valid environment variable pairs found in input.');
      return;
    }

    setEnvVars((prev) => [...prev, ...newVars]);
    setBulkInput('');
    setBulkDialogOpen(false);
    toast({
      title: 'Bulk Variables Added',
      description: `Parsed ${newVars.length} variables. Click "Save Variables" to apply.`,
    });
  };

  const handleSave = async () => {
    // Validate POSIX compliance
    for (const ev of envVars) {
      if (!ev.key.trim()) {
        toast({
          title: 'Validation Error',
          description: 'Variable key cannot be empty.',
          variant: 'destructive',
        });
        return;
      }
      if (!POSIX_KEY_REGEX.test(ev.key.trim())) {
        toast({
          title: 'Invalid POSIX Key',
          description: `Key "${ev.key}" must contain only uppercase alphanumeric characters and underscores (e.g. DATABASE_URL).`,
          variant: 'destructive',
        });
        return;
      }
    }

    try {
      await saveEnvVars.mutateAsync({
        variables: envVars.map((ev) => ({
          key: ev.key.trim(),
          value: ev.value,
          environment: ev.environment,
        })),
      });

      toast({
        title: 'Environment Variables Saved',
        description: 'Encrypted variables have been synchronized with the runtime vault.',
      });
    } catch (err: any) {
      toast({
        title: 'Save Failed',
        description: err?.message || 'Could not save environment variables.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-8">
      <ProjectHeader projectId={projectId} />

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="font-semibold text-lg flex items-center gap-2">
              <Key className="h-5 w-5 text-primary" />
              Environment Variables & Secrets
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Securely inject encrypted credentials and runtime parameters into build and container environments.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Dialog open={bulkDialogOpen} onOpenChange={setBulkDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 text-xs">
                  <FileCode className="mr-1.5 h-3.5 w-3.5" />
                  Paste .env
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Bulk Import .env File</DialogTitle>
                  <DialogDescription>
                    Paste multiline KEY=VALUE pairs. Lines starting with # will be ignored.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-3 py-2">
                  <Textarea
                    placeholder="DATABASE_URL=postgres://...\nREDIS_HOST=10.0.0.1\nAPI_KEY=sk_live_..."
                    rows={8}
                    value={bulkInput}
                    onChange={(e) => setBulkInput(e.target.value)}
                    className="font-mono text-xs"
                  />
                  {bulkError && (
                    <div className="p-2.5 rounded-lg bg-destructive/10 text-destructive text-xs whitespace-pre-line flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                      <span>{bulkError}</span>
                    </div>
                  )}
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => setBulkDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleBulkImport}>
                    Parse & Append
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Button variant="outline" size="sm" onClick={addRow} className="h-9 text-xs">
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Add Row
            </Button>

            <Button
              size="sm"
              onClick={handleSave}
              disabled={saveEnvVars.isPending}
              className="h-9 text-xs"
            >
              <Save className="mr-1.5 h-3.5 w-3.5" />
              {saveEnvVars.isPending ? 'Saving...' : 'Save Variables'}
            </Button>
          </div>
        </div>

        {/* Variables Table */}
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-6 space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : envVars.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                <Key className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-base">No Environment Variables</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                No variables have been declared for this project yet. Add individual keys or paste your entire .env file.
              </p>
              <Button size="sm" onClick={addRow} variant="outline" className="text-xs">
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Add First Variable
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30 text-xs text-muted-foreground font-medium">
                    <th className="py-3 px-4 font-medium w-1/4">POSIX Key</th>
                    <th className="py-3 px-4 font-medium w-2/5">Encrypted Secret Value</th>
                    <th className="py-3 px-4 font-medium w-1/5">Environment Scope</th>
                    <th className="py-3 px-4 font-medium text-right w-16">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {envVars.map((row) => (
                    <tr key={row.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 align-top">
                        <Input
                          value={row.key}
                          onChange={(e) => updateRow(row.id, 'key', e.target.value.toUpperCase())}
                          placeholder="VARIABLE_NAME"
                          className="font-mono text-xs h-9 uppercase"
                        />
                      </td>

                      <td className="py-3 px-4 align-top">
                        {row.value ? (
                          <EncryptedValueMasker
                            value={row.value}
                            maskedPlaceholder={row.masked_value || '••••••••••••••••'}
                          />
                        ) : (
                          <Input
                            type="password"
                            value={row.value}
                            onChange={(e) => updateRow(row.id, 'value', e.target.value)}
                            placeholder="Enter secret value..."
                            className="font-mono text-xs h-9"
                          />
                        )}
                      </td>

                      <td className="py-3 px-4 align-top">
                        <select
                          value={row.environment}
                          onChange={(e) => updateRow(row.id, 'environment', e.target.value)}
                          className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs capitalize"
                        >
                          <option value="all">All Environments</option>
                          <option value="production">Production Only</option>
                          <option value="preview">Preview / Staging</option>
                          <option value="development">Development</option>
                        </select>
                      </td>

                      <td className="py-3 px-4 text-right align-top">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeRow(row.id)}
                          className="h-9 w-9 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
