export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
export const BACKEND_BASE_URL = API_BASE_URL.replace('/api', '');

// Debug: Log the API URL being used
console.log('API_BASE_URL configured as:', API_BASE_URL);
console.log('BACKEND_BASE_URL configured as:', BACKEND_BASE_URL);
console.log('VITE_API_URL from env:', import.meta.env.VITE_API_URL);

// Helper function to get full image URL
export const getImageUrl = (imagePath: string): string => {
  if (!imagePath) return '';
  
  // If it's already a full URL, return as-is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // If it's a relative path starting with /uploads/, prepend backend URL
  if (imagePath.startsWith('/uploads/')) {
    return `${BACKEND_BASE_URL}${imagePath}`;
  }
  
  // If it's a local asset (like /images/), return as-is
  if (imagePath.startsWith('/images/')) {
    return imagePath;
  }
  
  // Default: return as-is
  return imagePath;
};
