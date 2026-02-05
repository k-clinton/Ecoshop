import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Package, MapPin, CreditCard, Bell, Shield, LogOut, Mail, Edit2, Trash2, Plus } from 'lucide-react'
import { useAuth } from '@/store/AuthContext'
import { useToast } from '@/store/ToastContext'
import { orderService } from '@/services/orders'
import { profileService, type Address } from '@/services/profile'
import { EditProfileModal } from '@/components/EditProfileModal'
import { ChangePasswordModal } from '@/components/ChangePasswordModal'
import { AddressModal } from '@/components/AddressModal'
import type { Order } from '@/data/types'

export function AccountPage() {
  const { user, isAuthenticated, updateUser } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'addresses' | 'settings'>('profile')
  const [orders, setOrders] = useState<Order[]>([])
  const [addresses, setAddresses] = useState<Address[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showEditProfile, setShowEditProfile] = useState(false)
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [showAddressModal, setShowAddressModal] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | undefined>(undefined)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/signin')
    }
  }, [isAuthenticated, navigate])

  useEffect(() => {
    if (activeTab === 'orders' && isAuthenticated) {
      loadOrders()
    } else if (activeTab === 'addresses' && isAuthenticated) {
      loadAddresses()
    }
  }, [activeTab, isAuthenticated])

  const loadOrders = async () => {
    setIsLoading(true)
    try {
      const data = await orderService.getOrders()
      setOrders(data)
    } catch (error: any) {
      addToast(error.message || 'Failed to load orders', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const loadAddresses = async () => {
    setIsLoading(true)
    try {
      const data = await profileService.getAddresses()
      setAddresses(data)
    } catch (error: any) {
      addToast(error.message || 'Failed to load addresses', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateProfile = async (name: string, email: string) => {
    try {
      const { user: updatedUser } = await profileService.updateProfile({ name, email })
      updateUser(updatedUser)
      addToast('Profile updated successfully', 'success')
    } catch (error: any) {
      addToast(error.message || 'Failed to update profile', 'error')
      throw error
    }
  }

  const handleChangePassword = async (currentPassword: string, newPassword: string) => {
    try {
      await profileService.changePassword({ currentPassword, newPassword })
      addToast('Password changed successfully', 'success')
    } catch (error: any) {
      addToast(error.message || 'Failed to change password', 'error')
      throw error
    }
  }

  const handleSaveAddress = async (addressData: Partial<Address>) => {
    try {
      if (editingAddress) {
        await profileService.updateAddress(editingAddress.id, addressData)
        addToast('Address updated successfully', 'success')
      } else {
        await profileService.createAddress(addressData as any)
        addToast('Address added successfully', 'success')
      }
      loadAddresses()
    } catch (error: any) {
      addToast(error.message || 'Failed to save address', 'error')
      throw error
    }
  }

  const handleDeleteAddress = async (id: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return

    try {
      await profileService.deleteAddress(id)
      addToast('Address deleted successfully', 'success')
      loadAddresses()
    } catch (error: any) {
      addToast(error.message || 'Failed to delete address', 'error')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'shipped':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const tabs = [
    { id: 'profile' as const, label: 'Profile', icon: User },
    { id: 'orders' as const, label: 'Orders', icon: Package },
    { id: 'addresses' as const, label: 'Addresses', icon: MapPin },
    { id: 'settings' as const, label: 'Settings', icon: Shield },
  ]

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30 py-12">
      <div className="container-wide">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold mb-2">My Account</h1>
          <p className="text-muted-foreground">Manage your profile, orders, and settings</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          {/* Sidebar */}
          <div className="space-y-4">
            {/* User Info Card */}
            <div className="bg-card rounded-xl border p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-2xl font-semibold text-primary">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h2 className="font-semibold text-lg">{user?.name}</h2>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
              </div>
              {user?.role === 'admin' && (
                <div className="px-3 py-1.5 bg-primary/10 text-primary text-xs font-medium rounded-full inline-block">
                  Admin
                </div>
              )}
            </div>

            {/* Navigation */}
            <nav className="bg-card rounded-xl border p-2">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                )
              })}
              <button
                onClick={() => {}}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors mt-2"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </nav>
          </div>

          {/* Main Content */}
          <div className="space-y-6">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                {/* Personal Information */}
                <div className="bg-card rounded-xl border p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg">Personal Information</h3>
                    <button
                      onClick={() => setShowEditProfile(true)}
                      className="flex items-center gap-2 text-primary hover:text-primary/80 text-sm font-medium"
                    >
                      <Edit2 className="h-4 w-4" />
                      Edit
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Full Name</p>
                        <p className="font-medium">{user?.name}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Email Address</p>
                        <p className="font-medium">{user?.email}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Account Stats */}
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="bg-card rounded-xl border p-6">
                    <Package className="h-8 w-8 text-primary mb-3" />
                    <p className="text-2xl font-bold">{orders.length}</p>
                    <p className="text-sm text-muted-foreground">Total Orders</p>
                  </div>
                  <div className="bg-card rounded-xl border p-6">
                    <CreditCard className="h-8 w-8 text-primary mb-3" />
                    <p className="text-2xl font-bold">
                      {formatPrice(orders.reduce((sum, order) => sum + order.total, 0))}
                    </p>
                    <p className="text-sm text-muted-foreground">Total Spent</p>
                  </div>
                  <div className="bg-card rounded-xl border p-6">
                    <Bell className="h-8 w-8 text-primary mb-3" />
                    <p className="text-2xl font-bold">
                      {orders.filter(o => o.status === 'processing' || o.status === 'shipped').length}
                    </p>
                    <p className="text-sm text-muted-foreground">Active Orders</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="bg-card rounded-xl border">
                <div className="p-6 border-b">
                  <h3 className="font-semibold text-lg">Order History</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    View and track your orders
                  </p>
                </div>
                <div className="p-6">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-12">
                      <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h4 className="font-semibold text-lg mb-2">No orders yet</h4>
                      <p className="text-muted-foreground mb-6">
                        Start shopping to see your orders here
                      </p>
                      <Link to="/products" className="btn-primary">
                        Browse Products
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div
                          key={order.id}
                          className="border rounded-lg p-4 hover:border-primary transition-colors"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <p className="font-semibold">Order #{order.id.slice(0, 8).toUpperCase()}</p>
                              <p className="text-sm text-muted-foreground">
                                {formatDate(order.createdAt)}
                              </p>
                            </div>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                                order.status
                              )}`}
                            >
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                          </div>
                          <div className="flex items-end justify-between pt-3 border-t">
                            <div className="text-sm text-muted-foreground">
                              {order.items?.length || 0} item(s)
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-lg">{formatPrice(order.total)}</p>
                              <Link
                                to={`/orders/${order.id}`}
                                className="text-sm text-primary hover:underline"
                              >
                                View Details →
                              </Link>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'addresses' && (
              <div className="bg-card rounded-xl border">
                <div className="p-6 border-b flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">Saved Addresses</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Manage your shipping addresses
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingAddress(undefined)
                      setShowAddressModal(true)
                    }}
                    className="btn-primary flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Address
                  </button>
                </div>
                <div className="p-6">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : addresses.length === 0 ? (
                    <div className="text-center py-12">
                      <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h4 className="font-semibold text-lg mb-2">No addresses saved</h4>
                      <p className="text-muted-foreground mb-6">
                        Add an address to make checkout faster
                      </p>
                    </div>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                      {addresses.map((address) => (
                        <div
                          key={address.id}
                          className={`border rounded-lg p-4 relative ${
                            address.isDefault ? 'border-primary bg-primary/5' : ''
                          }`}
                        >
                          {address.isDefault && (
                            <span className="absolute top-3 right-3 px-2 py-1 bg-primary text-primary-foreground text-xs font-medium rounded">
                              Default
                            </span>
                          )}
                          <div className="pr-16">
                            <p className="font-semibold mb-2">{address.name}</p>
                            <div className="text-sm text-muted-foreground space-y-1">
                              <p>{address.street}</p>
                              <p>
                                {address.city}, {address.state} {address.zip}
                              </p>
                              <p>{address.country}</p>
                            </div>
                          </div>
                          <div className="flex gap-2 mt-4">
                            <button
                              onClick={() => {
                                setEditingAddress(address)
                                setShowAddressModal(true)
                              }}
                              className="flex items-center gap-1 text-sm text-primary hover:text-primary/80"
                            >
                              <Edit2 className="h-3 w-3" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteAddress(address.id)}
                              className="flex items-center gap-1 text-sm text-destructive hover:text-destructive/80"
                            >
                              <Trash2 className="h-3 w-3" />
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                {/* Security */}
                <div className="bg-card rounded-xl border p-6">
                  <h3 className="font-semibold text-lg mb-4">Security</h3>
                  <div className="space-y-3">
                    <button
                      onClick={() => setShowChangePassword(true)}
                      className="w-full flex items-center justify-between p-4 rounded-lg border hover:border-primary hover:bg-primary/5 transition-colors"
                    >
                      <div className="flex items-center gap-3 text-left">
                        <Shield className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium text-sm">Change Password</p>
                          <p className="text-xs text-muted-foreground">Update your password</p>
                        </div>
                      </div>
                      <span className="text-muted-foreground">→</span>
                    </button>
                  </div>
                </div>

                {/* Notifications */}
                <div className="bg-card rounded-xl border p-6">
                  <h3 className="font-semibold text-lg mb-4">Notifications</h3>
                  <div className="space-y-4">
                    <label className="flex items-center justify-between cursor-pointer">
                      <div className="flex items-center gap-3">
                        <Bell className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Order Updates</p>
                          <p className="text-sm text-muted-foreground">
                            Get notified about your order status
                          </p>
                        </div>
                      </div>
                      <input type="checkbox" defaultChecked className="toggle" />
                    </label>
                    <label className="flex items-center justify-between cursor-pointer">
                      <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Promotional Emails</p>
                          <p className="text-sm text-muted-foreground">
                            Receive offers and news
                          </p>
                        </div>
                      </div>
                      <input type="checkbox" defaultChecked className="toggle" />
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showEditProfile && (
        <EditProfileModal
          user={user}
          onClose={() => setShowEditProfile(false)}
          onSave={handleUpdateProfile}
        />
      )}

      {showChangePassword && (
        <ChangePasswordModal
          onClose={() => setShowChangePassword(false)}
          onSave={handleChangePassword}
        />
      )}

      {showAddressModal && (
        <AddressModal
          address={editingAddress}
          onClose={() => {
            setShowAddressModal(false)
            setEditingAddress(undefined)
          }}
          onSave={handleSaveAddress}
        />
      )}
    </div>
  )
}
