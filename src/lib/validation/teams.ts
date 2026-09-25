import * as z from 'zod';

export const createTeamSchema = z.object({
  name: z
    .string()
    .min(2, 'Team name must be at least 2 characters')
    .max(50, 'Team name cannot exceed 50 characters'),
  description: z.string().optional(),
});

export type CreateTeamValues = z.infer<typeof createTeamSchema>;

export const addTeamMemberSchema = z.object({
  name: z
    .string()
    .min(2, 'Member name must be at least 2 characters'),
  email: z
    .string()
    .min(1, 'Email address is required')
    .email('Please enter a valid email address'),
  role: z.enum(['Lead', 'Maintainer', 'Member', 'Viewer']).default('Member'),
});

export type AddTeamMemberValues = z.infer<typeof addTeamMemberSchema>;
