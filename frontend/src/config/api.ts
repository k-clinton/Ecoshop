export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Debug: Log the API URL being used
console.log('API_BASE_URL configured as:', API_BASE_URL);
console.log('VITE_API_URL from env:', import.meta.env.VITE_API_URL);
