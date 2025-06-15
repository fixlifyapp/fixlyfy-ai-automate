
export const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'paid':
      return 'text-green-600 bg-green-100';
    case 'partial':
      return 'text-yellow-600 bg-yellow-100';
    case 'unpaid':
      return 'text-red-600 bg-red-100';
    case 'draft':
      return 'text-gray-600 bg-gray-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};
