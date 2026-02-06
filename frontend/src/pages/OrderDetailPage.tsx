
import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Package, MapPin, Truck, CheckCircle, Clock, CreditCard } from 'lucide-react'
import { useAuth } from '@/store/AuthContext'
import { useToast } from '@/store/ToastContext'
import { useSettings } from '@/store/SettingsContext'
import { orderService } from '@/services/orders'
import type { Order } from '@/data/types'

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { addToast } = useToast()
  const { formatPrice } = useSettings()
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      navigate('/signin')
      return
    }

    if (id) {
      loadOrder(id)
    }
  }, [id, user, navigate])

  const loadOrder = async (orderId: string) => {
    setIsLoading(true)
    try {
      const data = await orderService.getOrderById(orderId)
      setOrder(data)
    } catch (error: any) {
      addToast(error.message || 'Failed to load order', 'error')
      navigate('/account')
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // formatPrice removed to use context

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          color: 'text-yellow-700 bg-yellow-50 border-yellow-200',
          icon: Clock,
          label: 'Pending',
          description: 'Your order is being processed',
        }
      case 'processing':
        return {
          color: 'text-blue-700 bg-blue-50 border-blue-200',
          icon: Package,
          label: 'Processing',
          description: 'We are preparing your order',
        }
      case 'shipped':
        return {
          color: 'text-purple-700 bg-purple-50 border-purple-200',
          icon: Truck,
          label: 'Shipped',
          description: 'Your order is on its way',
        }
      case 'delivered':
        return {
          color: 'text-green-700 bg-green-50 border-green-200',
          icon: CheckCircle,
          label: 'Delivered',
          description: 'Your order has been delivered',
        }
      case 'cancelled':
        return {
          color: 'text-red-700 bg-red-50 border-red-200',
          icon: Package,
          label: 'Cancelled',
          description: 'This order has been cancelled',
        }
      default:
        return {
          color: 'text-gray-700 bg-gray-50 border-gray-200',
          icon: Package,
          label: status,
          description: '',
        }
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center py-12">
        <div className="text-center">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Order not found</h2>
          <Link to="/account" className="text-primary hover:underline">
            Back to Account
          </Link>
        </div>
      </div>
    )
  }

  const statusInfo = getStatusInfo(order.status)
  const StatusIcon = statusInfo.icon

  return (
    <div className="min-h-screen bg-muted/30 py-12">
      <div className="container-wide">
        {/* Back Button */}
        <Link
          to="/account"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Account
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold mb-2">
            Order #{order.id.slice(0, 8).toUpperCase()}
          </h1>
          <p className="text-muted-foreground">
            Placed on {formatDate(order.createdAt)}
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Card */}
            <div className={`rounded-xl border p-6 ${statusInfo.color}`}>
              <div className="flex items-start gap-4">
                <StatusIcon className="h-8 w-8 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-lg mb-1">{statusInfo.label}</h3>
                  <p className="text-sm opacity-90">{statusInfo.description}</p>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-card rounded-xl border">
              <div className="p-6 border-b">
                <h3 className="font-semibold text-lg">Order Items</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {order.items?.map((item, index) => (
                    <div key={index} className="flex items-center gap-4 pb-4 border-b last:border-0 last:pb-0">
                      <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center">
                        <Package className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Product ID: {item.productId.slice(0, 8)}</p>
                        <p className="text-sm text-muted-foreground">
                          Variant: {item.variantId.slice(0, 8)} • Qty: {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatPrice(item.price)}</p>
                        <p className="text-sm text-muted-foreground">each</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-card rounded-xl border p-6">
              <div className="flex items-start gap-3 mb-4">
                <MapPin className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h3 className="font-semibold mb-2">Shipping Address</h3>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p className="font-medium text-foreground">{order.shippingAddress.name}</p>
                    <p>{order.shippingAddress.street}</p>
                    <p>
                      {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}
                    </p>
                    <p>{order.shippingAddress.country}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-card rounded-xl border p-6">
              <h3 className="font-semibold text-lg mb-4">Order Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">{formatPrice(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-medium">{formatPrice(order.shipping)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span className="font-medium">{formatPrice(order.tax)}</span>
                </div>
                <div className="pt-3 border-t">
                  <div className="flex justify-between">
                    <span className="font-semibold">Total</span>
                    <span className="font-bold text-lg">{formatPrice(order.total)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-card rounded-xl border p-6">
              <h3 className="font-semibold text-lg mb-4">Need Help?</h3>
              <div className="space-y-3">
                <button className="w-full btn-outline text-left flex items-center gap-3">
                  <Package className="h-4 w-4" />
                  Track Shipment
                </button>
                <button className="w-full btn-outline text-left flex items-center gap-3">
                  <CreditCard className="h-4 w-4" />
                  View Invoice
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
