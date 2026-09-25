import * as z from 'zod';

export const projectStep1Schema = z.object({
  name: z
    .string()
    .min(2, 'Project name must be at least 2 characters')
    .max(50, 'Project name cannot exceed 50 characters'),
  slug: z.string().optional(),
  description: z.string().optional(),
  project_type: z.enum(['repo', 'dockerfile']).default('repo'),
  runtime: z.enum(['rust', 'node', 'python', 'go', 'docker']).default('rust'),
});

export type ProjectStep1Values = z.infer<typeof projectStep1Schema>;

export const projectStep2Schema = z.object({
  repository_url: z
    .string()
    .min(1, 'Repository URL is required')
    .url('Please enter a valid Git repository URL (e.g. https://github.com/org/repo)'),
  branch: z
    .string()
    .min(1, 'Deployment branch is required')
    .max(50, 'Branch name is too long'),
  pat_token: z.string().optional(),
});

export type ProjectStep2Values = z.infer<typeof projectStep2Schema>;

export const projectRepoSettingsSchema = z.object({
  repository_url: z
    .string()
    .min(1, 'Repository URL is required')
    .url('Please enter a valid Git repository URL'),
  branch: z.string().min(1, 'Branch name is required'),
  pat_token: z.string().optional(),
  auto_deploy: z.boolean().default(true),
});

export type ProjectRepoSettingsValues = z.infer<typeof projectRepoSettingsSchema>;

export const projectAccessAssignSchema = z.object({
  target_type: z.enum(['user', 'team']),
  target_id: z.string().min(1, 'Please enter or select a user or team identifier'),
  role: z.enum(['Admin', 'Member', 'Viewer']),
});

export type ProjectAccessAssignValues = z.infer<typeof projectAccessAssignSchema>;
