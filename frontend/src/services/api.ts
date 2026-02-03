import { API_BASE_URL } from '../config/api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

class ApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'ApiError';
  }
}

// Helper function for API calls
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('authToken');
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Add custom headers from options
  if (options.headers) {
    Object.assign(headers, options.headers);
  }

  // Add authorization token if available
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    console.log(`Making API request to: ${API_BASE_URL}${endpoint}`);
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    console.log(`Response status: ${response.status}`);
    const result: ApiResponse<T> = await response.json();

    if (!result.success) {
      throw new ApiError(result.error || 'API request failed', response.status);
    }

    return result.data as T;
  } catch (error) {
    console.error('API call error:', error);
    if (error instanceof ApiError) {
      throw error;
    }
    // More descriptive error message
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new ApiError(`Cannot connect to API server at ${API_BASE_URL}. Please ensure the backend is running.`);
    }
    throw new ApiError('Network error or server unavailable');
  }
}

export default apiCall;
export { ApiError };
