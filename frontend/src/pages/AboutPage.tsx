import { Leaf, Heart, Users, Award } from 'lucide-react'
import { useSettings } from '@/store/SettingsContext'

export function AboutPage() {
  const { settings } = useSettings()

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-primary/5 py-16 md:py-24">
        <div className="container-wide">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
              About {settings?.site_name || 'EcoShop'}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              We're on a mission to make sustainable living accessible, affordable, and beautiful.
            </p>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 md:py-24">
        <div className="container-wide">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-8 text-center">
              Our Story
            </h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-muted-foreground mb-6">
                Founded in 2020, {settings?.site_name || 'EcoShop'} was born from a simple belief: that shopping 
                sustainably shouldn't require sacrifice. We started in a small studio apartment with a dream to 
                curate the finest eco-friendly products from around the world.
              </p>
              <p className="text-muted-foreground mb-6">
                Today, we've grown into a trusted destination for conscious consumers who refuse to choose between 
                quality, style, and sustainability. Every product in our collection is carefully vetted to meet our 
                strict environmental and ethical standards.
              </p>
              <p className="text-muted-foreground">
                We partner with artisans, innovators, and brands who share our values—from fair labor practices 
                to carbon-neutral production. Together, we're proving that commerce can be a force for good.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-16 md:py-24 bg-secondary/30">
        <div className="container-wide">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-12 text-center">
            Our Values
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
                <Leaf className="h-8 w-8" />
              </div>
              <h3 className="font-semibold text-lg text-foreground mb-2">Sustainability</h3>
              <p className="text-sm text-muted-foreground">
                Every product is chosen for its minimal environmental impact and sustainable production methods.
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
                <Heart className="h-8 w-8" />
              </div>
              <h3 className="font-semibold text-lg text-foreground mb-2">Ethics</h3>
              <p className="text-sm text-muted-foreground">
                We support fair wages, safe working conditions, and transparent supply chains.
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
                <Users className="h-8 w-8" />
              </div>
              <h3 className="font-semibold text-lg text-foreground mb-2">Community</h3>
              <p className="text-sm text-muted-foreground">
                We believe in building connections and supporting local and global communities.
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
                <Award className="h-8 w-8" />
              </div>
              <h3 className="font-semibold text-lg text-foreground mb-2">Quality</h3>
              <p className="text-sm text-muted-foreground">
                Sustainable doesn't mean compromise. We curate only the finest, longest-lasting products.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Impact */}
      <section className="py-16 md:py-24">
        <div className="container-wide">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-12 text-center">
            Our Impact
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">50K+</div>
              <p className="text-muted-foreground">Happy Customers</p>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">100%</div>
              <p className="text-muted-foreground">Carbon Neutral Shipping</p>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">200+</div>
              <p className="text-muted-foreground">Ethical Brands</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
