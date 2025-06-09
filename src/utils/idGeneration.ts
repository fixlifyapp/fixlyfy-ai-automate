
export const generateNextId = async (entityType: string): Promise<string> => {
  // Mock ID generation for now since we don't have id_counters table
  const prefix = entityType === 'estimate' ? 'EST-' : 'INV-';
  const year = new Date().getFullYear();
  const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  
  return `${prefix}${year}-${randomSuffix}`;
};
