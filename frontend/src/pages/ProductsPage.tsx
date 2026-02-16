import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Filter, SlidersHorizontal, X, ChevronDown } from 'lucide-react'
import { ProductCard } from '@/components/ProductCard'
import { FilterSidebar } from '@/components/FilterSidebar'
import { productService } from '@/services/products'
import { categoryService } from '@/services/categories'
import { Product, Category } from '@/data/types'
import { useSettings } from '@/store/SettingsContext'

type SortOption = 'featured' | 'newest' | 'price-asc' | 'price-desc' | 'rating'

export function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [sortBy, setSortBy] = useState<SortOption>('featured')
  const [inStockOnly, setInStockOnly] = useState(true)
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [priceRanges, setPriceRanges] = useState<string[]>([])
  const { settings } = useSettings()

  const selectedCategory = searchParams.get('category')
  const searchQuery = searchParams.get('search') || ''

  // Get currency symbol for display
  const getCurrencySymbol = () => {
    const currency = settings?.currency || 'USD'
    if (currency === 'KES') return 'KSh.'
    const symbols: Record<string, string> = {
      'USD': '$',
      'EUR': '€',
      'GBP': '£'
    }
    return symbols[currency] || '$'
  }

  const currencySymbol = getCurrencySymbol()
  const exchangeRate = settings?.exchange_rate || 1.0

  const thresholds = useMemo(() => {
    const base = [25, 50, 100]
    return base.map(b => Math.round(b * exchangeRate))
  }, [exchangeRate])

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

        // Add availability filter
        if (inStockOnly) {
          filters.inStock = true
        }

        // Add sorting
        filters.sort = sortBy

        // Add price filters
        if (priceRanges.length > 0) {
          let min = Infinity
          let max = -Infinity

          priceRanges.forEach(range => {
            switch (range) {
              case 'under-25':
                min = Math.min(min, 0)
                max = Math.max(max, thresholds[0])
                break
              case '25-50':
                min = Math.min(min, thresholds[0])
                max = Math.max(max, thresholds[1])
                break
              case '50-100':
                min = Math.min(min, thresholds[1])
                max = Math.max(max, thresholds[2])
                break
              case 'over-100':
                min = Math.min(min, thresholds[2])
                max = Math.max(max, 999999) // Large number for "infinity"
                break
            }
          })

          // Convert back to base currency (USD) for the API
          if (min !== Infinity) filters.minPrice = min / exchangeRate
          if (max !== -Infinity && max !== 999999) filters.maxPrice = max / exchangeRate
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
  }, [selectedCategory, searchQuery, categories.length, sortBy, priceRanges, inStockOnly, exchangeRate, thresholds])

  // Use products directly as they are now filtered and sorted by the backend
  const filteredProducts = products

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

  // Calculate active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (selectedCategory) count++
    count += priceRanges.length
    if (inStockOnly) count++
    return count
  }, [selectedCategory, priceRanges.length, inStockOnly])

  return (
    <main className="section py-8 md:py-12">
      <div className="mx-auto max-w-[1600px]">
        {/* Header */}
        <div className="mb-6 md:mb-8 px-4 sm:px-6 lg:pl-8 lg:pr-8">
          <h1 className="heading-display text-3xl md:text-4xl text-foreground mb-2">
            {currentCategory ? currentCategory.name : 'All Products'}
          </h1>
          <p className="text-muted-foreground">
            {currentCategory?.description || `Showing ${filteredProducts.length} sustainable products`}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row lg:gap-8">
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden lg:block w-64 flex-shrink-0 pl-8">
            <div className="sticky top-24">
              <FilterSidebar
                categories={categories}
                selectedCategory={selectedCategory}
                onCategoryChange={handleCategoryChange}
                priceRanges={priceRanges}
                onPriceRangeChange={handlePriceRangeChange}
                currencySymbol={currencySymbol}
                thresholds={thresholds}
                inStockOnly={inStockOnly}
                onInStockChange={setInStockOnly}
                onClearFilters={() => {
                  handleCategoryChange(null)
                  setPriceRanges([])
                  setInStockOnly(false)
                }}
              />
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0 px-4 sm:px-6 lg:pr-8 lg:pl-0">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-6 border-b">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsFilterOpen(true)}
                  className="btn-outline btn-sm lg:hidden relative"
                >
                  <Filter className="h-4 w-4" />
                  Filters
                  {activeFiltersCount > 0 && (
                    <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium">
                      {activeFiltersCount}
                    </span>
                  )}
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
                    {range === 'under-25' && `Under ${currencySymbol}${thresholds[0].toLocaleString()}`}
                    {range === '25-50' && `${currencySymbol}${thresholds[0].toLocaleString()} - ${currencySymbol}${thresholds[1].toLocaleString()}`}
                    {range === '50-100' && `${currencySymbol}${thresholds[1].toLocaleString()} - ${currencySymbol}${thresholds[2].toLocaleString()}`}
                    {range === 'over-100' && `Over ${currencySymbol}${thresholds[2].toLocaleString()}`}
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
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className="card animate-pulse p-3 sm:p-4">
                    <div className="aspect-square bg-muted rounded-lg mb-2 sm:mb-4"></div>
                    <div className="h-3 sm:h-4 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-3 sm:h-4 bg-muted rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
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
            <div className="fixed left-0 top-0 z-50 h-full w-full max-w-sm bg-background shadow-2xl lg:hidden overflow-y-auto">
              <div className="flex items-center justify-between p-4 sm:p-6 border-b sticky top-0 bg-background z-10">
                <h2 className="font-semibold text-lg">Filters</h2>
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="btn-ghost p-2 -mr-2"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-4 sm:p-6 pb-20">
                <FilterSidebar
                  categories={categories}
                  selectedCategory={selectedCategory}
                  onCategoryChange={(slug) => {
                    handleCategoryChange(slug)
                    setIsFilterOpen(false)
                  }}
                  priceRanges={priceRanges}
                  onPriceRangeChange={handlePriceRangeChange}
                  currencySymbol={currencySymbol}
                  thresholds={thresholds}
                  inStockOnly={inStockOnly}
                  onInStockChange={setInStockOnly}
                  onClearFilters={() => {
                    handleCategoryChange(null)
                    setPriceRanges([])
                    setInStockOnly(false)
                    setIsFilterOpen(false)
                  }}
                />
              </div>
              
              {/* Apply Filters Button - Mobile Only */}
              <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t shadow-lg lg:hidden">
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="btn-primary btn-md w-full"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  )
}
