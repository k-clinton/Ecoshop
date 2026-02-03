import React from 'react'
import { Link } from 'react-router-dom'
import { 
  DollarSign, 
  ShoppingCart, 
  Package, 
  Users,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  AlertCircle
} from 'lucide-react'
import { products, mockOrders } from '@/data/mockData'
import { formatPrice, cn } from '@/lib/utils'

const stats = [
  {
    label: 'Total Revenue',
    value: '$12,543.00',
    change: '+12.5%',
    trend: 'up',
    icon: DollarSign,
    color: 'bg-success/10 text-success',
  },
  {
    label: 'Orders',
    value: '156',
    change: '+8.2%',
    trend: 'up',
    icon: ShoppingCart,
    color: 'bg-primary/10 text-primary',
  },
  {
    label: 'Products',
    value: products.length.toString(),
    change: '+2',
    trend: 'up',
    icon: Package,
    color: 'bg-accent/10 text-accent',
  },
  {
    label: 'Customers',
    value: '1,429',
    change: '-2.1%',
    trend: 'down',
    icon: Users,
    color: 'bg-secondary text-secondary-foreground',
  },
]

const recentOrders = [
  { id: 'ORD-003', customer: 'John Smith', total: 89.99, status: 'pending', date: '2 min ago' },
  { id: 'ORD-002', customer: 'Jane Doe', total: 156.00, status: 'shipped', date: '1 hour ago' },
  { id: 'ORD-001', customer: 'Mike Johnson', total: 234.50, status: 'delivered', date: '3 hours ago' },
  { id: 'ORD-000', customer: 'Sarah Williams', total: 67.00, status: 'processing', date: '5 hours ago' },
]

const lowStockProducts = products
  .filter(p => p.stock < 30)
  .sort((a, b) => a.stock - b.stock)
  .slice(0, 5)

export function AdminDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's what's happening with your store.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={cn('h-10 w-10 rounded-lg flex items-center justify-center', stat.color)}>
                <stat.icon className="h-5 w-5" />
              </div>
              <span className={cn(
                'flex items-center gap-1 text-sm font-medium',
                stat.trend === 'up' ? 'text-success' : 'text-destructive'
              )}>
                {stat.trend === 'up' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                {stat.change}
              </span>
            </div>
            <p className="text-2xl font-semibold text-foreground">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </div>
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
          <div className="divide-y">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium text-sm">{order.id}</p>
                  <p className="text-sm text-muted-foreground">{order.customer}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-sm">{formatPrice(order.total)}</p>
                  <span className={cn(
                    'inline-block text-xs px-2 py-0.5 rounded-full',
                    order.status === 'delivered' && 'bg-success/10 text-success',
                    order.status === 'shipped' && 'bg-primary/10 text-primary',
                    order.status === 'processing' && 'bg-accent/10 text-accent',
                    order.status === 'pending' && 'bg-muted text-muted-foreground',
                  )}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
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
          <div className="divide-y">
            {lowStockProducts.map((product) => (
              <div key={product.id} className="flex items-center gap-4 p-4">
                <div className="h-12 w-12 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                  <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{product.name}</p>
                  <p className="text-sm text-muted-foreground">{product.variants.length} variants</p>
                </div>
                <div className="text-right">
                  <p className={cn(
                    'font-semibold text-sm',
                    product.stock < 20 ? 'text-destructive' : 'text-accent'
                  )}>
                    {product.stock} units
                  </p>
                </div>
              </div>
            ))}
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
