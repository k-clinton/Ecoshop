import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Users,
  DollarSign,
  Package,
  ShoppingCart,
  ArrowRight,
  AlertCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useToast } from '@/store/ToastContext'
import { useSettings } from '@/store/SettingsContext'
import { adminService } from '@/services/admin'

interface DashboardStats {
  totalRevenue: number
  totalOrders: number
  totalCustomers: number
  totalProducts: number
  recentOrders: {
    id: string
    total: number
    status: string
    createdAt: string
  }[]
  lowStockProducts: {
    id: string
    name: string
    slug: string
    stock: number
  }[]
}

export function AdminDashboard() {
  const { formatPrice } = useSettings()
  const { addToast } = useToast()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      setLoading(true)
      const data = await adminService.getStats()
      setStats(data)
    } catch (error) {
      console.error('Failed to load dashboard stats:', error)
      addToast('Failed to load dashboard statistics', 'error')
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      label: 'Total Revenue',
      value: stats ? formatPrice(stats.totalRevenue) : '$0.00',
      change: 'See orders',
      trend: 'up',
      icon: DollarSign,
      color: 'bg-success/10 text-success',
      link: '/admin/orders'
    },
    {
      label: 'Orders',
      value: stats?.totalOrders.toString() || '0',
      change: 'View all',
      trend: 'up',
      icon: ShoppingCart,
      color: 'bg-primary/10 text-primary',
      link: '/admin/orders'
    },
    {
      label: 'Products',
      value: stats?.totalProducts.toString() || '0',
      change: 'Manage',
      trend: 'up',
      icon: Package,
      color: 'bg-accent/10 text-accent',
      link: '/admin/products'
    },
    {
      label: 'Customers',
      value: stats?.totalCustomers.toString() || '0',
      change: 'View list',
      trend: 'up',
      icon: Users,
      color: 'bg-secondary text-secondary-foreground',
      link: '/admin/customers'
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's what's happening with your store.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Link key={stat.label} to={stat.link} className="block transition-transform hover:-translate-y-1">
            <div className="card p-6 h-full">
              <div className="flex items-center justify-between mb-4">
                <div className={cn('h-10 w-10 rounded-lg flex items-center justify-center', stat.color)}>
                  <stat.icon className="h-5 w-5" />
                </div>
              </div>
              <p className="text-2xl font-semibold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground mb-2">{stat.label}</p>
              <div className="text-xs text-primary flex items-center gap-1">
                {stat.change} <ArrowRight className="h-3 w-3" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="card">
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="font-semibold">Recent Orders</h2>
            <Link to="/admin/orders" className="text-sm text-primary hover:underline flex items-center gap-1">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="divide-y max-h-[400px] overflow-y-auto">
            {stats?.recentOrders && stats.recentOrders.length > 0 ? (
              stats.recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium text-sm">Order #{order.id}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm">{formatPrice(order.total)}</p>
                    <span className={cn(
                      'inline-block text-xs px-2 py-0.5 rounded-full capitalize',
                      order.status === 'delivered' && 'bg-success/10 text-success',
                      order.status === 'shipped' && 'bg-primary/10 text-primary',
                      order.status === 'processing' && 'bg-accent/10 text-accent',
                      order.status === 'pending' && 'bg-muted text-muted-foreground',
                      order.status === 'cancelled' && 'bg-destructive/10 text-destructive',
                    )}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                No orders yet.
              </div>
            )}
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="card">
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-accent" />
              <h2 className="font-semibold">Low Stock Alert</h2>
            </div>
            <Link to="/admin/inventory" className="text-sm text-primary hover:underline flex items-center gap-1">
              Manage <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="divide-y max-h-[400px] overflow-y-auto">
            {stats?.lowStockProducts && stats.lowStockProducts.length > 0 ? (
              stats.lowStockProducts.map((product) => (
                <div key={product.id} className="flex items-center gap-4 p-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{product.name}</p>
                    <Link to={`/ products / ${product.slug} `} className="text-xs text-primary hover:underline">View Product</Link>
                  </div>
                  <div className="text-right">
                    <p className={cn(
                      'font-semibold text-sm',
                      product.stock < 5 ? 'text-destructive' : 'text-accent'
                    )}>
                      {product.stock} units
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                No low stock alerts. Good job!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card p-6">
        <h2 className="font-semibold mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link to="/admin/products" className="btn-primary btn-sm">
            <Package className="h-4 w-4" />
            Add Product
          </Link>
          <Link to="/admin/orders" className="btn-outline btn-sm">
            <ShoppingCart className="h-4 w-4" />
            Process Orders
          </Link>
          <Link to="/admin/inventory" className="btn-outline btn-sm">
            <AlertCircle className="h-4 w-4" />
            Update Stock
          </Link>
        </div>
      </div>
    </div>
  )
}
