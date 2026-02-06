
import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Star, Minus, Plus, Truck, Shield, RefreshCw, ChevronRight, Leaf } from 'lucide-react'
import { useCart } from '@/store/CartContext'
import { useToast } from '@/store/ToastContext'
import { useSettings } from '@/store/SettingsContext'
import { cn } from '@/lib/utils'
import { ProductCard } from '@/components/ProductCard'
import { Product, ProductVariant, Category } from '@/data/types'
import { productService } from '@/services/products'
import { categoryService } from '@/services/categories'


export function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const { addItem } = useCart()
  const { addToast } = useToast()
  const { formatPrice } = useSettings()

  const [product, setProduct] = useState<Product | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>()
  const [quantity, setQuantity] = useState(1)
  const [category, setCategory] = useState<Category | null>(null)

  useEffect(() => {
    const loadProduct = async () => {
      if (!slug) return

      setLoading(true)
      try {
        const prod = await productService.getProductBySlug(slug)
        setProduct(prod)
        setSelectedVariant(prod.variants[0])

        const related = await productService.getProducts({
          category: prod.category,
          limit: 4
        })
        setRelatedProducts(related.filter(p => p.id !== prod.id).slice(0, 4))

        // Load category details
        try {
          // Assuming product.category holds the slug or matching identifier
          const categories = await categoryService.getCategories()
          const foundCategory = categories.find(c => c.slug === prod.category || c.id === prod.category || c.name === prod.category)
          if (foundCategory) {
            setCategory(foundCategory)
          } else {
            // Fallback if direct fetch is needed or strictly one way
            try {
              const cat = await categoryService.getCategoryBySlug(prod.category)
              setCategory(cat)
            } catch (e) {
              console.warn('Could not load category by slug', e)
            }
          }
        } catch (error) {
          console.warn('Failed to load category details:', error)
        }
      } catch (error) {
        console.error('Failed to load product:', error)
        setProduct(null)
      } finally {
        setLoading(false)
      }
    }

    loadProduct()
  }, [slug])

  if (loading) {
    return (
      <main className="section">
        <div className="container-wide">
          <div className="animate-pulse grid lg:grid-cols-2 gap-12">
            <div className="aspect-square bg-muted rounded-2xl"></div>
            <div className="space-y-4">
              <div className="h-8 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/4"></div>
              <div className="h-20 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (!product) {
    return (
      <main className="section">
        <div className="container-wide text-center py-16">
          <h1 className="text-2xl font-semibold mb-4">Product Not Found</h1>
          <p className="text-muted-foreground mb-6">The product you're looking for doesn't exist.</p>
          <Link to="/products" className="btn-primary btn-md">
            Browse Products
          </Link>
        </div>
      </main>
    )
  }


  const handleAddToCart = () => {
    if (selectedVariant && product) {
      addItem(product as any, selectedVariant, quantity)
      addToast(`${product.name} added to cart!`, 'success')
    }
  }

  const hasDiscount = product.compareAtPrice != null && product.compareAtPrice > product.price

  return (
    <main>
      {/* Breadcrumbs */}
      <div className="border-b">
        <div className="container-wide py-4">
          <nav className="flex items-center gap-2 text-sm">
            <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
              Home
            </Link>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <Link to="/products" className="text-muted-foreground hover:text-foreground transition-colors">
              Products
            </Link>
            {category && (
              <>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                <Link
                  to={`/products?category=${category.slug}`}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {category.name}
                </Link>
              </>
            )}
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <span className="text-foreground font-medium truncate">{product.name}</span>
          </nav>
        </div>
      </div>

      <section className="section">
        <div className="container-wide">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Product Image */}
            <div className="space-y-4">
              <div className="aspect-square rounded-2xl overflow-hidden bg-muted">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>

            {/* Product Info */}
            <div className="lg:py-4">
              {hasDiscount && (
                <span className="badge-accent mb-4 inline-block">
                  Sale -{Math.round((1 - product.price / product.compareAtPrice!) * 100)}%
                </span>
              )}

              <h1 className="heading-display text-3xl md:text-4xl text-foreground mb-4">
                {product.name}
              </h1>

              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        'h-5 w-5',
                        i < Math.floor(product.rating)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-muted-foreground/30'
                      )}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium">{product.rating}</span>
                <span className="text-sm text-muted-foreground">({product.reviewCount} reviews)</span>
              </div>

              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-3xl font-semibold text-foreground">
                  {formatPrice(selectedVariant?.price || product.price)}
                </span>
                {hasDiscount && (
                  <span className="text-xl text-muted-foreground line-through">
                    {formatPrice(product.compareAtPrice!)}
                  </span>
                )}
              </div>

              <p className="text-muted-foreground mb-8 leading-relaxed">
                {product.description}
              </p>

              {/* Variant Selection */}
              {product.variants.length > 1 && (
                <div className="mb-6">
                  <h3 className="font-medium mb-3">
                    Options: <span className="text-muted-foreground font-normal">{selectedVariant?.name}</span>
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map((variant) => (
                      <button
                        key={variant.id}
                        onClick={() => setSelectedVariant(variant)}
                        disabled={!variant.available}
                        className={cn(
                          'px-4 py-2 rounded-lg border text-sm font-medium transition-all',
                          selectedVariant?.id === variant.id
                            ? 'border-primary bg-primary/5 text-primary'
                            : 'border-border hover:border-primary/50',
                          !variant.available && 'opacity-50 cursor-not-allowed line-through'
                        )}
                      >
                        {variant.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="mb-8">
                <h3 className="font-medium mb-3">Quantity</h3>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-3 hover:bg-muted transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="px-6 font-medium">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-3 hover:bg-muted transition-colors"
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  {selectedVariant && selectedVariant.stock < 10 && (
                    <span className="text-sm text-accent">Only {selectedVariant.stock} left!</span>
                  )}
                </div>
              </div>

              {/* Add to Cart */}
              <button
                onClick={handleAddToCart}
                disabled={!selectedVariant?.available}
                className="btn-primary btn-lg w-full mb-6"
              >
                Add to Cart - {formatPrice((selectedVariant?.price || product.price) * quantity)}
              </button>

              {/* Trust Badges */}
              <div className="grid grid-cols-2 gap-4 pt-6 border-t">
                <div className="flex items-center gap-3">
                  <Truck className="h-5 w-5 text-primary" />
                  <span className="text-sm">Free shipping over $50</span>
                </div>
                <div className="flex items-center gap-3">
                  <RefreshCw className="h-5 w-5 text-primary" />
                  <span className="text-sm">30-day returns</span>
                </div>
                <div className="flex items-center gap-3">
                  <Leaf className="h-5 w-5 text-primary" />
                  <span className="text-sm">Eco-friendly materials</span>
                </div>
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-primary" />
                  <span className="text-sm">Secure checkout</span>
                </div>
              </div>

              {/* Tags */}
              <div className="mt-6 pt-6 border-t">
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag) => (
                    <span key={tag} className="badge-secondary">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="section bg-secondary/30">
          <div className="container-wide">
            <h2 className="heading-display text-2xl md:text-3xl text-foreground mb-8">
              You May Also Like
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  )
}
