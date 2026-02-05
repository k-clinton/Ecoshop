import { useState } from 'react'
import { X } from 'lucide-react'
import type { Address } from '@/services/profile'

interface AddressModalProps {
  address?: Address
  onClose: () => void
  onSave: (address: Partial<Address>) => Promise<void>
}

export function AddressModal({ address, onClose, onSave }: AddressModalProps) {
  const [formData, setFormData] = useState({
    name: address?.name || '',
    street: address?.street || '',
    city: address?.city || '',
    state: address?.state || '',
    zip: address?.zip || '',
    country: address?.country || 'United States',
    isDefault: address?.isDefault || false,
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await onSave(formData)
      onClose()
    } catch (error) {
      // Error handled by parent
    } finally {
      setIsLoading(false)
    }
  }

  const updateField = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl max-w-md w-full p-6 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-2xl font-bold mb-6">
          {address ? 'Edit Address' : 'Add New Address'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => updateField('name', e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <div>
            <label htmlFor="street" className="block text-sm font-medium mb-2">
              Street Address
            </label>
            <input
              type="text"
              id="street"
              value={formData.street}
              onChange={(e) => updateField('street', e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="city" className="block text-sm font-medium mb-2">
                City
              </label>
              <input
                type="text"
                id="city"
                value={formData.city}
                onChange={(e) => updateField('city', e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label htmlFor="state" className="block text-sm font-medium mb-2">
                State
              </label>
              <input
                type="text"
                id="state"
                value={formData.state}
                onChange={(e) => updateField('state', e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="zip" className="block text-sm font-medium mb-2">
                ZIP Code
              </label>
              <input
                type="text"
                id="zip"
                value={formData.zip}
                onChange={(e) => updateField('zip', e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label htmlFor="country" className="block text-sm font-medium mb-2">
                Country
              </label>
              <input
                type="text"
                id="country"
                value={formData.country}
                onChange={(e) => updateField('country', e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isDefault"
              checked={formData.isDefault}
              onChange={(e) => updateField('isDefault', e.target.checked)}
              className="rounded"
            />
            <label htmlFor="isDefault" className="text-sm font-medium cursor-pointer">
              Set as default address
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-outline"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 btn-primary"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save Address'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
