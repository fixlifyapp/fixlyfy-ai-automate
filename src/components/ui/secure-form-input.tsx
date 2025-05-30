
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { validateRequired, sanitizeInput, validateEmail, validatePhone } from '@/utils/security';
import { cn } from '@/lib/utils';

interface SecureFormInputProps {
  label: string;
  name: string;
  type?: 'text' | 'email' | 'password' | 'tel' | 'number';
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
  className?: string;
  autoComplete?: string;
  maxLength?: number;
  pattern?: string;
  showValidation?: boolean;
  customValidation?: (value: string) => string | null;
}

export const SecureFormInput: React.FC<SecureFormInputProps> = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  required = false,
  placeholder,
  className,
  autoComplete,
  maxLength = 255,
  pattern,
  showValidation = true,
  customValidation
}) => {
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  const validateInput = (inputValue: string) => {
    let validationError: string | null = null;

    // Required validation
    if (required) {
      validationError = validateRequired(inputValue, label);
      if (validationError) return validationError;
    }

    // Type-specific validation
    if (inputValue && type === 'email') {
      if (!validateEmail(inputValue)) {
        validationError = 'Please enter a valid email address';
      }
    }

    if (inputValue && type === 'tel') {
      if (!validatePhone(inputValue)) {
        validationError = 'Please enter a valid phone number';
      }
    }

    // Custom validation
    if (inputValue && customValidation) {
      validationError = customValidation(inputValue);
    }

    return validationError;
  };

  useEffect(() => {
    if (touched && showValidation) {
      const validationError = validateInput(value);
      setError(validationError);
    }
  }, [value, touched, showValidation]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value;
    
    // Sanitize input for text fields (but not passwords)
    if (type !== 'password') {
      newValue = sanitizeInput(newValue);
    }
    
    // Apply max length
    if (maxLength && newValue.length > maxLength) {
      newValue = newValue.substring(0, maxLength);
    }
    
    onChange(newValue);
  };

  const handleBlur = () => {
    setTouched(true);
  };

  const inputProps = {
    id: name,
    name,
    type,
    value,
    onChange: handleChange,
    onBlur: handleBlur,
    placeholder,
    autoComplete,
    maxLength,
    pattern,
    'aria-invalid': error ? true : false,
    'aria-describedby': error ? `${name}-error` : undefined,
    className: cn(
      className,
      error && 'border-red-500 focus:ring-red-500'
    )
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={name} className={cn(required && "after:content-['*'] after:text-red-500 after:ml-1")}>
        {label}
      </Label>
      <Input {...inputProps} />
      {error && showValidation && (
        <p id={`${name}-error`} className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};
