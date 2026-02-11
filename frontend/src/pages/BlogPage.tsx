import { Calendar, User, ArrowRight } from 'lucide-react'
import { useSettings } from '@/store/SettingsContext'

export function BlogPage() {
  const { settings } = useSettings()

  const blogPosts = [
    {
      id: 1,
      title: '10 Simple Swaps for a More Sustainable Home',
      excerpt: 'Discover easy changes you can make today to reduce your environmental impact without compromising on style or comfort.',
      author: 'Emma Green',
      date: '2024-01-15',
      category: 'Lifestyle',
      image: '/images/hero.jpg'
    },
    {
      id: 2,
      title: 'The Truth About Greenwashing: How to Shop Smart',
      excerpt: 'Learn to identify genuine eco-friendly products and avoid misleading marketing claims with our comprehensive guide.',
      author: 'James Wilson',
      date: '2024-01-10',
      category: 'Guide',
      image: '/images/category-home.jpg'
    },
    {
      id: 3,
      title: 'Meet the Makers: Artisans Behind Our Products',
      excerpt: 'Go behind the scenes with the talented craftspeople who create our beautiful, sustainable products.',
      author: 'Sarah Martinez',
      date: '2024-01-05',
      category: 'Stories',
      image: '/images/category-fashion.jpg'
    },
    {
      id: 4,
      title: 'Zero Waste Kitchen: Essential Tips and Tools',
      excerpt: 'Transform your kitchen into a zero-waste zone with our practical advice and must-have sustainable products.',
      author: 'Emma Green',
      date: '2023-12-28',
      category: 'Guide',
      image: '/images/category-kitchen.jpg'
    },
    {
      id: 5,
      title: 'Sustainable Fashion: Building a Capsule Wardrobe',
      excerpt: 'Create a timeless, eco-friendly wardrobe with fewer pieces that you\'ll love wearing for years to come.',
      author: 'Olivia Chen',
      date: '2023-12-20',
      category: 'Fashion',
      image: '/images/category-clothes.jpg'
    },
    {
      id: 6,
      title: 'The Impact of Your Shopping Choices',
      excerpt: 'Understanding how consumer decisions drive environmental change and the power you have to make a difference.',
      author: 'James Wilson',
      date: '2023-12-15',
      category: 'Impact',
      image: '/images/category-bags.jpg'
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-primary/5 py-16 md:py-24">
        <div className="container-wide">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
              The {settings?.site_name || 'EcoShop'} Blog
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              Stories, guides, and inspiration for sustainable living.
            </p>
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-16 md:py-24">
        <div className="container-wide">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post) => (
              <article key={post.id} className="group cursor-pointer">
                <div className="bg-secondary/30 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <div className="aspect-[16/9] bg-secondary overflow-hidden">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(post.date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </span>
                      <span>•</span>
                      <span>{post.category}</span>
                    </div>
                    <h2 className="font-display text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                      {post.title}
                    </h2>
                    <p className="text-sm text-muted-foreground mb-4">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <User className="h-3 w-3" />
                        <span>{post.author}</span>
                      </div>
                      <span className="text-sm text-primary font-medium inline-flex items-center gap-1">
                        Read More
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-16 md:py-24 bg-primary/5">
        <div className="container-wide">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Stay Updated
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Subscribe to our newsletter for the latest articles, tips, and exclusive offers.
            </p>
            <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
              <button
                type="submit"
                className="bg-primary text-primary-foreground px-6 py-3 rounded-md font-medium hover:bg-primary/90 transition-colors whitespace-nowrap"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  )
}
