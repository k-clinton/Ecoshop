import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { StoreSettings, settingsService } from '@/services/settings';
import { useAuth } from './AuthContext';

interface SettingsContextType {
    settings: StoreSettings | null;
    loading: boolean;
    refreshSettings: () => Promise<void>;
    updateSettings: (newSettings: Partial<StoreSettings>) => Promise<void>;
    formatPrice: (price: number) => string;
}

const defaultSettings: StoreSettings = {
    id: 'default',
    site_name: 'EcoShop',
    support_email: 'support@ecoshop.com',
    contact_email: 'contact@ecoshop.com',
    currency: 'USD',
    exchange_rate: 1.0000,
    shipping_fee: 5.99,
    free_shipping_threshold: 50.00,
    maintenance_mode: false
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<StoreSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth(); // To check for admin bypass

    const loadSettings = async () => {
        try {
            setLoading(true);
            const data = await settingsService.getSettings();
            setSettings(data);
        } catch (error) {
            console.error('Failed to load settings:', error);
            // Fallback to defaults if API fails
            setSettings(defaultSettings);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSettings();
    }, []);

    const refreshSettings = async () => {
        await loadSettings();
    };

    const updateSettings = async (newSettings: Partial<StoreSettings>) => {
        try {
            await settingsService.updateSettings(newSettings);
            // Refresh settings after successful update
            await loadSettings();
        } catch (error) {
            // Re-throw error so calling component can handle it
            throw error;
        }
    };

    const formatPrice = (price: number): string => {
        const currency = settings?.currency || 'USD';
        const exchangeRate = settings?.exchange_rate || 1.0;
        
        // Convert price using exchange rate
        const convertedPrice = price * exchangeRate;
        
        // Special handling for KES (Kenyan Shilling)
        if (currency === 'KES') {
            return `KSh. ${convertedPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        }
        
        const formatter = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
        });
        return formatter.format(convertedPrice);
    };

    // Maintenance Mode Logic
    // If maintenance mode is on, and user is NOT admin, we might want to block access.
    // Ideally this should be handled in a high-level router/layout, but we can verify it here.
    const isMaintenanceMode = settings?.maintenance_mode && user?.role !== 'admin';

    if (loading) {
        return <div className="h-screen flex items-center justify-center">Loading store configuration...</div>;
    }

    if (isMaintenanceMode) {
        return (
            <div className="h-screen flex flex-col items-center justify-center p-4 text-center">
                <h1 className="text-3xl font-bold mb-4">Under Maintenance</h1>
                <p className="text-muted-foreground">{settings?.site_name} is currently undergoing scheduled maintenance.</p>
                <p className="text-sm text-gray-500 mt-2">Please check back later.</p>
                {/* Allow admins to login if they somehow got logged out */}
                <div className="mt-8">
                    <a href="/login" className="text-xs text-blue-500 underline">Admin Login</a>
                </div>
            </div>
        );
    }

    return (
        <SettingsContext.Provider value={{ settings, loading, refreshSettings, updateSettings, formatPrice }}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
}
