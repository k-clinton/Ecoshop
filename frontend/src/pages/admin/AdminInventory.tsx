import { useState, useEffect } from 'react'
import { Search, AlertTriangle, Plus, Minus, Save } from 'lucide-react'
import { categories } from '@/data/mockData'
import { cn } from '@/lib/utils'
import { useToast } from '@/store/ToastContext'
import { adminService } from '@/services/admin'
import { getImageUrl } from '@/config/api'

export function AdminInventory() {
  const { addToast } = useToast()
  const [searchQuery, setSearchQuery] = useState('')
  const [stockFilter, setStockFilter] = useState<string>('')
  const [adjustments, setAdjustments] = useState<Record<string, number>>({})
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Load products from API
  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      setLoading(true)
      const data = await adminService.getProducts()
      setProducts(data)
    } catch (error) {
      console.error('Failed to load products:', error)
      addToast('Failed to load products', 'error')
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStock = !stockFilter ||
      (stockFilter === 'low' && p.stock < 30) ||
      (stockFilter === 'out' && p.stock === 0) ||
      (stockFilter === 'healthy' && p.stock >= 30)
    return matchesSearch && matchesStock
  })

  const handleAdjustment = (productId: string, delta: number) => {
    setAdjustments(prev => ({
      ...prev,
      [productId]: (prev[productId] || 0) + delta
    }))
  }

  const handleSave = async (productId: string) => {
    const adjustment = adjustments[productId]
    if (adjustment) {
      try {
        const result = await adminService.adjustStock(productId, adjustment)

        // Update local state with new stock value
        setProducts(prevProducts =>
          prevProducts.map(p =>
            p.id === productId
              ? { ...p, stock: result.newStock }
              : p
          )
        )

        addToast(`Stock updated: ${adjustment > 0 ? '+' : ''}${adjustment} units`, 'success')

        // Clear the adjustment for this product
        setAdjustments(prev => {
          const { [productId]: _, ...rest } = prev
          return rest
        })
      } catch (error) {
        console.error('Failed to adjust stock:', error)
        addToast('Failed to update stock', 'error')
      }
    }
  }

  const lowStockCount = products.filter(p => p.stock < 30 && p.stock > 0).length
  const outOfStockCount = products.filter(p => p.stock === 0).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Inventory</h1>
        <p className="text-muted-foreground">Monitor and adjust stock levels</p>
      </div>

      {/* Alerts */}
      {(lowStockCount > 0 || outOfStockCount > 0) && (
        <div className="flex flex-wrap gap-4">
          {lowStockCount > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent/10 text-accent">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-medium">{lowStockCount} products low on stock</span>
            </div>
          )}
          {outOfStockCount > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-destructive/10 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-medium">{outOfStockCount} products out of stock</span>
            </div>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-10"
          />
        </div>
        <select
          value={stockFilter}
          onChange={(e) => setStockFilter(e.target.value)}
          className="input w-full sm:w-48"
        >
          <option value="">All Stock Levels</option>
          <option value="low">Low Stock (&lt;30)</option>
          <option value="out">Out of Stock</option>
          <option value="healthy">Healthy (&gt;=30)</option>
        </select>
      </div>

      {/* Inventory Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-4 font-medium text-sm">Product</th>
                <th className="text-left p-4 font-medium text-sm">Category</th>
                <th className="text-left p-4 font-medium text-sm">SKU</th>
                <th className="text-left p-4 font-medium text-sm">Current Stock</th>
                <th className="text-left p-4 font-medium text-sm">Status</th>
                <th className="text-left p-4 font-medium text-sm">Adjust</th>
                <th className="text-right p-4 font-medium text-sm">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">
                    Loading inventory...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">
                    No products found
                  </td>
                </tr>
              ) : null}
              {!loading && filteredProducts.map((product) => {
                const category = categories.find(c => c.id === product.category)
                const adjustment = adjustments[product.id] || 0
                const newStock = product.stock + adjustment

                return (
                  <tr key={product.id} className="hover:bg-muted/30">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                          <img src={getImageUrl(product.images[0])} alt={product.name} className="h-full w-full object-cover" />
                        </div>
                        <p className="font-medium text-sm">{product.name}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-muted-foreground">{category?.name}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm font-mono text-muted-foreground">
                        {product.variants[0]?.sku}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          'font-semibold',
                          product.stock === 0 ? 'text-destructive' :
                            product.stock < 30 ? 'text-accent' : 'text-foreground'
                        )}>
                          {product.stock}
                        </span>
                        {adjustment !== 0 && (
                          <span className={cn(
                            'text-sm font-medium',
                            adjustment > 0 ? 'text-success' : 'text-destructive'
                          )}>
                            → {newStock}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={cn(
                        'badge',
                        product.stock === 0 ? 'bg-destructive/10 text-destructive' :
                          product.stock < 30 ? 'bg-accent/10 text-accent' : 'badge-success'
                      )}>
                        {product.stock === 0 ? 'Out of Stock' :
                          product.stock < 30 ? 'Low Stock' : 'In Stock'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleAdjustment(product.id, -10)}
                          className="btn-ghost p-1.5"
                          disabled={newStock <= 0}
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <input
                          type="number"
                          value={adjustment}
                          onChange={(e) => setAdjustments(prev => ({
                            ...prev,
                            [product.id]: parseInt(e.target.value) || 0
                          }))}
                          className="input w-20 h-8 text-center text-sm"
                        />
                        <button
                          onClick={() => handleAdjustment(product.id, 10)}
                          className="btn-ghost p-1.5"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-end">
                        <button
                          onClick={() => handleSave(product.id)}
                          disabled={adjustment === 0}
                          className={cn(
                            'btn-sm',
                            adjustment !== 0 ? 'btn-primary' : 'btn-ghost opacity-50'
                          )}
                        >
                          <Save className="h-4 w-4" />
                          Save
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
