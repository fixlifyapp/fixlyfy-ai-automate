
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number | null | undefined): string {
  // Handle null, undefined, or NaN values
  if (amount === null || amount === undefined || isNaN(amount)) {
    return "$0.00";
  }
  
  // Ensure the amount is rounded to 2 decimal places to avoid floating-point precision issues
  const roundedAmount = Math.round(amount * 100) / 100;
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(roundedAmount);
}

// Alternative function for when $0.00 is actually desired (e.g., paid invoices)
export function formatCurrencyWithZero(amount: number | null | undefined): string {
  const safeAmount = amount ?? 0;
  const roundedAmount = Math.round(safeAmount * 100) / 100;
  
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
