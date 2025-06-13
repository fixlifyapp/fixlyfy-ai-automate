
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  // Ensure the amount is rounded to 2 decimal places to avoid floating-point precision issues
  const roundedAmount = Math.round((amount || 0) * 100) / 100;
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(roundedAmount);
}

// Helper function to round currency values to 2 decimal places
export function roundToCurrency(amount: number): number {
  return Math.round((amount || 0) * 100) / 100;
}
