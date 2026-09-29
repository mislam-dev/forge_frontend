import * as z from 'zod';

export const createTeamSchema = z.object({
  name: z
    .string()
    .min(2, 'Team name must be at least 2 characters')
    .max(255, 'Team name cannot exceed 255 characters'),
  description: z.string().optional(),
});

export type CreateTeamValues = z.infer<typeof createTeamSchema>;

export const addTeamMemberSchema = z.object({
  user_id: z
    .string()
    .min(1, 'User selection or ID is required')
    .uuid('Must be a valid user UUID'),
  role: z.enum(['viewer', 'developer', 'admin'], {
    message: 'Role must be viewer, developer, or admin',
  }),
});

export type AddTeamMemberValues = z.infer<typeof addTeamMemberSchema>;
