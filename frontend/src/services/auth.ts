import apiCall from './api';
import { User } from '../data/types';

export interface AuthResponse {
  token: string;
  user: User;
}

export interface RegisterResponse {
  message: string;
  userId: string;
  email: string;
  requiresVerification: boolean;
}

export const authService = {
  // Register new user
  async register(email: string, password: string, name: string): Promise<RegisterResponse> {
    const data = await apiCall<RegisterResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });

    return data;
  },

  // Verify email with code
  async verifyEmail(userId: string, code: string): Promise<AuthResponse> {
    const data = await apiCall<AuthResponse>('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ userId, code }),
    });

    localStorage.setItem('authToken', data.token);
    this.startSessionMonitor();
    return data;
  },

  // Resend verification code
  async resendVerificationCode(email: string): Promise<{ message: string }> {
    return apiCall<{ message: string }>('/auth/resend-code', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  // Login
  async login(email: string, password: string): Promise<AuthResponse> {
    const data = await apiCall<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    localStorage.setItem('authToken', data.token);
    this.startSessionMonitor();
    return data;
  },

  // Google Sign In
  async googleSignIn(credential: string): Promise<AuthResponse> {
    const data = await apiCall<AuthResponse>('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ credential }),
    });

    localStorage.setItem('authToken', data.token);
    this.startSessionMonitor();
    return data;
  },

  // Refresh token
  async refreshToken(): Promise<{ token: string }> {
    const data = await apiCall<{ token: string }>('/auth/refresh', {
      method: 'POST',
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
    localStorage.removeItem('lastActivity');
    this.stopSessionMonitor();
  },

  // Check if user is logged in
  isAuthenticated(): boolean {
    return !!localStorage.getItem('authToken');
  },

  // Get stored token
  getToken(): string | null {
    return localStorage.getItem('authToken');
  },

  // Session monitoring (10 minute timeout)
  sessionTimeoutInterval: null as number | null,

  startSessionMonitor() {
    this.updateActivity();

    // Check activity every minute
    this.sessionTimeoutInterval = setInterval(() => {
      const lastActivity = localStorage.getItem('lastActivity');
      if (lastActivity) {
        const timeSinceActivity = Date.now() - parseInt(lastActivity);
        const fifteenMinutes = 15 * 60 * 1000;

        if (timeSinceActivity >= fifteenMinutes) {
          // Session expired - silently log out
          this.logout();
          window.dispatchEvent(new CustomEvent('auth:session-expired'));
        } else if (timeSinceActivity >= 12 * 60 * 1000) {
          // 12 minutes - refresh token
          this.refreshToken().catch(() => {
            this.logout();
            window.dispatchEvent(new CustomEvent('auth:session-expired'));
          });
        }
      }
    }, 60000); // Check every minute

    // Update activity on user interactions
    ['mousedown', 'keydown', 'scroll', 'touchstart'].forEach(event => {
      document.addEventListener(event, () => this.updateActivity(), { passive: true });
    });
  },

  stopSessionMonitor() {
    if (this.sessionTimeoutInterval) {
      clearInterval(this.sessionTimeoutInterval);
      this.sessionTimeoutInterval = null;
    }
  },

  updateActivity() {
    localStorage.setItem('lastActivity', Date.now().toString());
  }
};
