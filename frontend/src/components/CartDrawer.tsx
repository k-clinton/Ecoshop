
import { useEffect } from 'react'
import { X, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCart } from '@/store/CartContext'
import { useSettings } from '@/store/SettingsContext'
import { cn } from '@/lib/utils'
import { getImageUrl } from '@/config/api'

export function CartDrawer() {
  const {
    items,
    subtotal,
    itemCount,
    isOpen,
    closeCart,
    removeItem,
    updateQuantity,
    getCartItemDetails
  } = useCart()
  const { formatPrice } = useSettings()

  // Close cart on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeCart()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [isOpen, closeCart])

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-50 bg-foreground/50 backdrop-blur-sm transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={closeCart}
      />

      {/* Drawer */}
      <div
        className={cn(
          'fixed right-0 top-0 z-50 h-full w-full max-w-md bg-background shadow-2xl transition-transform duration-300 ease-out',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b px-6 py-4">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              <h2 className="font-semibold text-lg">Your Cart</h2>
              <span className="badge-secondary">{itemCount} items</span>
            </div>
            <button
              onClick={closeCart}
              className="btn-ghost p-2 -mr-2"
              aria-label="Close cart"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-6">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <ShoppingBag className="h-16 w-16 text-muted-foreground/30 mb-4" />
                <h3 className="font-medium text-lg mb-2">Your cart is empty</h3>
                <p className="text-muted-foreground mb-6">
                  Discover our sustainable products and start shopping.
                </p>
                <Link
                  to="/products"
                  onClick={closeCart}
                  className="btn-primary btn-md"
                >
                  Browse Products
                </Link>
              </div>
            ) : (
              <ul className="space-y-4">
                {items.map((item) => {
                  const details = getCartItemDetails(item)
                  if (!details) return null
                  const { product, variant } = details

                  return (
                    <li key={item.variantId} className="flex gap-4 pb-4 border-b last:border-0">
                      <Link
                        to={`/ products / ${product.slug} `}
                        onClick={closeCart}
                        className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-muted"
                      >
                        <img
                          src={getImageUrl(product.images[0])}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      </Link>

                      <div className="flex-1 min-w-0">
                        <Link
                          to={`/ products / ${product.slug} `}
                          onClick={closeCart}
                          className="font-medium text-foreground hover:text-primary transition-colors line-clamp-1"
                        >
                          {product.name}
                        </Link>
                        <p className="text-sm text-muted-foreground">{variant.name}</p>
                        <p className="font-medium mt-1">{formatPrice(item.price)}</p>

                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center border rounded-lg">
                            <button
                              onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                              className="p-1.5 hover:bg-muted transition-colors"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="px-3 text-sm font-medium">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                              className="p-1.5 hover:bg-muted transition-colors"
                              aria-label="Increase quantity"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                          <button
                            onClick={() => removeItem(item.variantId)}
                            className="text-sm text-muted-foreground hover:text-destructive transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-semibold text-lg">{formatPrice(subtotal)}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Shipping and taxes calculated at checkout.
              </p>
              <Link
                to="/checkout"
                onClick={closeCart}
                className="btn-primary btn-lg w-full"
              >
                Checkout
                <ArrowRight className="h-5 w-5" />
              </Link>
              <button
                onClick={closeCart}
                className="btn-ghost btn-md w-full"
              >
                Continue Shopping
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
