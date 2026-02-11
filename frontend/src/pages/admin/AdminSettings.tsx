import React, { useState, useEffect, useRef } from 'react'
import { Save } from 'lucide-react'
import { useToast } from '@/store/ToastContext'
import { useSettings } from '@/store/SettingsContext'

export function AdminSettings() {
    const { addToast } = useToast()
    const { settings, updateSettings } = useSettings()
    const [isSaving, setIsSaving] = useState(false)
    const isSavingRef = useRef(false)

    // Local state for form
    const [formData, setFormData] = useState({
        site_name: '',
        support_email: '',
        currency: 'USD',
        exchange_rate: 1.0,
        shipping_fee: 0,
        free_shipping_threshold: 0,
        maintenance_mode: false
    })

    // Load settings into local state when they are available
    // But don't reset if we're currently saving
    useEffect(() => {
        if (settings && !isSavingRef.current) {
            setFormData({
                site_name: settings.site_name,
                support_email: settings.support_email,
                currency: settings.currency,
                exchange_rate: settings.exchange_rate,
                shipping_fee: settings.shipping_fee,
                free_shipping_threshold: settings.free_shipping_threshold,
                maintenance_mode: settings.maintenance_mode
            })
        }
    }, [settings])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const target = e.target as HTMLInputElement;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;

        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSave = async () => {
        setIsSaving(true)
        isSavingRef.current = true
        
        try {
            await updateSettings(formData);
            // Show success notification after update completes
            setTimeout(() => {
                addToast('Settings saved successfully', 'success')
            }, 100)
        } catch (error: any) {
            console.error('Failed to save settings:', error)
            addToast(error?.message || 'Failed to save settings', 'error')
        } finally {
            setIsSaving(false)
            // Delay clearing the flag to ensure settings update completes
            setTimeout(() => {
                isSavingRef.current = false
            }, 500)
        }
    }

    if (!settings) return <div>Loading settings...</div>

    return (
        <div className="space-y-6 max-w-4xl">
            <div>
                <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
                <p className="text-muted-foreground">Manage your store configuration</p>
            </div>

            <div className="grid gap-6">
                {/* General Settings */}
                <div className="card p-6">
                    <h2 className="text-lg font-medium mb-4">General Information</h2>
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Store Name</label>
                            <input
                                type="text"
                                name="site_name"
                                className="input"
                                value={formData.site_name}
                                onChange={handleChange}
                                disabled={isSaving}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Support Email</label>
                            <input
                                type="email"
                                name="support_email"
                                className="input"
                                value={formData.support_email}
                                onChange={handleChange}
                                disabled={isSaving}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Currency</label>
                            <select
                                name="currency"
                                className="input"
                                value={formData.currency}
                                onChange={handleChange}
                                disabled={isSaving}
                            >
                                <option value="USD">USD ($)</option>
                                <option value="EUR">EUR (€)</option>
                                <option value="GBP">GBP (£)</option>
                                <option value="KES">KES (KSh.)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Exchange Rate</label>
                            <input
                                type="number"
                                name="exchange_rate"
                                step="0.0001"
                                className="input"
                                value={formData.exchange_rate}
                                onChange={handleChange}
                                disabled={isSaving}
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                1 USD = {formData.exchange_rate} {formData.currency}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Shipping Settings */}
                <div className="card p-6">
                    <h2 className="text-lg font-medium mb-4">Shipping Configuration</h2>
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Standard Shipping Fee</label>
                            <input
                                type="number"
                                name="shipping_fee"
                                step="0.01"
                                className="input"
                                value={formData.shipping_fee}
                                onChange={handleChange}
                                disabled={isSaving}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Free Shipping Threshold</label>
                            <input
                                type="number"
                                name="free_shipping_threshold"
                                step="0.01"
                                className="input"
                                value={formData.free_shipping_threshold}
                                onChange={handleChange}
                                disabled={isSaving}
                            />
                        </div>
                    </div>
                </div>

                {/* System Settings */}
                <div className="card p-6">
                    <h2 className="text-lg font-medium mb-4">System</h2>
                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            name="maintenance_mode"
                            id="maintenance_mode"
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            checked={formData.maintenance_mode}
                            onChange={handleChange}
                            disabled={isSaving}
                        />
                        <label htmlFor="maintenance_mode" className="text-sm font-medium">Enable Maintenance Mode</label>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2 ml-7">
                        When enabled, only administrators can access the storefront.
                    </p>
                </div>

                <div className="flex justify-end">
                    <button
                        onClick={handleSave}
                        className="btn-primary btn-md"
                        disabled={isSaving}
                    >
                        <Save className="h-4 w-4 mr-2" />
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    )
}
