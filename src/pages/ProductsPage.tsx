import React, { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Filter, SlidersHorizontal, X, ChevronDown } from 'lucide-react'
import { ProductCard } from '@/components/ProductCard'
import { products, categories } from '@/data/mockData'
import { cn } from '@/lib/utils'

type SortOption = 'featured' | 'newest' | 'price-asc' | 'price-desc' | 'rating'

export function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [sortBy, setSortBy] = useState<SortOption>('featured')

  const selectedCategory = searchParams.get('category')
  const searchQuery = searchParams.get('search') || ''

  const filteredProducts = useMemo(() => {
    let result = [...products]

    // Filter by category
    if (selectedCategory) {
      const category = categories.find(c => c.slug === selectedCategory)
      if (category) {
        result = result.filter(p => p.category === category.id)
      }
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.tags.some(tag => tag.toLowerCase().includes(query))
      )
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
  }, [selectedCategory, searchQuery, sortBy])

  const handleCategoryChange = (categorySlug: string | null) => {
    if (categorySlug) {
      searchParams.set('category', categorySlug)
    } else {
      searchParams.delete('category')
    }
    setSearchParams(searchParams)
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
                    <input type="checkbox" className="rounded border-input" />
                    <span>Under $25</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" className="rounded border-input" />
                    <span>$25 - $50</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" className="rounded border-input" />
                    <span>$50 - $100</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" className="rounded border-input" />
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
            {filteredProducts.length > 0 ? (
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
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  )
}
