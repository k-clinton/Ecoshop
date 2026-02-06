import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Leaf, Truck, RefreshCw, Shield } from 'lucide-react'
import { ProductCard } from '@/components/ProductCard'
import { productService } from '@/services/products'
import { categoryService } from '@/services/categories'
import { Product, Category } from '@/data/types'

export function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [products, cats] = await Promise.all([
          productService.getFeaturedProducts(4),
          categoryService.getCategories()
        ])
        setFeaturedProducts(products)
        setCategories(cats.slice(0, 4)) // Show first 4 categories
      } catch (error) {
        console.error('Failed to load home page data:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <main>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/50">
        <div className="container-wide py-16 md:py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-in">
              <span className="badge-primary mb-4">Sustainable Living</span>
              <h1 className="heading-display text-4xl md:text-5xl lg:text-6xl text-foreground mb-6">
                Shop with <span className="text-primary">Purpose</span>,<br />
                Live with <span className="text-primary">Intention</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8 max-w-lg text-balance">
                Discover thoughtfully curated eco-friendly products that make sustainable living beautiful and effortless.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/products" className="btn-primary btn-lg">
                  Shop Collection
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link to="/products" className="btn-outline btn-lg">
                  Best Sellers
                </Link>
              </div>
            </div>
            <div className="relative animate-in delay-200">
              <div className="aspect-square rounded-3xl overflow-hidden shadow-elevated">
                <img
                  src="/images/hero.jpg"
                  alt="Sustainable lifestyle products arranged beautifully"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-card rounded-2xl p-4 shadow-elevated hidden md:block">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center">
                    <Leaf className="h-6 w-6 text-success" />
                  </div>
                  <div>
                    <p className="font-semibold">100% Eco-Friendly</p>
                    <p className="text-sm text-muted-foreground">Certified sustainable</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="border-y bg-muted/30">
        <div className="container-wide py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Truck className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">Free Shipping</p>
                <p className="text-xs text-muted-foreground">Orders over $50</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <RefreshCw className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">Easy Returns</p>
                <p className="text-xs text-muted-foreground">30-day guarantee</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">Secure Payment</p>
                <p className="text-xs text-muted-foreground">256-bit encryption</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Leaf className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">Carbon Neutral</p>
                <p className="text-xs text-muted-foreground">Offset shipping</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="section">
        <div className="container-wide">
          <div className="text-center mb-12">
            <h2 className="heading-display text-3xl md:text-4xl text-foreground mb-4">
              Shop by Category
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explore our curated collections of sustainable products for every aspect of your life.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/products?category=${category.slug}`}
                className="group relative aspect-[4/5] overflow-hidden rounded-2xl"
              >
                <img
                  src={category.image}
                  alt={category.name}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="font-display text-xl font-semibold text-background mb-1">
                    {category.name}
                  </h3>
                  <p className="text-sm text-background/80">
                    {category.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="section bg-secondary/30">
        <div className="container-wide">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
            <div>
              <h2 className="heading-display text-3xl md:text-4xl text-foreground mb-2">
                Featured Products
              </h2>
              <p className="text-muted-foreground">
                Handpicked favorites from our community
              </p>
            </div>
            <Link to="/products" className="btn-outline btn-md">
              View All
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="section">
        <div className="container-wide">
          <div className="bg-primary rounded-3xl p-8 md:p-12 lg:p-16 text-center">
            <h2 className="heading-display text-3xl md:text-4xl text-primary-foreground mb-4">
              Join the Movement
            </h2>
            <p className="text-primary-foreground/80 max-w-xl mx-auto mb-8">
              Subscribe for exclusive offers, sustainability tips, and early access to new arrivals.
            </p>
            <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="input flex-1 bg-primary-foreground text-foreground"
              />
              <button type="submit" className="btn bg-foreground text-background hover:bg-foreground/90 btn-md">
                Subscribe
              </button>
            </form>
            <p className="text-xs text-primary-foreground/60 mt-4">
              By subscribing, you agree to receive marketing emails. Unsubscribe anytime.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
