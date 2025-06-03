
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
 * Format phone number for display - supports both US and international
 * @param phone - Raw phone number
 * @returns Formatted phone number for display
 */
export const formatPhoneForDisplay = (phone: string): string => {
  if (!phone) return '';
  
  // Remove all non-numeric characters
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Handle different formats
  if (cleanPhone.length === 10) {
    // US number without country code: 4375249932 -> (437) 524-9932
    return `(${cleanPhone.slice(0, 3)}) ${cleanPhone.slice(3, 6)}-${cleanPhone.slice(6)}`;
  } else if (cleanPhone.length === 11 && cleanPhone.startsWith('1')) {
    // US number with country code: 14375249932 -> +1 (437) 524-9932
    return `+1 (${cleanPhone.slice(1, 4)}) ${cleanPhone.slice(4, 7)}-${cleanPhone.slice(7)}`;
  } else if (phone.startsWith('+')) {
    // International number: +14375249932 -> +1 (437) 524-9932
    if (cleanPhone.length === 11 && cleanPhone.startsWith('1')) {
      return `+1 (${cleanPhone.slice(1, 4)}) ${cleanPhone.slice(4, 7)}-${cleanPhone.slice(7)}`;
    }
    // For other international numbers, just add spaces
    return phone.replace(/(\+\d{1,3})(\d{3})(\d{3})(\d{4})/, '$1 ($2) $3-$4');
  }
  
  // Fallback: return as-is
  return phone;
};

/**
 * Extract area code from phone number
 * @param phone - Phone number string
 * @returns Area code or null
 */
export const extractAreaCode = (phone: string): string | null => {
  const cleanPhone = phone.replace(/\D/g, '');
  
  if (cleanPhone.length === 10) {
    return cleanPhone.slice(0, 3);
  } else if (cleanPhone.length === 11 && cleanPhone.startsWith('1')) {
    return cleanPhone.slice(1, 4);
  }
  
  return null;
};
