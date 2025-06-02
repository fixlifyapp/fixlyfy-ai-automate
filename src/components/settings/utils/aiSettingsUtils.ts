
// Helper function to safely parse string arrays from JSON
export const parseStringArray = (value: any): string[] => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.filter(item => typeof item === 'string');
  }
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.filter(item => typeof item === 'string');
      }
    } catch {
      return [];
    }
  }
  return [];
};

// Helper function to safely parse business hours
export const parseBusinessHours = (value: any): Record<string, { open: string; close: string; closed: boolean }> => {
  if (!value) return {};
  
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    return value as Record<string, { open: string; close: string; closed: boolean }>;
  }
  
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
        return parsed;
      }
    } catch {
      return {};
    }
  }
  
  return {};
};

export const APPLIANCE_TYPES = [
  'HVAC Systems',
  'Plumbing',
  'Electrical',
  'Appliance Repair',
  'Water Heaters',
  'Garbage Disposals',
  'Dishwashers',
  'Washing Machines',
  'Dryers',
  'Refrigerators',
  'Ovens & Stoves'
];

export const BUSINESS_HOURS = [
  { day: 'Monday', key: 'monday' },
  { day: 'Tuesday', key: 'tuesday' },
  { day: 'Wednesday', key: 'wednesday' },
  { day: 'Thursday', key: 'thursday' },
  { day: 'Friday', key: 'friday' },
  { day: 'Saturday', key: 'saturday' },
  { day: 'Sunday', key: 'sunday' }
];
