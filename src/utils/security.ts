
// Security utility functions for input validation, sanitization, and security measures

import { toast } from "sonner";

// Password strength validation
export const validatePasswordStrength = (password: string): { 
  isValid: boolean; 
  errors: string[] 
} => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number");
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push("Password must contain at least one special character");
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Input sanitization
export const sanitizeInput = (input: string): string => {
  if (!input) return '';
  
  // Remove potential XSS characters
  return input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .replace(/script/gi, '')
    .trim();
};

// Email validation
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Phone number validation
export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone);
};

// Generic form validation
export const validateRequired = (value: string, fieldName: string): string | null => {
  if (!value || value.trim().length === 0) {
    return `${fieldName} is required`;
  }
  return null;
};

// Rate limiting for client-side operations
class RateLimiter {
  private attempts: Map<string, { count: number; resetTime: number }> = new Map();
  private maxAttempts: number;
  private windowMs: number;

  constructor(maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
  }

  isAllowed(key: string): boolean {
    const now = Date.now();
    const attempt = this.attempts.get(key);

    if (!attempt || now > attempt.resetTime) {
      this.attempts.set(key, { count: 1, resetTime: now + this.windowMs });
      return true;
    }

    if (attempt.count >= this.maxAttempts) {
      return false;
    }

    attempt.count++;
    return true;
  }

  getRemainingTime(key: string): number {
    const attempt = this.attempts.get(key);
    if (!attempt) return 0;
    
    const now = Date.now();
    return Math.max(0, attempt.resetTime - now);
  }
}

export const authRateLimiter = new RateLimiter(5, 15 * 60 * 1000); // 5 attempts per 15 minutes

// CSRF token generation and validation
export const generateCSRFToken = (): string => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

// Secure session storage
export const secureStorage = {
  set: (key: string, value: string): void => {
    try {
      const encrypted = btoa(value); // Basic encoding, not encryption
      sessionStorage.setItem(key, encrypted);
    } catch (error) {
      console.warn('Failed to store secure data:', error);
    }
  },
  
  get: (key: string): string | null => {
    try {
      const encrypted = sessionStorage.getItem(key);
      return encrypted ? atob(encrypted) : null;
    } catch (error) {
      console.warn('Failed to retrieve secure data:', error);
      return null;
    }
  },
  
  remove: (key: string): void => {
    sessionStorage.removeItem(key);
  },
  
  clear: (): void => {
    sessionStorage.clear();
  }
};

// Security headers helper
export const getSecurityHeaders = (): HeadersInit => {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;"
  };
};

// Error messages that don't leak sensitive information
export const getGenericErrorMessage = (error: any): string => {
  // In production, return generic messages
  if (process.env.NODE_ENV === 'production') {
    if (error?.message?.includes('auth') || error?.message?.includes('login')) {
      return 'Authentication failed. Please check your credentials.';
    }
    if (error?.message?.includes('network') || error?.message?.includes('fetch')) {
      return 'Network error. Please try again later.';
    }
    return 'An error occurred. Please try again.';
  }
  
  // In development, show actual errors
  return error?.message || 'An unexpected error occurred';
};

// Log security events
export const logSecurityEvent = async (action: string, details: any = {}) => {
  try {
    // Only log in production or when explicitly enabled
    if (process.env.NODE_ENV === 'production' || process.env.ENABLE_SECURITY_LOGGING === 'true') {
      console.info('Security Event:', { action, details, timestamp: new Date().toISOString() });
      
      // In a real implementation, you'd send this to your backend
      // await fetch('/api/security-log', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ action, details })
      // });
    }
  } catch (error) {
    console.warn('Failed to log security event:', error);
  }
};
