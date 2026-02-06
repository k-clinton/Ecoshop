import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Filter, SlidersHorizontal, X, ChevronDown } from 'lucide-react'
import { ProductCard } from '@/components/ProductCard'
import { productService } from '@/services/products'
import { categoryService } from '@/services/categories'
import { Product, Category } from '@/data/types'
import { cn } from '@/lib/utils'

type SortOption = 'featured' | 'newest' | 'price-asc' | 'price-desc' | 'rating'

export function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [sortBy, setSortBy] = useState<SortOption>('featured')
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [priceRanges, setPriceRanges] = useState<string[]>([])

  const selectedCategory = searchParams.get('category')
  const searchQuery = searchParams.get('search') || ''

  // Load categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await categoryService.getCategories()
        setCategories(cats)
      } catch (error) {
        console.error('Failed to load categories:', error)
      }
    }
    loadCategories()
  }, [])

  // Load products when filters change
  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true)
      try {
        const category = categories.find(c => c.slug === selectedCategory)
        const filters: any = {}

        if (selectedCategory && category) {
          filters.category = category.id
        }

        if (searchQuery) {
          filters.search = searchQuery
        }

        const prods = await productService.getProducts(filters)
        setProducts(prods)
      } catch (error) {
        console.error('Failed to load products:', error)
      } finally {
        setLoading(false)
      }
    }

    if (categories.length > 0 || !selectedCategory) {
      loadProducts()
    }
  }, [selectedCategory, searchQuery, categories.length])

  const filteredProducts = useMemo(() => {
    let result = [...products]

    // Filter by price ranges
    if (priceRanges.length > 0) {
      result = result.filter(product => {
        return priceRanges.some(range => {
          switch (range) {
            case 'under-25':
              return product.price < 25
            case '25-50':
              return product.price >= 25 && product.price < 50
            case '50-100':
              return product.price >= 50 && product.price < 100
            case 'over-100':
              return product.price >= 100
            default:
              return false
          }
        })
      })
    }

    // Sort
    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      case 'price-asc':
        result.sort((a, b) => a.price - b.price)
        break
      case 'price-desc':
        result.sort((a, b) => b.price - a.price)
        break
      case 'rating':
        result.sort((a, b) => b.rating - a.rating)
        break
      case 'featured':
      default:
        result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0))
    }

    return result
  }, [products, sortBy, priceRanges])

  const handleCategoryChange = (categorySlug: string | null) => {
    if (categorySlug) {
      searchParams.set('category', categorySlug)
    } else {
      searchParams.delete('category')
    }
    setSearchParams(searchParams)
  }

  const handlePriceRangeChange = (range: string) => {
    setPriceRanges(prev => {
      if (prev.includes(range)) {
        return prev.filter(r => r !== range)
      } else {
        return [...prev, range]
      }
    })
  }

  const currentCategory = categories.find(c => c.slug === selectedCategory)

  return (
    <main className="section">
      <div className="container-wide">
        {/* Header */}
        <div className="mb-8">
          <h1 className="heading-display text-3xl md:text-4xl text-foreground mb-2">
            {currentCategory ? currentCategory.name : 'All Products'}
          </h1>
          <p className="text-muted-foreground">
            {currentCategory?.description || `Showing ${filteredProducts.length} sustainable products`}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24 space-y-6">
              <div>
                <h3 className="font-semibold mb-3">Categories</h3>
                <ul className="space-y-2">
                  <li>
                    <button
                      onClick={() => handleCategoryChange(null)}
                      className={cn(
                        'text-sm transition-colors',
                        !selectedCategory
                          ? 'text-primary font-medium'
                          : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      All Products
                    </button>
                  </li>
                  {categories.map((category) => (
                    <li key={category.id}>
                      <button
                        onClick={() => handleCategoryChange(category.slug)}
                        className={cn(
                          'text-sm transition-colors',
                          selectedCategory === category.slug
                            ? 'text-primary font-medium'
                            : 'text-muted-foreground hover:text-foreground'
                        )}
                      >
                        {category.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border-t pt-6">
                <h3 className="font-semibold mb-3">Price Range</h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      className="rounded border-input"
                      checked={priceRanges.includes('under-25')}
                      onChange={() => handlePriceRangeChange('under-25')}
                    />
                    <span>Under $25</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      className="rounded border-input"
                      checked={priceRanges.includes('25-50')}
                      onChange={() => handlePriceRangeChange('25-50')}
                    />
                    <span>$25 - $50</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      className="rounded border-input"
                      checked={priceRanges.includes('50-100')}
                      onChange={() => handlePriceRangeChange('50-100')}
                    />
                    <span>$50 - $100</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      className="rounded border-input"
                      checked={priceRanges.includes('over-100')}
                      onChange={() => handlePriceRangeChange('over-100')}
                    />
                    <span>Over $100</span>
                  </label>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="font-semibold mb-3">Availability</h3>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" className="rounded border-input" defaultChecked />
                  <span>In Stock</span>
                </label>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-6 border-b">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsFilterOpen(true)}
                  className="btn-outline btn-sm lg:hidden"
                >
                  <Filter className="h-4 w-4" />
                  Filters
                </button>
                {selectedCategory && (
                  <button
                    onClick={() => handleCategoryChange(null)}
                    className="badge-secondary flex items-center gap-1"
                  >
                    {currentCategory?.name}
                    <X className="h-3 w-3" />
                  </button>
                )}
                {priceRanges.map(range => (
                  <button
                    key={range}
                    onClick={() => handlePriceRangeChange(range)}
                    className="badge-secondary flex items-center gap-1"
                  >
                    {range === 'under-25' && 'Under $25'}
                    {range === '25-50' && '$25 - $50'}
                    {range === '50-100' && '$50 - $100'}
                    {range === 'over-100' && 'Over $100'}
                    <X className="h-3 w-3" />
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground hidden sm:inline">Sort by:</span>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="input h-9 pr-10 appearance-none cursor-pointer"
                  >
                    <option value="featured">Featured</option>
                    <option value="newest">Newest</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="rating">Top Rated</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Product Grid */}
            {loading ? (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="card animate-pulse">
                    <div className="aspect-square bg-muted rounded-lg mb-4"></div>
                    <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <SlidersHorizontal className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="font-medium text-lg mb-2">No products found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your filters or search terms.
                </p>
                <button
                  onClick={() => {
                    handleCategoryChange(null)
                    searchParams.delete('search')
                    setSearchParams(searchParams)
                    setPriceRanges([])
                  }}
                  className="btn-primary btn-sm"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Filter Drawer */}
        {isFilterOpen && (
          <>
            <div
              className="fixed inset-0 z-50 bg-foreground/50 backdrop-blur-sm lg:hidden"
              onClick={() => setIsFilterOpen(false)}
            />
            <div className="fixed left-0 top-0 z-50 h-full w-80 max-w-full bg-background shadow-2xl lg:hidden overflow-y-auto">
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="font-semibold">Filters</h2>
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="btn-ghost p-2"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-4 space-y-6">
                <div>
                  <h3 className="font-semibold mb-3">Categories</h3>
                  <ul className="space-y-2">
                    <li>
                      <button
                        onClick={() => {
                          handleCategoryChange(null)
                          setIsFilterOpen(false)
                        }}
                        className={cn(
                          'text-sm transition-colors',
                          !selectedCategory
                            ? 'text-primary font-medium'
                            : 'text-muted-foreground'
                        )}
                      >
                        All Products
                      </button>
                    </li>
                    {categories.map((category) => (
                      <li key={category.id}>
                        <button
                          onClick={() => {
                            handleCategoryChange(category.slug)
                            setIsFilterOpen(false)
                          }}
                          className={cn(
                            'text-sm transition-colors',
                            selectedCategory === category.slug
                              ? 'text-primary font-medium'
                              : 'text-muted-foreground'
                          )}
                        >
                          {category.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border-t pt-6">
                  <h3 className="font-semibold mb-3">Price Range</h3>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        className="rounded border-input"
                        checked={priceRanges.includes('under-25')}
                        onChange={() => handlePriceRangeChange('under-25')}
                      />
                      <span>Under $25</span>
                    </label>
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        className="rounded border-input"
                        checked={priceRanges.includes('25-50')}
                        onChange={() => handlePriceRangeChange('25-50')}
                      />
                      <span>$25 - $50</span>
                    </label>
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        className="rounded border-input"
                        checked={priceRanges.includes('50-100')}
                        onChange={() => handlePriceRangeChange('50-100')}
                      />
                      <span>$50 - $100</span>
                    </label>
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        className="rounded border-input"
                        checked={priceRanges.includes('over-100')}
                        onChange={() => handlePriceRangeChange('over-100')}
                      />
                      <span>Over $100</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  )
}
