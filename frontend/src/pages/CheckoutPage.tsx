
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Truck, ChevronRight, Lock, CheckCircle } from 'lucide-react'
import { useCart } from '@/store/CartContext'
import { useToast } from '@/store/ToastContext'
import { useSettings } from '@/store/SettingsContext'
import { cn } from '@/lib/utils'
import { orderService } from '@/services/orders'

type CheckoutStep = 'information' | 'shipping' | 'payment' | 'confirmation'

export function CheckoutPage() {
  const { items, subtotal, clearCart, getCartItemDetails } = useCart()
  const { addToast } = useToast()
  const { formatPrice } = useSettings()
  const [step, setStep] = useState<CheckoutStep>('information')
  const [isProcessing, setIsProcessing] = useState(false)

  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: 'USA',
    shippingMethod: 'standard',
    cardNumber: '',
    expiry: '',
    cvc: '',
  })

  const shipping = formData.shippingMethod === 'express' ? 12.99 : subtotal >= 50 ? 0 : 5.99
  const tax = subtotal * 0.08
  const total = subtotal + shipping + tax

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (step === 'information') {
      setStep('shipping')
    } else if (step === 'shipping') {
      setStep('payment')
    } else if (step === 'payment') {
      setIsProcessing(true)
      try {
        // Create order via API
        await orderService.createOrder({
          items,
          subtotal,
          shipping,
          tax,
          total,
          shippingAddress: {
            name: `${formData.firstName} ${formData.lastName} `,
            street: formData.address,
            city: formData.city,
            state: formData.state,
            zip: formData.zip,
            country: formData.country
          }
        })

        setStep('confirmation')
        clearCart()
        addToast('Order placed successfully!', 'success')
      } catch (error: any) {
        addToast(error.message || 'Failed to place order', 'error')
      } finally {
        setIsProcessing(false)
      }
    }
  }

  if (items.length === 0 && step !== 'confirmation') {
    return (
      <main className="section">
        <div className="container-wide text-center py-16">
          <h1 className="text-2xl font-semibold mb-4">Your cart is empty</h1>
          <p className="text-muted-foreground mb-6">Add some items to your cart before checkout.</p>
          <Link to="/products" className="btn-primary btn-md">
            Browse Products
          </Link>
        </div>
      </main>
    )
  }

  if (step === 'confirmation') {
    return (
      <main className="section">
        <div className="container-wide max-w-2xl mx-auto text-center">
          <div className="bg-success/10 rounded-full h-20 w-20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-success" />
          </div>
          <h1 className="heading-display text-3xl text-foreground mb-4">
            Thank you for your order!
          </h1>
          <p className="text-muted-foreground mb-2">
            Order confirmation has been sent to <strong>{formData.email}</strong>
          </p>
          <p className="text-muted-foreground mb-8">
            Order #ECO-{Math.random().toString(36).substring(2, 8).toUpperCase()}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/products" className="btn-primary btn-md">
              Continue Shopping
            </Link>
            <Link to="/" className="btn-outline btn-md">
              Back to Home
            </Link>
          </div>
        </div>
      </main>
    )
  }

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
            <span className="text-foreground font-medium">Checkout</span>
          </nav>
        </div>
      </div>

      <section className="section">
        <div className="container-wide">
          <div className="grid lg:grid-cols-[1fr,400px] gap-12">
            {/* Form */}
            <div>
              {/* Steps Indicator */}
              <div className="flex items-center gap-4 mb-8">
                {(['information', 'shipping', 'payment'] as const).map((s, i) => (
                  <React.Fragment key={s}>
                    <div
                      className={cn(
                        'flex items-center gap-2',
                        step === s ? 'text-primary' :
                          (['information', 'shipping', 'payment'].indexOf(step) > i) ? 'text-success' : 'text-muted-foreground'
                      )}
                    >
                      <div
                        className={cn(
                          'h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium',
                          step === s ? 'bg-primary text-primary-foreground' :
                            (['information', 'shipping', 'payment'].indexOf(step) > i) ? 'bg-success text-success-foreground' : 'bg-muted'
                        )}
                      >
                        {(['information', 'shipping', 'payment'].indexOf(step) > i) ? '✓' : i + 1}
                      </div>
                      <span className="hidden sm:inline text-sm font-medium capitalize">{s}</span>
                    </div>
                    {i < 2 && <div className="flex-1 h-px bg-border" />}
                  </React.Fragment>
                ))}
              </div>

              <form onSubmit={handleSubmit}>
                {/* Information Step */}
                {step === 'information' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
                    <div>
                      <label className="block text-sm font-medium mb-2">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="input"
                        placeholder="your@email.com"
                      />
                    </div>

                    <h2 className="text-xl font-semibold mt-8 mb-4">Shipping Address</h2>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">First Name</label>
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          required
                          className="input"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Last Name</label>
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          required
                          className="input"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Address</label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        required
                        className="input"
                        placeholder="123 Main Street"
                      />
                    </div>
                    <div className="grid sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">City</label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          required
                          className="input"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">State</label>
                        <input
                          type="text"
                          name="state"
                          value={formData.state}
                          onChange={handleInputChange}
                          required
                          className="input"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">ZIP Code</label>
                        <input
                          type="text"
                          name="zip"
                          value={formData.zip}
                          onChange={handleInputChange}
                          required
                          className="input"
                        />
                      </div>
                    </div>

                    <button type="submit" className="btn-primary btn-lg w-full mt-6">
                      Continue to Shipping
                    </button>
                  </div>
                )}

                {/* Shipping Step */}
                {step === 'shipping' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold mb-4">Shipping Method</h2>
                    <div className="space-y-3">
                      <label className={cn(
                        'flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-all',
                        formData.shippingMethod === 'standard' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                      )}>
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="shippingMethod"
                            value="standard"
                            checked={formData.shippingMethod === 'standard'}
                            onChange={handleInputChange}
                            className="h-4 w-4"
                          />
                          <div>
                            <p className="font-medium">Standard Shipping</p>
                            <p className="text-sm text-muted-foreground">5-7 business days</p>
                          </div>
                        </div>
                        <span className="font-medium">{subtotal >= 50 ? 'Free' : '$5.99'}</span>
                      </label>

                      <label className={cn(
                        'flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-all',
                        formData.shippingMethod === 'express' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                      )}>
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="shippingMethod"
                            value="express"
                            checked={formData.shippingMethod === 'express'}
                            onChange={handleInputChange}
                            className="h-4 w-4"
                          />
                          <div>
                            <p className="font-medium">Express Shipping</p>
                            <p className="text-sm text-muted-foreground">2-3 business days</p>
                          </div>
                        </div>
                        <span className="font-medium">$12.99</span>
                      </label>
                    </div>

                    <div className="flex gap-4 mt-6">
                      <button type="button" onClick={() => setStep('information')} className="btn-outline btn-lg flex-1">
                        Back
                      </button>
                      <button type="submit" className="btn-primary btn-lg flex-1">
                        Continue to Payment
                      </button>
                    </div>
                  </div>
                )}

                {/* Payment Step */}
                {step === 'payment' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold mb-4">Payment Details</h2>
                    <div className="p-4 rounded-lg bg-muted/50 flex items-center gap-3 mb-6">
                      <Lock className="h-5 w-5 text-primary" />
                      <span className="text-sm">Your payment information is encrypted and secure.</span>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Card Number</label>
                      <input
                        type="text"
                        name="cardNumber"
                        value={formData.cardNumber}
                        onChange={handleInputChange}
                        required
                        className="input"
                        placeholder="4242 4242 4242 4242"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Expiry Date</label>
                        <input
                          type="text"
                          name="expiry"
                          value={formData.expiry}
                          onChange={handleInputChange}
                          required
                          className="input"
                          placeholder="MM/YY"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">CVC</label>
                        <input
                          type="text"
                          name="cvc"
                          value={formData.cvc}
                          onChange={handleInputChange}
                          required
                          className="input"
                          placeholder="123"
                        />
                      </div>
                    </div>

                    <div className="flex gap-4 mt-6">
                      <button type="button" onClick={() => setStep('shipping')} className="btn-outline btn-lg flex-1">
                        Back
                      </button>
                      <button type="submit" disabled={isProcessing} className="btn-primary btn-lg flex-1">
                        {isProcessing ? 'Processing...' : `Pay ${formatPrice(total)} `}
                      </button>
                    </div>
                  </div>
                )}
              </form>
            </div>

            {/* Order Summary */}
            <div className="lg:sticky lg:top-24 h-fit">
              <div className="card p-6">
                <h3 className="font-semibold text-lg mb-4">Order Summary</h3>

                <ul className="space-y-4 mb-6">
                  {items.map((item) => {
                    const details = getCartItemDetails(item)
                    if (!details) return null
                    const { product, variant } = details

                    return (
                      <li key={item.variantId} className="flex gap-3">
                        <div className="h-16 w-16 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm line-clamp-1">{product.name}</p>
                          <p className="text-xs text-muted-foreground">{variant.name}</p>
                          <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                        <span className="font-medium text-sm">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </li>
                    )
                  })}
                </ul>

                <div className="space-y-2 pt-4 border-t">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax</span>
                    <span>{formatPrice(tax)}</span>
                  </div>
                </div>

                <div className="flex justify-between pt-4 mt-4 border-t">
                  <span className="font-semibold">Total</span>
                  <span className="font-semibold text-lg">{formatPrice(total)}</span>
                </div>

                <div className="mt-6 pt-6 border-t">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Truck className="h-4 w-4" />
                    <span>Free shipping on orders over $50</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
