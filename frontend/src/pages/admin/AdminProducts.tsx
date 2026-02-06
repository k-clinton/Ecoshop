import React, { useState, useEffect } from 'react'
import { Plus, Search, Edit2, Trash2, MoreVertical, Image as ImageIcon, X, Upload } from 'lucide-react'
import { categories } from '@/data/mockData'
import { Product, ProductVariant } from '@/data/types'
import { formatPrice, cn } from '@/lib/utils'
import { useToast } from '@/store/ToastContext'
import { adminService } from '@/services/admin'

export function AdminProducts() {
  const { addToast } = useToast()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    compareAtPrice: 0,
    category: '',
    stock: 0,
    featured: false,
    images: [] as string[],
    tags: [] as string[],
    variants: [] as { name: string; sku: string; price: number; stock: number }[],
  })
  const [newVariant, setNewVariant] = useState({ name: '', sku: '', price: 0, stock: 0 })
  const [dragActive, setDragActive] = useState(false)

  // Use a state to manage products instead of relying on mock data directly
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  // Load products from API on mount
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

  React.useEffect(() => {
    if (editingProduct) {
      setFormData({
        name: editingProduct.name,
        description: editingProduct.description,
        price: editingProduct.price,
        compareAtPrice: editingProduct.compareAtPrice || 0,
        category: editingProduct.category,
        stock: editingProduct.stock,
        featured: editingProduct.featured,
        images: editingProduct.images,
        tags: editingProduct.tags,
        variants: editingProduct.variants.map(v => ({
          name: v.name,
          sku: v.sku,
          price: v.price,
          stock: v.stock,
        })),
      })
    } else {
      setFormData({
        name: '',
        description: '',
        price: 0,
        compareAtPrice: 0,
        category: '',
        stock: 0,
        featured: false,
        images: [],
        tags: [],
        variants: [],
      })
    }
  }, [editingProduct])

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = !selectedCategory || p.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setIsModalOpen(true)
  }

  const handleDelete = async (product: Product) => {
    if (!confirm(`Are you sure you want to delete "${product.name}"?`)) {
      return
    }
    
    try {
      await adminService.deleteProduct(product.id)
      setProducts(products.filter(p => p.id !== product.id))
      addToast(`"${product.name}" deleted`, 'success')
    } catch (error) {
      console.error('Failed to delete product:', error)
      addToast('Failed to delete product', 'error')
    }
  }

  const handleAddVariant = () => {
    if (newVariant.name && newVariant.sku) {
      setFormData({
        ...formData,
        variants: [
          ...formData.variants,
          { ...newVariant }
        ]
      })
      setNewVariant({ name: '', sku: '', price: 0, stock: 0 })
    }
  }

  const handleRemoveVariant = (index: number) => {
    setFormData({
      ...formData,
      variants: formData.variants.filter((_, i) => i !== index)
    })
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      // Create a temporary URL for the uploaded image
      const imageUrl = URL.createObjectURL(file)
      setFormData({
        ...formData,
        images: [...formData.images, imageUrl]
      })
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      // Create a temporary URL for the dropped image
      const imageUrl = URL.createObjectURL(file)
      setFormData({
        ...formData,
        images: [...formData.images, imageUrl]
      })
    }
  }

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const removeImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index)
    })
  }

  const handleSave = async () => {
    if (!formData.name || !formData.category) {
      addToast('Please fill in required fields', 'error')
      return
    }

    try {
      const productData = {
        name: formData.name,
        slug: formData.name.toLowerCase().replace(/\s+/g, '-'),
        description: formData.description,
        price: formData.price,
        compareAtPrice: formData.compareAtPrice || undefined,
        category: formData.category,
        stock: formData.stock,
        featured: formData.featured,
        images: formData.images.length > 0 ? formData.images : ['/images/product-blank.jpg'],
        tags: formData.tags,
        variants: formData.variants.length > 0 
          ? formData.variants.map(v => ({
              name: v.name,
              sku: v.sku,
              price: v.price,
              stock: v.stock,
              available: v.stock > 0,
            }))
          : [{
              name: 'Default',
              sku: `SKU-${Date.now()}`,
              price: formData.price,
              stock: formData.stock,
              available: formData.stock > 0,
            }],
        rating: 0,
        reviewCount: 0,
      }

      if (editingProduct) {
        // Update existing product
        await adminService.updateProduct(editingProduct.id, productData)
        addToast('Product updated successfully!', 'success')
      } else {
        // Create new product
        await adminService.createProduct(productData)
        addToast('Product created successfully!', 'success')
      }
      
      // Reload products from API
      await loadProducts()
      
      setIsModalOpen(false)
      setEditingProduct(null)
    } catch (error) {
      console.error('Failed to save product:', error)
      addToast('Failed to save product', 'error')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Products</h1>
          <p className="text-muted-foreground">Manage your product catalog</p>
        </div>
        <button 
          onClick={() => { setEditingProduct(null); setIsModalOpen(true) }}
          className="btn-primary btn-md"
        >
          <Plus className="h-5 w-5" />
          Add Product
        </button>
      </div>

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
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="input w-full sm:w-48"
        >
          <option value="">All Categories</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Products Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-4 font-medium text-sm">Product</th>
                <th className="text-left p-4 font-medium text-sm">Category</th>
                <th className="text-left p-4 font-medium text-sm">Price</th>
                <th className="text-left p-4 font-medium text-sm">Stock</th>
                <th className="text-left p-4 font-medium text-sm">Status</th>
                <th className="text-right p-4 font-medium text-sm">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    Loading products...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    No products found. Create your first product to get started.
                  </td>
                </tr>
              ) : null}
              {!loading && filteredProducts.map((product) => {
                const category = categories.find(c => c.id === product.category)
                return (
                  <tr key={product.id} className="hover:bg-muted/30">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                          <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{product.name}</p>
                          <p className="text-xs text-muted-foreground">{product.variants.length} variants</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="badge-secondary">{category?.name}</span>
                    </td>
                    <td className="p-4">
                      <p className="font-medium">{formatPrice(product.price)}</p>
                      {product.compareAtPrice && (
                        <p className="text-xs text-muted-foreground line-through">
                          {formatPrice(product.compareAtPrice)}
                        </p>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={cn(
                        'font-medium',
                        product.stock < 20 ? 'text-destructive' : product.stock < 50 ? 'text-accent' : 'text-success'
                      )}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={cn(
                        'badge',
                        product.stock > 0 ? 'badge-success' : 'bg-destructive/10 text-destructive'
                      )}>
                        {product.stock > 0 ? 'Active' : 'Out of Stock'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleEdit(product)}
                          className="btn-ghost p-2"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(product)}
                          className="btn-ghost p-2 text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
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

      {/* Product Modal */}
      {isModalOpen && (
        <>
          <div className="fixed inset-0 z-50 bg-foreground/50 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-background rounded-2xl shadow-2xl">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="btn-ghost p-2"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium mb-2">Product Name *</label>
                  <input 
                    type="text" 
                    className="input" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Enter product name"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea 
                    className="input min-h-[100px]" 
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Enter product description"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Price *</label>
                  <input 
                    type="number" 
                    step="0.01"
                    className="input" 
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value) || 0})}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Compare at Price</label>
                  <input 
                    type="number" 
                    step="0.01"
                    className="input" 
                    value={formData.compareAtPrice}
                    onChange={(e) => setFormData({...formData, compareAtPrice: parseFloat(e.target.value) || 0})}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Category *</label>
                  <select 
                    className="input" 
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                  >
                    <option value="">Select category</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Default Stock</label>
                  <input 
                    type="number" 
                    className="input" 
                    value={formData.stock}
                    onChange={(e) => setFormData({...formData, stock: parseInt(e.target.value) || 0})}
                    placeholder="0"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium mb-2">Tags</label>
                  <input 
                    type="text" 
                    className="input" 
                    value={formData.tags.join(', ')}
                    onChange={(e) => setFormData({...formData, tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)})}
                    placeholder="eco-friendly, sustainable, organic"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="rounded" 
                      checked={formData.featured}
                      onChange={(e) => setFormData({...formData, featured: e.target.checked})}
                    />
                    <span className="text-sm font-medium">Featured Product</span>
                  </label>
                </div>
              </div>

              {/* Variants Section */}
              <div className="border-t pt-6">
                <h3 className="font-medium mb-4">Product Variants</h3>
                <div className="space-y-3">
                  {formData.variants.map((variant, index) => (
                    <div key={index} className="flex items-center gap-2 p-3 border rounded-lg">
                      <div className="flex-1 grid grid-cols-4 gap-2">
                        <input 
                          type="text" 
                          className="input text-sm" 
                          value={variant.name}
                          onChange={(e) => {
                            const newVariants = [...formData.variants]
                            newVariants[index].name = e.target.value
                            setFormData({...formData, variants: newVariants})
                          }}
                          placeholder="Variant name"
                        />
                        <input 
                          type="text" 
                          className="input text-sm" 
                          value={variant.sku}
                          onChange={(e) => {
                            const newVariants = [...formData.variants]
                            newVariants[index].sku = e.target.value
                            setFormData({...formData, variants: newVariants})
                          }}
                          placeholder="SKU"
                        />
                        <input 
                          type="number" 
                          step="0.01"
                          className="input text-sm" 
                          value={variant.price}
                          onChange={(e) => {
                            const newVariants = [...formData.variants]
                            newVariants[index].price = parseFloat(e.target.value) || 0
                            setFormData({...formData, variants: newVariants})
                          }}
                          placeholder="Price"
                        />
                        <input 
                          type="number" 
                          className="input text-sm" 
                          value={variant.stock}
                          onChange={(e) => {
                            const newVariants = [...formData.variants]
                            newVariants[index].stock = parseInt(e.target.value) || 0
                            setFormData({...formData, variants: newVariants})
                          }}
                          placeholder="Stock"
                        />
                      </div>
                      <button 
                        onClick={() => handleRemoveVariant(index)}
                        className="btn-ghost p-2 text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  
                  <div className="flex gap-2 pt-2">
                    <input 
                      type="text" 
                      className="input flex-1 text-sm" 
                      value={newVariant.name}
                      onChange={(e) => setNewVariant({...newVariant, name: e.target.value})}
                      placeholder="Variant name (e.g. Small, Large)"
                    />
                    <input 
                      type="text" 
                      className="input w-32 text-sm" 
                      value={newVariant.sku}
                      onChange={(e) => setNewVariant({...newVariant, sku: e.target.value})}
                      placeholder="SKU"
                    />
                    <input 
                      type="number" 
                      step="0.01"
                      className="input w-24 text-sm" 
                      value={newVariant.price}
                      onChange={(e) => setNewVariant({...newVariant, price: parseFloat(e.target.value) || 0})}
                      placeholder="Price"
                    />
                    <input 
                      type="number" 
                      className="input w-24 text-sm" 
                      value={newVariant.stock}
                      onChange={(e) => setNewVariant({...newVariant, stock: parseInt(e.target.value) || 0})}
                      placeholder="Stock"
                    />
                    <button 
                      onClick={handleAddVariant}
                      className="btn-primary btn-sm"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>

              {/* Image Upload Section */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium mb-2">Product Images</label>
                <div 
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                    dragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input 
                    type="file" 
                    className="hidden" 
                    id="image-upload" 
                    accept="image/*" 
                    onChange={handleImageUpload}
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground mb-1">Click to upload or drag and drop</p>
                    <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 5MB</p>
                  </label>
                </div>

                {/* Preview uploaded images */}
                {formData.images.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2">Uploaded Images ({formData.images.length})</p>
                    <div className="flex flex-wrap gap-2">
                      {formData.images.map((image, index) => (
                        <div key={index} className="relative group">
                          <img 
                            src={image} 
                            alt={`Preview ${index + 1}`} 
                            className="h-20 w-20 rounded-lg object-cover border"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="p-6 border-t flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="btn-outline btn-md">
                Cancel
              </button>
              <button onClick={handleSave} className="btn-primary btn-md">
                {editingProduct ? 'Update Product' : 'Create Product'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
