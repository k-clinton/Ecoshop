import apiCall from './api';
import { User } from '../data/types';

export interface UpdateProfileRequest {
  name?: string;
  email?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface Address {
  id: string;
  name: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  isDefault: boolean;
  createdAt: string;
}

export interface CreateAddressRequest {
  name: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  isDefault?: boolean;
}

export const profileService = {
  // Update profile
  async updateProfile(data: UpdateProfileRequest): Promise<{ user: User }> {
    return apiCall<{ user: User }>('/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  // Change password
  async changePassword(data: ChangePasswordRequest): Promise<{ message: string }> {
    return apiCall<{ message: string }>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Get all addresses
  async getAddresses(): Promise<Address[]> {
    return apiCall<Address[]>('/addresses');
  },

  // Create address
  async createAddress(data: CreateAddressRequest): Promise<Address> {
    return apiCall<Address>('/addresses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update address
  async updateAddress(id: string, data: Partial<CreateAddressRequest>): Promise<Address> {
    return apiCall<Address>(`/addresses/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  // Delete address
  async deleteAddress(id: string): Promise<{ message: string }> {
    return apiCall<{ message: string }>(`/addresses/${id}`, {
      method: 'DELETE',
    });
  },
};
