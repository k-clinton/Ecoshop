import { createContext, useContext, useReducer, ReactNode, useState, useEffect } from 'react'
import { Cart, CartItem, Product, ProductVariant } from '@/data/types'
import { productService } from '@/services/products'
import { useAuth } from './AuthContext'
import { cartService } from '@/services/cart'
import { analytics } from '@/lib/analytics'

interface CartState extends Cart {
  isOpen: boolean
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: { product: Product; variant: ProductVariant; quantity: number } }
  | { type: 'REMOVE_ITEM'; payload: { variantId: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { variantId: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'TOGGLE_CART' }
  | { type: 'OPEN_CART' }
  | { type: 'CLOSE_CART' }
  | { type: 'SET_CART'; payload: CartItem[] }

const STORAGE_KEY = 'ecoshop_cart'

const initialState: CartState = {
  items: [],
  subtotal: 0,
  itemCount: 0,
  isOpen: false,
}

// Helper to load initial state from localStorage
const getSavedCart = (): CartState => {
  if (typeof window === 'undefined') return initialState
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      return { ...initialState, ...parsed, isOpen: false }
    }
  } catch (error) {
    console.error('Failed to load cart from local storage:', error)
  }
  return initialState
}

function calculateTotals(items: CartItem[]): { subtotal: number; itemCount: number } {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)
  return { subtotal, itemCount }
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { product, variant, quantity } = action.payload
      const existingIndex = state.items.findIndex(item => item.variantId === variant.id)

      let newItems: CartItem[]
      if (existingIndex >= 0) {
        newItems = state.items.map((item, index) =>
          index === existingIndex
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      } else {
        newItems = [...state.items, {
          productId: product.id,
          variantId: variant.id,
          quantity,
          price: variant.price,
        }]
      }

      const totals = calculateTotals(newItems)
      return { ...state, items: newItems, ...totals, isOpen: true }
    }

    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(item => item.variantId !== action.payload.variantId)
      const totals = calculateTotals(newItems)
      return { ...state, items: newItems, ...totals }
    }

    case 'UPDATE_QUANTITY': {
      const { variantId, quantity } = action.payload
      if (quantity <= 0) {
        const newItems = state.items.filter(item => item.variantId !== variantId)
        const totals = calculateTotals(newItems)
        return { ...state, items: newItems, ...totals }
      }

      const newItems = state.items.map(item =>
        item.variantId === variantId ? { ...item, quantity } : item
      )
      const totals = calculateTotals(newItems)
      return { ...state, items: newItems, ...totals }
    }

    case 'CLEAR_CART':
      return { ...initialState }

    case 'TOGGLE_CART':
      return { ...state, isOpen: !state.isOpen }

    case 'OPEN_CART':
      return { ...state, isOpen: true }

    case 'CLOSE_CART':
      return { ...state, isOpen: false }

    case 'SET_CART': {
      const totals = calculateTotals(action.payload)
      return { ...state, items: action.payload, ...totals }
    }

    default:
      return state
  }
}

interface CartContextType extends CartState {
  addItem: (product: Product, variant: ProductVariant, quantity?: number) => void
  removeItem: (variantId: string) => void
  updateQuantity: (variantId: string, quantity: number) => void
  clearCart: () => Promise<void>
  toggleCart: () => void
  openCart: () => void
  closeCart: () => void
  getCartItemDetails: (item: CartItem) => { product: Product; variant: ProductVariant } | null
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()
  const [state, dispatch] = useReducer(cartReducer, getSavedCart())

  // Save to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      items: state.items,
      subtotal: state.subtotal,
      itemCount: state.itemCount,
    }))
  }, [state.items, state.subtotal, state.itemCount])

  const addItem = (product: Product, variant: ProductVariant, quantity = 1) => {
    dispatch({ type: 'ADD_ITEM', payload: { product, variant, quantity } })
    analytics.track('add_to_cart', {
      productId: product.id,
      productName: product.name,
      variantId: variant.id,
      price: variant.price,
      quantity
    })
  }

  const removeItem = (variantId: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { variantId } })
  }

  const updateQuantity = (variantId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { variantId, quantity } })
  }

  const clearCart = async () => {
    dispatch({ type: 'CLEAR_CART' })
    // Immediately sync to backend if authenticated
    if (isAuthenticated) {
      try {
        await cartService.syncCart([])
      } catch (error) {
        console.error('Failed to clear cart on backend:', error)
      }
    }
  }

  const toggleCart = () => {
    dispatch({ type: 'TOGGLE_CART' })
  }

  const openCart = () => {
    dispatch({ type: 'OPEN_CART' })
  }

  const closeCart = () => {
    dispatch({ type: 'CLOSE_CART' })
  }

  const [productsCache, setProductsCache] = useState<Product[]>([])

  // Load products when cart items change
  useEffect(() => {
    const loadProducts = async () => {
      if (state.items.length > 0) {
        try {
          const ids = Array.from(new Set(state.items.map(item => item.productId))).join(',')
          const products = await productService.getProducts({ ids })
          setProductsCache(prev => {
            // Merge with existing cache to avoid losing details if items were removed then re-added
            const newCache = [...prev]
            products.forEach(p => {
              if (!newCache.find(cp => cp.id === p.id)) {
                newCache.push(p)
              }
            })
            return newCache
          })
        } catch (error) {
          console.error('Failed to load products for cart:', error)
        }
      }
    }
    loadProducts()
  }, [state.items])

  // Load cart from backend when user logs in
  useEffect(() => {
    const loadRemoteCart = async () => {
      if (isAuthenticated) {
        try {
          const remoteItems = await cartService.getCart()
          // Only set if remote has items (or merge logic could be here)
          if (remoteItems.length > 0) {
            dispatch({ type: 'SET_CART', payload: remoteItems })
          }
        } catch (error) {
          console.error('Failed to load remote cart:', error)
        }
      }
    }
    loadRemoteCart()
  }, [isAuthenticated])

  // Sync cart to backend on change
  useEffect(() => {
    const syncRemoteCart = async () => {
      if (isAuthenticated && state.items.length >= 0) {
        try {
          await cartService.syncCart(state.items)
        } catch (error) {
          console.error('Failed to sync cart:', error)
        }
      }
    }

    // We could debounce this if needed for performance
    const timer = setTimeout(() => {
      syncRemoteCart()
    }, 1000)

    return () => clearTimeout(timer)
  }, [state.items, isAuthenticated])

  const getCartItemDetails = (item: CartItem) => {
    const product = productsCache.find(p => p.id === item.productId)
    if (!product) return null
    const variant = product.variants.find(v => v.id === item.variantId)
    if (!variant) return null
    return { product, variant }
  }

  return (
    <CartContext.Provider value={{
      ...state,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      toggleCart,
      openCart,
      closeCart,
      getCartItemDetails,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
