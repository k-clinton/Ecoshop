import apiCall from './api';
import { User } from '../data/types';

export interface AuthResponse {
  token: string;
  user: User;
}

export const authService = {
  // Register new user
  async register(email: string, password: string, name: string): Promise<AuthResponse> {
    const data = await apiCall<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
    
    localStorage.setItem('authToken', data.token);
    return data;
  },

  // Login
  async login(email: string, password: string): Promise<AuthResponse> {
    const data = await apiCall<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    localStorage.setItem('authToken', data.token);
    return data;
  },

  // Get current user
  async getCurrentUser(): Promise<User> {
    return apiCall<User>('/auth/me');
  },

  // Logout
  logout() {
    localStorage.removeItem('authToken');
  },

  // Check if user is logged in
  isAuthenticated(): boolean {
    return !!localStorage.getItem('authToken');
  },

  // Get stored token
  getToken(): string | null {
    return localStorage.getItem('authToken');
  }
};
