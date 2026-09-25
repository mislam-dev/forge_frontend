import { toNestErrors } from '@hookform/resolvers';
import type { FieldValues, Resolver } from 'react-hook-form';
import type { ZodType } from 'zod';

/**
 * Custom Zod resolver that bridges Zod 4 and Zod 3 with React Hook Form.
 * Directly extracts issues from ZodError without throwing uncaught runtime exceptions,
 * and maps all validation errors cleanly to form fields below the input boxes.
 */
export function zodResolver<TFieldValues extends FieldValues = FieldValues>(
  schema: ZodType<any, any, any>
): Resolver<TFieldValues> {
  return async (values, _context, options) => {
    const result = await schema.safeParseAsync(values);

    if (result.success) {
      return {
        values: result.data as TFieldValues,
        errors: {},
      };
    }

    const flatErrors: Record<string, { type: string; message?: string }> = {};

    // Handles both Zod 4 (.issues) and Zod 3 (.errors)
    const issues = result.error.issues || (result.error as any).errors || [];

    for (const issue of issues) {
      const path = issue.path.join('.');
      if (!flatErrors[path]) {
        flatErrors[path] = {
          type: issue.code,
          message: issue.message,
        };
      }
    }

    return {
      values: {},
      errors: toNestErrors(flatErrors, options),
    };
  };
}
