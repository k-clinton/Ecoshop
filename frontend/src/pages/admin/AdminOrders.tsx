import React, { useState, useEffect } from 'react'
import { Search, Eye, Filter, CheckCircle, Truck, XCircle, Clock, ChevronDown, Package, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import apiCall from '@/services/api'
import { useToast } from '@/store/ToastContext'
import { useSettings } from '@/store/SettingsContext'

const initialOrders = [
  {
    id: 'ORD-006',
    customer: 'Emily Chen',
    email: 'emily@example.com',
    items: 3,
    total: 156.99,
    status: 'pending' as const,
    date: '2024-02-01',
    address: '123 Oak Street, Portland, OR 97201'
  },
  {
    id: 'ORD-005',
    customer: 'Michael Brown',
    email: 'michael@example.com',
    items: 1,
    total: 89.00,
    status: 'processing' as const,
    date: '2024-01-31',
    address: '456 Pine Ave, Seattle, WA 98101'
  },
  {
    id: 'ORD-004',
    customer: 'Sarah Johnson',
    email: 'sarah@example.com',
    items: 2,
    total: 234.50,
    status: 'shipped' as const,
    date: '2024-01-30',
    address: '789 Maple Dr, San Francisco, CA 94102'
  },
  {
    id: 'ORD-003',
    customer: 'David Lee',
    email: 'david@example.com',
    items: 4,
    total: 312.00,
    status: 'delivered' as const,
    date: '2024-01-28',
    address: '321 Cedar Ln, Los Angeles, CA 90001'
  },
  {
    id: 'ORD-002',
    customer: 'Lisa Wang',
    email: 'lisa@example.com',
    items: 1,
    total: 45.00,
    status: 'cancelled' as const,
    date: '2024-01-27',
    address: '654 Birch Rd, Denver, CO 80201'
  },
  {
    id: 'ORD-001',
    customer: 'James Wilson',
    email: 'james@example.com',
    items: 2,
    total: 178.99,
    status: 'delivered' as const,
    date: '2024-01-25',
    address: '987 Elm St, Austin, TX 78701'
  },
]

const statusOptions = [
  { value: 'pending', label: 'Pending', icon: Clock, color: 'bg-muted text-muted-foreground' },
  { value: 'processing', label: 'Processing', icon: Package, color: 'bg-accent/10 text-accent' },
  { value: 'shipped', label: 'Shipped', icon: Truck, color: 'bg-primary/10 text-primary' },
  { value: 'delivered', label: 'Delivered', icon: CheckCircle, color: 'bg-success/10 text-success' },
  { value: 'cancelled', label: 'Cancelled', icon: XCircle, color: 'bg-destructive/10 text-destructive' },
]

export function AdminOrders() {
  const { addToast } = useToast()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [selectedOrder, setSelectedOrder] = useState<typeof initialOrders[0] | null>(null)
  const [orders, setOrders] = useState(initialOrders)
  const [isUpdating, setIsUpdating] = useState(false)

  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customer.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = !statusFilter || o.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleStatusChange = async (orderId: string, newStatus: typeof initialOrders[0]['status']) => {
    setIsUpdating(true)

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))

    setOrders(orders.map(order =>
      order.id === orderId ? { ...order, status: newStatus } : order
    ))

    addToast(`Order ${orderId} status updated to ${newStatus}`, 'success')
    setIsUpdating(false)

    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status: newStatus })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Orders</h1>
        <p className="text-muted-foreground">View and manage customer orders</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {statusOptions.map((status) => {
          const count = orders.filter(o => o.status === status.value).length
          return (
            <button
              key={status.value}
              onClick={() => setStatusFilter(statusFilter === status.value ? '' : status.value)}
              className={cn(
                'card p-4 text-left transition-all',
                statusFilter === status.value && 'ring-2 ring-primary'
              )}
            >
              {status.value === 'pending' && <Clock className="h-5 w-5 text-muted-foreground mb-2" />}
              {status.value === 'processing' && <Package className="h-5 w-5 text-muted-foreground mb-2" />}
              {status.value === 'shipped' && <Truck className="h-5 w-5 text-muted-foreground mb-2" />}
              {status.value === 'delivered' && <CheckCircle className="h-5 w-5 text-muted-foreground mb-2" />}
              {status.value === 'cancelled' && <XCircle className="h-5 w-5 text-muted-foreground mb-2" />}
              <p className="text-2xl font-semibold">{count}</p>
              <p className="text-sm text-muted-foreground">{status.label}</p>
            </button>
          )
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input w-full sm:w-48"
        >
          <option value="">All Status</option>
          {statusOptions.map(status => (
            <option key={status.value} value={status.value}>{status.label}</option>
          ))}
        </select>
      </div>

      {/* Orders Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-4 font-medium text-sm">Order</th>
                <th className="text-left p-4 font-medium text-sm">Customer</th>
                <th className="text-left p-4 font-medium text-sm">Date</th>
                <th className="text-left p-4 font-medium text-sm">Items</th>
                <th className="text-left p-4 font-medium text-sm">Total</th>
                <th className="text-left p-4 font-medium text-sm">Status</th>
                <th className="text-right p-4 font-medium text-sm">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredOrders.map((order) => {
                const statusConfig = statusOptions.find(s => s.value === order.status)
                return (
                  <tr key={order.id} className="hover:bg-muted/30">
                    <td className="p-4">
                      <p className="font-medium text-sm">{order.id}</p>
                    </td>
                    <td className="p-4">
                      <p className="font-medium text-sm">{order.customer}</p>
                      <p className="text-xs text-muted-foreground">{order.email}</p>
                    </td>
                    <td className="p-4">
                      <p className="text-sm">{order.date}</p>
                    </td>
                    <td className="p-4">
                      <p className="text-sm">{order.items} items</p>
                    </td>
                    <td className="p-4">
                      <p className="font-medium">{formatPrice(order.total)}</p>
                    </td>
                    <td className="p-4">
                      <span className={cn('badge', statusConfig?.color)}>
                        {statusConfig?.value === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                        {statusConfig?.value === 'processing' && <Package className="h-3 w-3 mr-1" />}
                        {statusConfig?.value === 'shipped' && <Truck className="h-3 w-3 mr-1" />}
                        {statusConfig?.value === 'delivered' && <CheckCircle className="h-3 w-3 mr-1" />}
                        {statusConfig?.value === 'cancelled' && <XCircle className="h-3 w-3 mr-1" />}
                        {statusConfig?.label}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="btn-ghost btn-sm"
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </button>
                        <div className="relative">
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusChange(order.id, e.target.value as typeof order.status)}
                            disabled={isUpdating}
                            className="input h-9 text-xs pr-8 appearance-none cursor-pointer"
                          >
                            {statusOptions.map(status => (
                              <option key={status.value} value={status.value}>{status.label}</option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                        </div>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <>
          <div className="fixed inset-0 z-50 bg-foreground/50 backdrop-blur-sm" onClick={() => setSelectedOrder(null)} />
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg bg-background rounded-2xl shadow-2xl">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-semibold">Order {selectedOrder.id}</h2>
              <button
                onClick={() => setSelectedOrder(null)}
                className="btn-ghost p-2"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Customer</p>
                  <p className="font-medium">{selectedOrder.customer}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{selectedOrder.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium">{selectedOrder.date}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value as typeof selectedOrder.status)}
                    disabled={isUpdating}
                    className="input text-sm"
                  >
                    {statusOptions.map(status => (
                      <option key={status.value} value={status.value}>{status.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Shipping Address</p>
                <p className="font-medium">{selectedOrder.address}</p>
              </div>
              <div className="pt-4 border-t">
                <div className="flex justify-between items-center">
                  <p className="text-lg font-semibold">Total</p>
                  <p className="text-lg font-semibold">{formatPrice(selectedOrder.total)}</p>
                </div>
              </div>
            </div>
            <div className="p-6 border-t flex justify-end gap-3">
              <button onClick={() => setSelectedOrder(null)} className="btn-outline btn-md">
                Close
              </button>
              <button
                onClick={() => handleStatusChange(selectedOrder.id, selectedOrder.status === 'shipped' ? 'delivered' : 'shipped')}
                className="btn-primary btn-md"
                disabled={isUpdating}
              >
                {isUpdating ? 'Updating...' : `Mark as ${selectedOrder.status === 'shipped' ? 'Delivered' : 'Shipped'}`}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
