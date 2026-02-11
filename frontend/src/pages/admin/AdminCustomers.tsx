import { useState, useEffect, useRef } from 'react'
import { Search, MoreVertical, Mail, Calendar, Eye, UserCog, Trash2, Copy, ShoppingBag, X, Shield, User } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { customerService, Customer } from '@/services/customers'
import { useSettings } from '@/store/SettingsContext'
import { useToast } from '@/store/ToastContext'
import { useAuth } from '@/store/AuthContext'
import { cn } from '@/lib/utils'

export function AdminCustomers() {
    const navigate = useNavigate()
    const { addToast } = useToast()
    const { user } = useAuth()
    const [searchQuery, setSearchQuery] = useState('')
    const [customers, setCustomers] = useState<Customer[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
    const [showDetailsModal, setShowDetailsModal] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [showRoleConfirm, setShowRoleConfirm] = useState(false)
    const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null)
    const [customerToChangeRole, setCustomerToChangeRole] = useState<Customer | null>(null)
    const [newRole, setNewRole] = useState<'customer' | 'admin'>('customer')
    const [openDropdown, setOpenDropdown] = useState<string | null>(null)
    const [isProcessing, setIsProcessing] = useState(false)
    const { formatPrice } = useSettings()
    const dropdownRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        loadCustomers()
    }, [])

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setOpenDropdown(null)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const loadCustomers = async () => {
        try {
            setLoading(true)
            const data = await customerService.getCustomers()
            setCustomers(data)
        } catch (error) {
            console.error('Failed to load customers:', error)
            addToast('Failed to load customers', 'error')
        } finally {
            setLoading(false)
        }
    }

    const filteredCustomers = customers.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const handleViewDetails = async (customer: Customer) => {
        setSelectedCustomer(customer)
        setShowDetailsModal(true)
        setOpenDropdown(null)
    }

    const handleCopyEmail = (email: string) => {
        navigator.clipboard.writeText(email)
        addToast('Email copied to clipboard', 'success')
        setOpenDropdown(null)
    }

    const handleSendEmail = (email: string) => {
        window.location.href = `mailto:${email}`
        setOpenDropdown(null)
    }

    const handleViewOrders = (customerId: string) => {
        navigate(`/admin/orders?customer=${customerId}`)
        setOpenDropdown(null)
    }

    const handleChangeRole = (customer: Customer) => {
        if (customer.id === user?.id) {
            addToast('You cannot change your own role', 'error')
            return
        }
        setCustomerToChangeRole(customer)
        setNewRole(customer.role === 'admin' ? 'customer' : 'admin')
        setShowRoleConfirm(true)
        setOpenDropdown(null)
    }

    const confirmRoleChange = async () => {
        if (!customerToChangeRole) return

        try {
            setIsProcessing(true)
            const updated = await customerService.updateCustomerRole(customerToChangeRole.id, newRole)
            setCustomers(customers.map(c => c.id === updated.id ? updated : c))
            addToast(`Role changed to ${newRole}`, 'success')
            setShowRoleConfirm(false)
            setCustomerToChangeRole(null)
        } catch (error: any) {
            addToast(error.message || 'Failed to change role', 'error')
        } finally {
            setIsProcessing(false)
        }
    }

    const handleDeleteCustomer = (customer: Customer) => {
        if (customer.id === user?.id) {
            addToast('You cannot delete your own account', 'error')
            return
        }
        setCustomerToDelete(customer)
        setShowDeleteConfirm(true)
        setOpenDropdown(null)
    }

    const confirmDelete = async () => {
        if (!customerToDelete) return

        try {
            setIsProcessing(true)
            await customerService.deleteCustomer(customerToDelete.id)
            setCustomers(customers.filter(c => c.id !== customerToDelete.id))
            addToast('Customer deleted successfully', 'success')
            setShowDeleteConfirm(false)
            setCustomerToDelete(null)
        } catch (error: any) {
            addToast(error.message || 'Failed to delete customer', 'error')
        } finally {
            setIsProcessing(false)
        }
    }

    if (loading) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold text-foreground">Customers</h1>
                    <p className="text-muted-foreground">Loading customers...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-foreground">Customers</h1>
                    <p className="text-muted-foreground">Manage your customer base</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search customers..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="input pl-10"
                    />
                </div>
            </div>

            {/* Customers Table */}
            <div className="card overflow-hidden">
                <div className="overflow-x-auto min-h-[calc(100vh-20rem)]">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b bg-muted/50">
                                <th className="text-left p-4 font-medium text-sm">Customer</th>
                                <th className="text-left p-4 font-medium text-sm">Contact</th>
                                <th className="text-left p-4 font-medium text-sm">Role</th>
                                <th className="text-left p-4 font-medium text-sm">Orders</th>
                                <th className="text-left p-4 font-medium text-sm">Total Spent</th>
                                <th className="text-left p-4 font-medium text-sm">Join Date</th>
                                <th className="text-right p-4 font-medium text-sm">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {filteredCustomers.map((customer) => (
                                <tr key={customer.id} className="hover:bg-muted/30">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                                                {customer.name.charAt(0)}
                                            </div>
                                            <span className="font-medium text-sm">{customer.name}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-col text-sm">
                                            <div className="flex items-center gap-2">
                                                <Mail className="h-3 w-3 text-muted-foreground" />
                                                <span>{customer.email}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={cn(
                                            'badge',
                                            customer.role === 'admin' ? 'bg-primary/10 text-primary' : 'badge-secondary'
                                        )}>
                                            {customer.role === 'admin' && <Shield className="h-3 w-3 mr-1" />}
                                            {customer.role === 'customer' && <User className="h-3 w-3 mr-1" />}
                                            {customer.role}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm">{customer.orders} orders</td>
                                    <td className="p-4 text-sm font-medium">{formatPrice(customer.totalSpent)}</td>
                                    <td className="p-4 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-3 w-3" />
                                            {new Date(customer.joinDate).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="relative inline-block" ref={openDropdown === customer.id ? dropdownRef : null}>
                                            <button
                                                onClick={() => setOpenDropdown(openDropdown === customer.id ? null : customer.id)}
                                                className="btn-ghost p-2"
                                            >
                                                <MoreVertical className="h-4 w-4" />
                                            </button>

                                            {openDropdown === customer.id && (
                                                <div className="absolute right-0 mt-2 w-48 bg-background border rounded-lg shadow-lg z-50">
                                                    <button
                                                        onClick={() => handleViewDetails(customer)}
                                                        className="w-full text-left px-4 py-2 text-sm hover:bg-muted flex items-center gap-2"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                        View Details
                                                    </button>
                                                    <button
                                                        onClick={() => handleChangeRole(customer)}
                                                        className="w-full text-left px-4 py-2 text-sm hover:bg-muted flex items-center gap-2"
                                                    >
                                                        <UserCog className="h-4 w-4" />
                                                        Change Role
                                                    </button>
                                                    <button
                                                        onClick={() => handleViewOrders(customer.id)}
                                                        className="w-full text-left px-4 py-2 text-sm hover:bg-muted flex items-center gap-2"
                                                    >
                                                        <ShoppingBag className="h-4 w-4" />
                                                        View Orders
                                                    </button>
                                                    <button
                                                        onClick={() => handleSendEmail(customer.email)}
                                                        className="w-full text-left px-4 py-2 text-sm hover:bg-muted flex items-center gap-2"
                                                    >
                                                        <Mail className="h-4 w-4" />
                                                        Send Email
                                                    </button>
                                                    <button
                                                        onClick={() => handleCopyEmail(customer.email)}
                                                        className="w-full text-left px-4 py-2 text-sm hover:bg-muted flex items-center gap-2"
                                                    >
                                                        <Copy className="h-4 w-4" />
                                                        Copy Email
                                                    </button>
                                                    <div className="border-t my-1"></div>
                                                    <button
                                                        onClick={() => handleDeleteCustomer(customer)}
                                                        className="w-full text-left px-4 py-2 text-sm hover:bg-destructive/10 text-destructive flex items-center gap-2"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                        Delete Customer
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Customer Details Modal */}
            {showDetailsModal && selectedCustomer && (
                <>
                    <div className="fixed inset-0 z-50 bg-foreground/50 backdrop-blur-sm" onClick={() => setShowDetailsModal(false)} />
                    <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg bg-background rounded-2xl shadow-2xl">
                        <div className="p-6 border-b flex items-center justify-between">
                            <h2 className="text-xl font-semibold">Customer Details</h2>
                            <button onClick={() => setShowDetailsModal(false)} className="btn-ghost p-2">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl">
                                    {selectedCustomer.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">{selectedCustomer.name}</h3>
                                    <p className="text-sm text-muted-foreground">{selectedCustomer.email}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Role</p>
                                    <span className={cn(
                                        'badge mt-1',
                                        selectedCustomer.role === 'admin' ? 'bg-primary/10 text-primary' : 'badge-secondary'
                                    )}>
                                        {selectedCustomer.role === 'admin' && <Shield className="h-3 w-3 mr-1" />}
                                        {selectedCustomer.role === 'customer' && <User className="h-3 w-3 mr-1" />}
                                        {selectedCustomer.role}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Email Verified</p>
                                    <p className="font-medium">{selectedCustomer.emailVerified ? 'Yes' : 'No'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Orders</p>
                                    <p className="font-medium">{selectedCustomer.orders}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Spent</p>
                                    <p className="font-medium">{formatPrice(selectedCustomer.totalSpent)}</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-sm text-muted-foreground">Join Date</p>
                                    <p className="font-medium">{new Date(selectedCustomer.joinDate).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border-t flex justify-end gap-3">
                            <button onClick={() => setShowDetailsModal(false)} className="btn-outline btn-md">
                                Close
                            </button>
                        </div>
                    </div>
                </>
            )}

            {/* Role Change Confirmation */}
            {showRoleConfirm && customerToChangeRole && (
                <>
                    <div className="fixed inset-0 z-50 bg-foreground/50 backdrop-blur-sm" onClick={() => !isProcessing && setShowRoleConfirm(false)} />
                    <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md bg-background rounded-2xl shadow-2xl">
                        <div className="p-6 border-b">
                            <h2 className="text-xl font-semibold">Change User Role</h2>
                        </div>
                        <div className="p-6">
                            <p className="text-muted-foreground mb-4">
                                Are you sure you want to change <strong>{customerToChangeRole.name}</strong>'s role from{' '}
                                <strong>{customerToChangeRole.role}</strong> to <strong>{newRole}</strong>?
                            </p>
                            {newRole === 'admin' && (
                                <div className="bg-accent/10 text-accent p-3 rounded-lg text-sm">
                                    <strong>Warning:</strong> This will grant admin privileges to this user.
                                </div>
                            )}
                        </div>
                        <div className="p-6 border-t flex justify-end gap-3">
                            <button
                                onClick={() => setShowRoleConfirm(false)}
                                disabled={isProcessing}
                                className="btn-outline btn-md"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmRoleChange}
                                disabled={isProcessing}
                                className="btn-primary btn-md"
                            >
                                {isProcessing ? 'Changing...' : 'Confirm'}
                            </button>
                        </div>
                    </div>
                </>
            )}

            {/* Delete Confirmation */}
            {showDeleteConfirm && customerToDelete && (
                <>
                    <div className="fixed inset-0 z-50 bg-foreground/50 backdrop-blur-sm" onClick={() => !isProcessing && setShowDeleteConfirm(false)} />
                    <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md bg-background rounded-2xl shadow-2xl">
                        <div className="p-6 border-b">
                            <h2 className="text-xl font-semibold text-destructive">Delete Customer</h2>
                        </div>
                        <div className="p-6">
                            <p className="text-muted-foreground mb-4">
                                Are you sure you want to delete <strong>{customerToDelete.name}</strong>?
                            </p>
                            <div className="bg-destructive/10 text-destructive p-3 rounded-lg text-sm">
                                <strong>Warning:</strong> This action cannot be undone. All customer data including orders and addresses will be permanently deleted.
                            </div>
                        </div>
                        <div className="p-6 border-t flex justify-end gap-3">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                disabled={isProcessing}
                                className="btn-outline btn-md"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                disabled={isProcessing}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90 btn-md"
                            >
                                {isProcessing ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
