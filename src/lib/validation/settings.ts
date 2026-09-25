import * as z from 'zod';

export const profileSettingsSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Please enter a valid email address').optional(),
  phone: z.string().optional(),
  image: z.string().optional(),
  dob: z.string().optional(),
  gender: z.string().optional(),
});

export type ProfileSettingsValues = z.infer<typeof profileSettingsSchema>;

export const securityPasswordSchema = z
  .object({
    current_password: z.string().min(1, 'Current password is required'),
    new_password: z
      .string()
      .min(8, 'New password must be at least 8 characters long'),
    confirm_password: z
      .string()
      .min(8, 'Confirm password must be at least 8 characters long'),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  });

export type SecurityPasswordValues = z.infer<typeof securityPasswordSchema>;
