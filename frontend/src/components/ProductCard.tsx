import React from 'react'
import { Link } from 'react-router-dom'
import { ShoppingCart, Star } from 'lucide-react'
import { useCart } from '@/store/CartContext'
import { useToast } from '@/store/ToastContext'
import { useSettings } from '@/store/SettingsContext'
import { cn } from '@/lib/utils'

interface ProductCardProps {
  product: {
    id: string
    name: string
    slug: string
    description: string
    price: number
    compareAtPrice?: number
    image: string
    category: string
    rating: number
    reviewCount: number
    stock: number
    images: string[]
    variants: any[]
  }
  className?: string
}

export function ProductCard({ product, className }: ProductCardProps) {
  const { addItem } = useCart()
  const { addToast } = useToast()
  const { formatPrice } = useSettings()

  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price
  const discountPercent = hasDiscount
    ? Math.round((1 - product.price / product.compareAtPrice!) * 100)
    : 0

  return (
    <Link
      to={`/products/${product.slug}`}
      className={cn('group block', className)}
    >
      <div className="card-hover overflow-hidden">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-muted">
          <img
            src={product.images[0]}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {hasDiscount && (
            <span className="absolute top-3 left-3 badge-accent">
              -{discountPercent}%
            </span>
          )}
          {product.stock < 10 && product.stock > 0 && (
            <span className="absolute top-3 right-3 badge bg-foreground/80 text-background">
              Low stock
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-center gap-1 mb-2">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            <span className="text-sm font-medium">{product.rating}</span>
            <span className="text-sm text-muted-foreground">({product.reviewCount})</span>
          </div>

          <h3 className="font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1">
            {product.name}
          </h3>

          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {product.description}
          </p>

          <div className="mt-3 flex items-center gap-2">
            <span className="font-semibold text-foreground">
              {formatPrice(product.price)}
            </span>
            {hasDiscount && (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(product.compareAtPrice!)}
              </span>
            )}
          </div>

          {product.variants.length > 1 && (
            <p className="text-xs text-muted-foreground mt-2">
              {product.variants.length} variants available
            </p>
          )}
        </div>
      </div>
    </Link>
  )
}
