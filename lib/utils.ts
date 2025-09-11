import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

export function formatDateMDY(input: string | Date | number): string {
  try {
    const d = typeof input === 'string' || typeof input === 'number' ? new Date(input) : input
    return format(d, 'MMMM d, yyyy')
  } catch {
    return String(input)
  }
}
