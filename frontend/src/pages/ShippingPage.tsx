import { Package, Truck, RotateCcw, Leaf } from 'lucide-react'
import { useSettings } from '@/store/SettingsContext'

export function ShippingPage() {
  const { settings } = useSettings()

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-primary/5 py-16 md:py-24">
        <div className="container-wide">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
              Shipping & Returns
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              Fast, sustainable shipping with hassle-free returns.
            </p>
          </div>
        </div>
      </section>

      {/* Shipping Information */}
      <section className="py-16 md:py-24">
        <div className="container-wide max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            <div className="bg-secondary/30 rounded-lg p-8">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
                <Truck className="h-6 w-6" />
              </div>
              <h2 className="font-display text-2xl font-bold text-foreground mb-4">
                Shipping Options
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Standard Shipping</h3>
                  <p className="text-sm text-muted-foreground mb-1">3-5 business days</p>
                  <p className="text-sm text-muted-foreground">Free on orders over $50</p>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Express Shipping</h3>
                  <p className="text-sm text-muted-foreground mb-1">1-2 business days</p>
                  <p className="text-sm text-muted-foreground">$15 flat rate</p>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">International Shipping</h3>
                  <p className="text-sm text-muted-foreground mb-1">7-14 business days</p>
                  <p className="text-sm text-muted-foreground">Rates calculated at checkout</p>
                </div>
              </div>
            </div>

            <div className="bg-secondary/30 rounded-lg p-8">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
                <Leaf className="h-6 w-6" />
              </div>
              <h2 className="font-display text-2xl font-bold text-foreground mb-4">
                Carbon Neutral Shipping
              </h2>
              <p className="text-muted-foreground mb-4">
                Every order ships carbon neutral at no extra cost to you. We offset 100% of shipping 
                emissions through verified environmental projects.
              </p>
              <p className="text-muted-foreground">
                All packaging is 100% plastic-free, recyclable, and made from recycled materials.
              </p>
            </div>
          </div>

          {/* Shipping Details */}
          <div className="mb-16">
            <h2 className="font-display text-3xl font-bold text-foreground mb-8">
              Shipping Details
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-lg text-foreground mb-2">Processing Time</h3>
                <p className="text-muted-foreground">
                  Orders are typically processed within 1-2 business days. You'll receive a confirmation 
                  email when your order ships with tracking information.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg text-foreground mb-2">Tracking Your Order</h3>
                <p className="text-muted-foreground">
                  Once shipped, you can track your package using the tracking number provided in your 
                  shipping confirmation email. You can also view tracking information in your account 
                  under Order History.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg text-foreground mb-2">International Orders</h3>
                <p className="text-muted-foreground">
                  International customers are responsible for any customs duties, taxes, or fees imposed 
                  by their country. These charges are not included in your order total and vary by destination.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg text-foreground mb-2">Shipping Restrictions</h3>
                <p className="text-muted-foreground">
                  We currently ship to most countries worldwide. Some products may have shipping restrictions 
                  based on destination. Any restrictions will be noted on the product page.
                </p>
              </div>
            </div>
          </div>

          {/* Returns Section */}
          <div className="border-t border-border pt-16">
            <div className="flex items-center gap-3 mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary">
                <RotateCcw className="h-6 w-6" />
              </div>
              <h2 className="font-display text-3xl font-bold text-foreground">
                Returns & Exchanges
              </h2>
            </div>

            <div className="space-y-8">
              <div>
                <h3 className="font-semibold text-lg text-foreground mb-2">30-Day Return Policy</h3>
                <p className="text-muted-foreground mb-4">
                  We want you to love your purchase! If you're not completely satisfied, you can return 
                  most items within 30 days of delivery for a full refund.
                </p>
                <div className="bg-secondary/30 rounded-lg p-6">
                  <h4 className="font-semibold text-foreground mb-3">Return Requirements:</h4>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Items must be unused and in original condition</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Original packaging and tags must be intact</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Proof of purchase required</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Some items (personal care, perishables) are final sale</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-lg text-foreground mb-2">How to Return an Item</h3>
                <ol className="space-y-3 text-muted-foreground">
                  <li className="flex gap-3">
                    <span className="font-semibold text-primary">1.</span>
                    <span>Log into your account and go to Order History</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-semibold text-primary">2.</span>
                    <span>Select the order and click "Request Return"</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-semibold text-primary">3.</span>
                    <span>Choose your reason for return and submit the request</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-semibold text-primary">4.</span>
                    <span>Receive your prepaid return label via email</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-semibold text-primary">5.</span>
                    <span>Pack the item securely and attach the return label</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-semibold text-primary">6.</span>
                    <span>Drop off at any authorized shipping location</span>
                  </li>
                </ol>
              </div>

              <div>
                <h3 className="font-semibold text-lg text-foreground mb-2">Exchanges</h3>
                <p className="text-muted-foreground">
                  We currently don't offer direct exchanges. If you'd like a different size, color, or 
                  product, please return your original item and place a new order. This ensures you get 
                  your preferred item as quickly as possible.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-lg text-foreground mb-2">Refund Processing</h3>
                <p className="text-muted-foreground mb-2">
                  Once we receive and inspect your return, we'll process your refund within 5-7 business days. 
                  Refunds are issued to the original payment method.
                </p>
                <p className="text-muted-foreground">
                  Please allow an additional 3-5 business days for the credit to appear in your account, 
                  depending on your financial institution.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-lg text-foreground mb-2">Return Shipping Costs</h3>
                <p className="text-muted-foreground">
                  Returns within the US are free—we provide a prepaid return label. International return 
                  shipping costs are the responsibility of the customer unless the item is defective or 
                  we made an error.
                </p>
              </div>
            </div>
          </div>

          {/* Damaged or Defective Items */}
          <div className="border-t border-border pt-16 mt-16">
            <div className="flex items-center gap-3 mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary">
                <Package className="h-6 w-6" />
              </div>
              <h2 className="font-display text-3xl font-bold text-foreground">
                Damaged or Defective Items
              </h2>
            </div>
            <p className="text-muted-foreground mb-4">
              We carefully inspect all items before shipping, but if you receive a damaged or defective 
              product, please contact us immediately at {settings?.contact_email || 'support@ecoshop.com'}.
            </p>
            <p className="text-muted-foreground">
              Please include your order number and photos of the damage. We'll arrange for a replacement 
              or full refund, including return shipping costs.
            </p>
          </div>

          {/* Contact */}
          <div className="mt-16 bg-primary/5 rounded-lg p-8 text-center">
            <h3 className="font-semibold text-lg text-foreground mb-2">Need Help?</h3>
            <p className="text-muted-foreground mb-4">
              Have questions about shipping or returns? We're here to help!
            </p>
            <a
              href="/contact"
              className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-md font-medium hover:bg-primary/90 transition-colors"
            >
              Contact Support
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
