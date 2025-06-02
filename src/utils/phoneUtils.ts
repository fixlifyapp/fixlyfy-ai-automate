
// Utility function to format phone number for Telnyx
export const formatPhoneForTelnyx = (phoneNumber: string): string => {
  if (!phoneNumber) return "";
  const cleaned = phoneNumber.replace(/\D/g, '');
  if (cleaned.startsWith('1') && cleaned.length === 11) {
    return `+${cleaned}`;
  }
  if (cleaned.length === 10) {
    return `+1${cleaned}`;
  }
  if (cleaned.length > 10) {
    return `+${cleaned}`;
  }
  console.warn("Invalid phone number format:", phoneNumber);
  return phoneNumber;
};

export const isValidPhoneNumber = (phoneNumber: string): boolean => {
  if (!phoneNumber) return false;
  const cleaned = phoneNumber.replace(/\D/g, '');
  return cleaned.length >= 10;
};
