
/**
 * Format phone number for Telnyx API
 * @param phone - Raw phone number string
 * @returns Formatted phone number with country code
 */
export const formatPhoneForTelnyx = (phone: string): string => {
  // Remove all non-numeric characters
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Add country code if needed
  if (cleanPhone.length === 10) {
    return `+1${cleanPhone}`;
  } else if (cleanPhone.length === 11 && cleanPhone.startsWith('1')) {
    return `+${cleanPhone}`;
  } else {
    return `+${cleanPhone}`;
  }
};

/**
 * Validate if phone number is in correct format
 * @param phone - Phone number to validate
 * @returns true if valid, false otherwise
 */
export const isValidPhoneNumber = (phone: string): boolean => {
  const cleanPhone = phone.replace(/\D/g, '');
  return cleanPhone.length >= 10 && cleanPhone.length <= 15;
};

/**
 * Format phone number for display
 * @param phone - Raw phone number
 * @returns Formatted phone number for display
 */
export const formatPhoneForDisplay = (phone: string): string => {
  const cleanPhone = phone.replace(/\D/g, '');
  
  if (cleanPhone.length === 10) {
    return `(${cleanPhone.slice(0, 3)}) ${cleanPhone.slice(3, 6)}-${cleanPhone.slice(6)}`;
  } else if (cleanPhone.length === 11 && cleanPhone.startsWith('1')) {
    return `+1 (${cleanPhone.slice(1, 4)}) ${cleanPhone.slice(4, 7)}-${cleanPhone.slice(7)}`;
  }
  
  return phone;
};
