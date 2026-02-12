
import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Star, Minus, Plus, Truck, Shield, RefreshCw, ChevronRight, Leaf, Heart } from 'lucide-react'
import { useCart } from '@/store/CartContext'
import { useAuth } from '@/store/AuthContext'
import { useToast } from '@/store/ToastContext'
import { useSettings } from '@/store/SettingsContext'
import { cn } from '@/lib/utils'
import { ProductCard } from '@/components/ProductCard'
import { Product, ProductVariant, Category } from '@/data/types'
import { getImageUrl } from '@/config/api'
import { productService } from '@/services/products'
import { categoryService } from '@/services/categories'
import { reviewService, type Review } from '@/services/reviews'
import { wishlistService } from '@/services/wishlist'


export function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const { addItem } = useCart()
  const { isAuthenticated } = useAuth()
  const { addToast } = useToast()
  const { formatPrice } = useSettings()

  const [product, setProduct] = useState<Product | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>()
  const [quantity, setQuantity] = useState(1)
  const [category, setCategory] = useState<Category | null>(null)
  const [activeImage, setActiveImage] = useState(0)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' })

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

        // Load reviews
        try {
          const productReviews = await reviewService.getReviews(prod.id)
          setReviews(productReviews)
        } catch (error) {
          console.warn('Failed to load reviews:', error)
        }

        // Check if in wishlist
        if (isAuthenticated) {
          try {
            const wishlist = await wishlistService.getWishlist()
            setIsWishlisted(wishlist.some(item => item.id === prod.id))
          } catch (error) {
            console.warn('Failed to check wishlist:', error)
          }
        }
      } catch (error) {
        console.error('Failed to load product:', error)
        setProduct(null)
      } finally {
        setLoading(false)
      }
    }

    loadProduct()
  }, [slug, isAuthenticated])

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

  const handleToggleWishlist = async () => {
    if (!isAuthenticated) {
      addToast('Please sign in to add items to your wishlist', 'info')
      return
    }

    if (!product) return

    try {
      if (isWishlisted) {
        await wishlistService.removeFromWishlist(product.id)
        setIsWishlisted(false)
        addToast('Removed from wishlist', 'success')
      } else {
        await wishlistService.addToWishlist(product.id)
        setIsWishlisted(true)
        addToast('Added to wishlist', 'success')
      }
    } catch (error) {
      addToast('Failed to update wishlist', 'error')
    }
  }

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAuthenticated) return
    if (!product) return

    setIsSubmittingReview(true)
    try {
      await reviewService.submitReview(product.id, reviewForm.rating, reviewForm.comment)
      addToast('Review submitted successfully!', 'success')
      setReviewForm({ rating: 5, comment: '' })
      // Refresh reviews
      const updatedReviews = await reviewService.getReviews(product.id)
      setReviews(updatedReviews)
    } catch (error: any) {
      addToast(error.message || 'Failed to submit review', 'error')
    } finally {
      setIsSubmittingReview(false)
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
            {/* Product Image Gallery */}
            <div className="space-y-4">
              <div className="aspect-square rounded-2xl overflow-hidden bg-muted group relative">
                <img
                  src={getImageUrl(product.images[activeImage] || product.images[0])}
                  alt={product.name}
                  className="h-full w-full object-cover transition-all duration-500"
                />
              </div>

              {product.images.length > 1 && (
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
                  {product.images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveImage(index)}
                      className={cn(
                        "relative h-20 w-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all",
                        activeImage === index ? "border-primary" : "border-transparent hover:border-primary/50"
                      )}
                    >
                      <img
                        src={getImageUrl(img)}
                        alt={`${product.name} ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
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

                <button
                  onClick={handleToggleWishlist}
                  className={cn(
                    "ml-auto p-2 rounded-full border transition-all hover:bg-muted",
                    isWishlisted ? "text-red-500 border-red-100 bg-red-50" : "text-muted-foreground border-border"
                  )}
                  aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                >
                  <Heart className={cn("h-5 w-5", isWishlisted && "fill-current")} />
                </button>
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

      {/* Reviews Section */}
      <section className="section bg-muted/30">
        <div className="container-wide">
          <div className="grid lg:grid-cols-3 gap-12">
            <div>
              <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
              <div className="flex items-center gap-4 mb-8">
                <div className="text-5xl font-bold">{product.rating}</div>
                <div>
                  <div className="flex items-center gap-0.5 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          'h-4 w-4',
                          i < Math.floor(product.rating)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-muted-foreground/30'
                        )}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">Based on {product.reviewCount || 0} reviews</p>
                </div>
              </div>

              {/* Review Form */}
              {isAuthenticated ? (
                <div className="bg-card rounded-xl border p-6">
                  <h3 className="font-semibold mb-4">Write a Review</h3>
                  <form onSubmit={handleSubmitReview} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Rating</label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewForm(prev => ({ ...prev, rating: star }))}
                            className="p-1"
                          >
                            <Star className={cn(
                              "h-6 w-6 transition-all",
                              star <= reviewForm.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"
                            )} />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Comment</label>
                      <textarea
                        value={reviewForm.comment}
                        onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                        className="input min-h-[100px] resize-none"
                        placeholder="Share your experience..."
                        required
                      ></textarea>
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmittingReview}
                      className="btn-primary w-full"
                    >
                      {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                    </button>
                  </form>
                </div>
              ) : (
                <div className="bg-card rounded-xl border p-6 text-center">
                  <p className="text-muted-foreground mb-4">Please sign in to leave a review.</p>
                  <Link to="/signin" className="btn-outline w-full">Sign In</Link>
                </div>
              )}
            </div>

            <div className="lg:col-span-2">
              <div className="space-y-8">
                {reviews.length > 0 ? (
                  reviews.map((review) => (
                    <div key={review.id} className="pb-8 border-b last:border-0 last:pb-0">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="font-semibold">{review.userName}</p>
                          <div className="flex items-center gap-0.5 mt-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={cn(
                                  'h-3 w-3',
                                  i < review.rating
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'text-muted-foreground/30'
                                )}
                              />
                            ))}
                          </div>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-muted-foreground leading-relaxed italic">"{review.comment}"</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 bg-card rounded-xl border">
                    <p className="text-muted-foreground italic">No reviews yet. Be the first to review this product!</p>
                  </div>
                )}
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
