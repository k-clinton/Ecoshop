import apiCall from './api';

export interface Customer {
  id: string;
  name: string;
  email: string;
  role: string;
  emailVerified: boolean;
  joinDate: string;
  orders: number;
  totalSpent: number;
}

export const customerService = {
  async getCustomers(): Promise<Customer[]> {
    const response = await apiCall<Customer[]>('/admin/customers');
    return response;
  },

  async getCustomerDetails(id: string): Promise<Customer> {
    const response = await apiCall<Customer>(`/admin/customers/${id}`);
    return response;
  },

  async updateCustomerRole(id: string, role: 'customer' | 'admin'): Promise<Customer> {
    const response = await apiCall<Customer>(`/admin/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    });
    return response;
  },

  async deleteCustomer(id: string): Promise<void> {
    await apiCall<void>(`/admin/customers/${id}`, {
      method: 'DELETE',
    });
  }
};
