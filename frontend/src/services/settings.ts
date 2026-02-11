import apiCall from './api';

export interface StoreSettings {
    id: string;
    site_name: string;
    support_email: string;
    contact_email: string;
    currency: string;
    exchange_rate: number;
    shipping_fee: number;
    free_shipping_threshold: number;
    maintenance_mode: boolean;
}

export const settingsService = {
    // Get public settings
    async getSettings(): Promise<StoreSettings> {
        const data = await apiCall<any>('/settings');
        // Ensure numeric values are numbers (API might return strings for decimals)
        return {
            ...data,
            exchange_rate: Number(data.exchange_rate),
            shipping_fee: Number(data.shipping_fee),
            free_shipping_threshold: Number(data.free_shipping_threshold),
            maintenance_mode: Boolean(data.maintenance_mode)
        };
    },

    // Update settings (Admin only)
    async updateSettings(settings: Partial<StoreSettings>): Promise<void> {
        await apiCall<{ message: string }>('/settings', {
            method: 'PUT',
            body: JSON.stringify(settings),
        });
    }
};
