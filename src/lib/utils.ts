import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines Tailwind class strings with intelligent merging.
 *
 * @param inputs - Any number of class value inputs (strings, arrays, objects).
 * @returns A merged, deduplicated class string.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
