import React, { createContext, useContext, useReducer, ReactNode, useState, useEffect } from 'react'
import { Cart, CartItem, Product, ProductVariant } from '@/data/types'
import { productService } from '@/services/products'

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

const initialState: CartState = {
  items: [],
  subtotal: 0,
  itemCount: 0,
  isOpen: false,
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
    
    default:
      return state
  }
}

interface CartContextType extends CartState {
  addItem: (product: Product, variant: ProductVariant, quantity?: number) => void
  removeItem: (variantId: string) => void
  updateQuantity: (variantId: string, quantity: number) => void
  clearCart: () => void
  toggleCart: () => void
  openCart: () => void
  closeCart: () => void
  getCartItemDetails: (item: CartItem) => { product: Product; variant: ProductVariant } | null
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState)

  const addItem = (product: Product, variant: ProductVariant, quantity = 1) => {
    dispatch({ type: 'ADD_ITEM', payload: { product, variant, quantity } })
  }

  const removeItem = (variantId: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { variantId } })
  }

  const updateQuantity = (variantId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { variantId, quantity } })
  }

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' })
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
          const products = await productService.getProducts()
          setProductsCache(products)
        } catch (error) {
          console.error('Failed to load products for cart:', error)
        }
      }
    }
    loadProducts()
  }, [state.items.length])

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
