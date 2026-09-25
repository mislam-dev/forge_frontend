'use client';

import React from 'react';
import { FieldValues, UseFormReturn, SubmitHandler } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export interface FormWrapperProps<TFieldValues extends FieldValues> {
  form: UseFormReturn<TFieldValues>;
  onSubmit: SubmitHandler<TFieldValues>;
  submitLabel?: string;
  isSubmitting?: boolean;
  children: React.ReactNode;
}

export function FormWrapper<TFieldValues extends FieldValues>({
  form,
  onSubmit,
  submitLabel = 'Save Changes',
  isSubmitting = false,
  children,
}: FormWrapperProps<TFieldValues>) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {children}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
}
