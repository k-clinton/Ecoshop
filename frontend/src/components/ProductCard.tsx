import { Link } from 'react-router-dom'
import { Star } from 'lucide-react'
import { useSettings } from '@/store/SettingsContext'
import { cn } from '@/lib/utils'
import { Product } from '@/data/types'
import { getImageUrl } from '@/config/api'

interface ProductCardProps {
  product: Product
  className?: string
}

export function ProductCard({ product, className }: ProductCardProps) {
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
            src={getImageUrl(product.images[0])}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {hasDiscount && (
            <span className="absolute top-2 left-2 badge-accent text-xs px-2 py-0.5">
              -{discountPercent}%
            </span>
          )}
          {product.stock < 10 && product.stock > 0 && (
            <span className="absolute top-2 right-2 badge bg-foreground/80 text-background text-xs px-2 py-0.5">
              Low stock
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-3 sm:p-4">
          <div className="flex items-center gap-1 mb-1 sm:mb-2">
            <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-amber-400 text-amber-400" />
            <span className="text-xs sm:text-sm font-medium">{product.rating}</span>
            <span className="text-xs sm:text-sm text-muted-foreground">({product.reviewCount})</span>
          </div>

          <h3 className="font-medium text-sm sm:text-base text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-1">
            {product.name}
          </h3>

          <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-1 sm:line-clamp-2 hidden sm:block">
            {product.description}
          </p>

          <div className="mt-2 sm:mt-3 flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <span className="font-semibold text-sm sm:text-base text-foreground">
              {formatPrice(product.price)}
            </span>
            {hasDiscount && (
              <span className="text-xs sm:text-sm text-muted-foreground line-through">
                {formatPrice(product.compareAtPrice!)}
              </span>
            )}
          </div>

          {product.variants.length > 1 && (
            <p className="text-xs text-muted-foreground mt-1 sm:mt-2 hidden sm:block">
              {product.variants.length} variants available
            </p>
          )}
        </div>
      </div>
    </Link>
  )
}
