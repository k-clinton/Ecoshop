import { Leaf, Package, Recycle, Wind, Droplet, Sun } from 'lucide-react'
import { useSettings } from '@/store/SettingsContext'

export function SustainabilityPage() {
  const { settings } = useSettings()

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-primary/5 py-16 md:py-24">
        <div className="container-wide">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
              Our Sustainability Commitment
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              We're dedicated to reducing our environmental footprint and creating a more sustainable future for all.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-16 md:py-24">
        <div className="container-wide">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6">
              Our Promise
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              At {settings?.site_name || 'EcoShop'}, sustainability isn't just a buzzword—it's the foundation of 
              everything we do. From product selection to packaging and shipping, we're committed to making choices 
              that benefit both people and planet.
            </p>
          </div>
        </div>
      </section>

      {/* Key Initiatives */}
      <section className="py-16 md:py-24 bg-secondary/30">
        <div className="container-wide">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-12 text-center">
            Our Initiatives
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-background rounded-lg p-6 shadow-sm">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
                <Package className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-xl text-foreground mb-3">Sustainable Packaging</h3>
              <p className="text-muted-foreground">
                100% plastic-free packaging made from recycled and biodegradable materials. Every box, every mailer, 
                every piece of tape is designed to return to the earth.
              </p>
            </div>
            <div className="bg-background rounded-lg p-6 shadow-sm">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
                <Wind className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-xl text-foreground mb-3">Carbon Neutral Shipping</h3>
              <p className="text-muted-foreground">
                We offset 100% of our shipping emissions through verified carbon reduction projects including 
                reforestation and renewable energy initiatives.
              </p>
            </div>
            <div className="bg-background rounded-lg p-6 shadow-sm">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
                <Recycle className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-xl text-foreground mb-3">Circular Economy</h3>
              <p className="text-muted-foreground">
                We partner with brands that design for longevity and recyclability, and we offer repair guides 
                and recycling programs to extend product lifecycles.
              </p>
            </div>
            <div className="bg-background rounded-lg p-6 shadow-sm">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
                <Droplet className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-xl text-foreground mb-3">Water Conservation</h3>
              <p className="text-muted-foreground">
                We prioritize products made with water-efficient processes and materials that don't contribute to 
                water pollution or excessive consumption.
              </p>
            </div>
            <div className="bg-background rounded-lg p-6 shadow-sm">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
                <Sun className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-xl text-foreground mb-3">Renewable Energy</h3>
              <p className="text-muted-foreground">
                Our warehouse runs on 100% renewable energy, and we partner with brands committed to transitioning 
                to clean power sources.
              </p>
            </div>
            <div className="bg-background rounded-lg p-6 shadow-sm">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
                <Leaf className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-xl text-foreground mb-3">Ethical Sourcing</h3>
              <p className="text-muted-foreground">
                Every product is vetted for environmental impact, from raw material extraction to final production, 
                ensuring minimal harm at every stage.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section className="py-16 md:py-24">
        <div className="container-wide">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-12 text-center">
            Our Standards
          </h2>
          <div className="max-w-4xl mx-auto">
            <p className="text-lg text-muted-foreground text-center mb-12">
              We work with certified partners and adhere to the highest environmental standards:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center p-4 border border-border rounded-lg">
                <p className="font-semibold text-foreground">B Corp</p>
                <p className="text-xs text-muted-foreground mt-1">Certified</p>
              </div>
              <div className="text-center p-4 border border-border rounded-lg">
                <p className="font-semibold text-foreground">Carbon Neutral</p>
                <p className="text-xs text-muted-foreground mt-1">Certified</p>
              </div>
              <div className="text-center p-4 border border-border rounded-lg">
                <p className="font-semibold text-foreground">Fair Trade</p>
                <p className="text-xs text-muted-foreground mt-1">Partner</p>
              </div>
              <div className="text-center p-4 border border-border rounded-lg">
                <p className="font-semibold text-foreground">FSC</p>
                <p className="text-xs text-muted-foreground mt-1">Certified</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Goals */}
      <section className="py-16 md:py-24 bg-primary/5">
        <div className="container-wide">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-12 text-center">
            2030 Goals
          </h2>
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-background rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold text-lg text-foreground mb-2">100% Regenerative Supply Chain</h3>
              <p className="text-muted-foreground">
                Moving beyond sustainability to actively restore ecosystems through our sourcing practices.
              </p>
            </div>
            <div className="bg-background rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold text-lg text-foreground mb-2">Zero Waste Operations</h3>
              <p className="text-muted-foreground">
                Eliminating all waste from our operations through composting, recycling, and circular design.
              </p>
            </div>
            <div className="bg-background rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold text-lg text-foreground mb-2">1 Million Trees Planted</h3>
              <p className="text-muted-foreground">
                Supporting global reforestation efforts through partnerships with environmental organizations.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
