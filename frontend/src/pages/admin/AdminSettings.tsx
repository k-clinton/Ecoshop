import React, { useState } from 'react'
import { Save } from 'lucide-react'
import { useToast } from '@/store/ToastContext'

export function AdminSettings() {
    const { addToast } = useToast()
    const [settings, setSettings] = useState({
        siteName: 'EcoShop',
        supportEmail: 'support@ecoshop.com',
        currency: 'USD',
        shippingFee: 5.99,
        freeShippingThreshold: 50.00,
        maintenanceMode: false
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value
        setSettings({
            ...settings,
            [e.target.name]: value
        })
    }

    const handleSave = () => {
        // Mock API call
        setTimeout(() => {
            addToast('Settings saved successfully', 'success')
        }, 500)
    }

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
                                name="siteName"
                                className="input"
                                value={settings.siteName}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Support Email</label>
                            <input
                                type="email"
                                name="supportEmail"
                                className="input"
                                value={settings.supportEmail}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Currency</label>
                            <select
                                name="currency"
                                className="input"
                                value={settings.currency}
                                onChange={handleChange}
                            >
                                <option value="USD">USD ($)</option>
                                <option value="EUR">EUR (€)</option>
                                <option value="GBP">GBP (£)</option>
                            </select>
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
                                name="shippingFee"
                                step="0.01"
                                className="input"
                                value={settings.shippingFee}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Free Shipping Threshold</label>
                            <input
                                type="number"
                                name="freeShippingThreshold"
                                step="0.01"
                                className="input"
                                value={settings.freeShippingThreshold}
                                onChange={handleChange}
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
                            name="maintenanceMode"
                            id="maintenanceMode"
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            checked={settings.maintenanceMode}
                            onChange={handleChange}
                        />
                        <label htmlFor="maintenanceMode" className="text-sm font-medium">Enable Maintenance Mode</label>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2 ml-7">
                        When enabled, only administrators can access the storefront.
                    </p>
                </div>

                <div className="flex justify-end">
                    <button onClick={handleSave} className="btn-primary btn-md">
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    )
}
