
// Get a color class for a tag based on its name
export const getTagColor = (tag: string): string => {
  const lowerTag = tag.toLowerCase();
  
  if (lowerTag.includes('hvac') || lowerTag === 'ventilation') {
    return 'text-blue-600 border-blue-300';
  } else if (lowerTag === 'commercial') {
    return 'text-purple-600 border-purple-300';
  } else if (lowerTag === 'residential') {
    return 'text-teal-600 border-teal-300';
  } else if (lowerTag === 'property manager') {
    return 'text-indigo-600 border-indigo-300';
  } else if (lowerTag.includes('plumbing')) {
    return 'text-cyan-600 border-cyan-300';
  } else if (lowerTag.includes('electrical')) {
    return 'text-amber-600 border-amber-300';
  } else if (lowerTag.includes('maintenance')) {
    return 'text-green-600 border-green-300';
  } else if (lowerTag.includes('installation')) {
    return 'text-lime-600 border-lime-300';
  } else if (lowerTag.includes('repair')) {
    return 'text-orange-600 border-orange-300';
  } else if (lowerTag.includes('inspection')) {
    return 'text-sky-600 border-sky-300';
  } else if (lowerTag.includes('canceled') || lowerTag.includes('cancelled')) {
    return 'text-gray-600 border-gray-300';
  } else if (lowerTag.includes('upgrade')) {
    return 'text-rose-600 border-rose-300';
  } else if (lowerTag.includes('major')) {
    return 'text-red-600 border-red-300';
  } else {
    return 'text-gray-600 border-gray-300';
  }
};
