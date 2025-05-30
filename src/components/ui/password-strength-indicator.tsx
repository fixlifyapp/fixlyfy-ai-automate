
import React from 'react';
import { validatePasswordStrength } from '@/utils/security';
import { cn } from '@/lib/utils';

interface PasswordStrengthIndicatorProps {
  password: string;
  showDetails?: boolean;
}

export const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
  password,
  showDetails = true
}) => {
  const { isValid, errors } = validatePasswordStrength(password);
  
  const getStrengthLevel = () => {
    if (!password) return 0;
    const maxCriteria = 5;
    const metCriteria = maxCriteria - errors.length;
    return metCriteria;
  };

  const strengthLevel = getStrengthLevel();
  const strengthPercentage = (strengthLevel / 5) * 100;

  const getStrengthColor = () => {
    if (strengthLevel <= 2) return 'bg-red-500';
    if (strengthLevel <= 3) return 'bg-yellow-500';
    if (strengthLevel <= 4) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getStrengthText = () => {
    if (!password) return '';
    if (strengthLevel <= 2) return 'Weak';
    if (strengthLevel <= 3) return 'Fair';
    if (strengthLevel <= 4) return 'Good';
    return 'Strong';
  };

  if (!password) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <div className="flex-1 bg-gray-200 rounded-full h-2">
          <div
            className={cn('h-2 rounded-full transition-all duration-300', getStrengthColor())}
            style={{ width: `${strengthPercentage}%` }}
          />
        </div>
        <span className={cn('text-sm font-medium', {
          'text-red-600': strengthLevel <= 2,
          'text-yellow-600': strengthLevel === 3,
          'text-blue-600': strengthLevel === 4,
          'text-green-600': strengthLevel === 5
        })}>
          {getStrengthText()}
        </span>
      </div>
      
      {showDetails && errors.length > 0 && (
        <ul className="text-xs text-gray-600 space-y-1">
          {errors.map((error, index) => (
            <li key={index} className="flex items-center space-x-1">
              <span className="text-red-500">✗</span>
              <span>{error}</span>
            </li>
          ))}
        </ul>
      )}
      
      {showDetails && isValid && (
        <p className="text-xs text-green-600 flex items-center space-x-1">
          <span>✓</span>
          <span>Password meets all security requirements</span>
        </p>
      )}
    </div>
  );
};
