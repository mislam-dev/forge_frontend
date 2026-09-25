import * as z from 'zod';

export const createOrgSchema = z.object({
  name: z
    .string()
    .min(2, 'Organization name must be at least 2 characters')
    .max(50, 'Organization name cannot exceed 50 characters'),
  type: z.enum(['Personal', 'Team', 'Enterprise']).default('Team'),
  description: z.string().optional(),
});

export type CreateOrgValues = z.infer<typeof createOrgSchema>;

export const inviteMemberSchema = z.object({
  email: z
    .string()
    .min(1, 'Email address is required')
    .email('Please enter a valid email address'),
  role: z.enum(['Admin', 'Member', 'Viewer']),
});

export type InviteMemberValues = z.infer<typeof inviteMemberSchema>;
