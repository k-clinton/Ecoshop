import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingBag, Search, Menu, Leaf, User, LogOut, Settings, Heart, Grid3x3, ChevronDown } from 'lucide-react'
import { useCart } from '../store/CartContext'
import { useAuth } from '../store/AuthContext'
import { useSettings } from '../store/SettingsContext'
import { categoryService } from '../services/categories'
import { Category } from '../data/types'

interface HeaderProps {
  onMenuOpen?: () => void
}

export function Header({ onMenuOpen }: HeaderProps) {
  const { itemCount, toggleCart } = useCart()
  const { user, isAuthenticated, signOut } = useAuth()
  const { settings } = useSettings()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = React.useState('')
  const [isUserMenuOpen, setIsUserMenuOpen] = React.useState(false)
  const [isCategoriesOpen, setIsCategoriesOpen] = React.useState(false)
  const [categories, setCategories] = React.useState<Category[]>([])

  // Load categories
  React.useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await categoryService.getCategories()
        setCategories(cats)
      } catch (error) {
        console.error('Failed to load categories:', error)
      }
    }
    loadCategories()
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container-wide">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Mobile menu button */}
          <button
            onClick={onMenuOpen}
            className="btn-ghost p-2 lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Centered content: Logo, Categories, and Search */}
          <div className="flex items-center justify-center gap-4 lg:gap-6 flex-1">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 font-display text-xl font-semibold text-foreground">
              <Leaf className="h-6 w-6 text-primary" />
              <span className="hidden sm:inline">{settings?.site_name || 'EcoShop'}</span>
            </Link>

            {/* Categories Dropdown */}
            <div className="relative hidden lg:block">
              <button
                onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                className="btn-ghost btn-sm flex items-center gap-1"
              >
                <Grid3x3 className="h-4 w-4" />
                Categories
                <ChevronDown className="h-4 w-4" />
              </button>

              {isCategoriesOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsCategoriesOpen(false)}
                  />
                  <div className="absolute left-0 top-full mt-2 w-64 bg-card rounded-xl border shadow-elevated z-50 py-2 max-h-96 overflow-y-auto">
                    <Link
                      to="/products"
                      onClick={() => setIsCategoriesOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted transition-colors font-medium"
                    >
                      All Products
                    </Link>
                    <div className="border-t my-2"></div>
                    {categories.map((category) => (
                      <Link
                        key={category.id}
                        to={`/products?category=${category.slug}`}
                        onClick={() => setIsCategoriesOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted transition-colors"
                      >
                        {category.name}
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="hidden md:flex items-center relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
                className="input h-9 w-64 lg:w-80 pl-10"
              />
              <Search className="h-4 w-4 text-muted-foreground absolute left-3 pointer-events-none" />
            </form>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Mobile Categories Button */}
            <div className="relative lg:hidden">
              <button
                onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                className="btn-ghost p-2"
                aria-label="Categories"
              >
                <Grid3x3 className="h-5 w-5" />
              </button>

              {isCategoriesOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsCategoriesOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-64 bg-card rounded-xl border shadow-elevated z-50 py-2 max-h-96 overflow-y-auto">
                    <div className="px-4 py-2 border-b mb-2">
                      <h3 className="font-semibold text-sm">Categories</h3>
                    </div>
                    <Link
                      to="/products"
                      onClick={() => setIsCategoriesOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted transition-colors font-medium"
                    >
                      All Products
                    </Link>
                    <div className="border-t my-2"></div>
                    {categories.map((category) => (
                      <Link
                        key={category.id}
                        to={`/products?category=${category.slug}`}
                        onClick={() => setIsCategoriesOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted transition-colors"
                      >
                        {category.name}
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="btn-ghost p-2 flex items-center gap-2"
                >
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-semibold text-primary">
                      {user?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="hidden md:inline text-sm font-medium">{user?.name?.split(' ')[0]}</span>
                </button>

                {isUserMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-56 bg-card rounded-xl border shadow-elevated z-50 py-2">
                      <div className="px-4 py-2 border-b mb-2">
                        <p className="font-medium text-sm">{user?.name}</p>
                        <p className="text-xs text-muted-foreground">{user?.email}</p>
                      </div>
                      {user?.role === 'admin' && (
                        <Link
                          to="/admin"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted transition-colors"
                        >
                          <Settings className="h-4 w-4" />
                          Admin Dashboard
                        </Link>
                      )}
                      <Link
                        to="/account"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted transition-colors"
                      >
                        <User className="h-4 w-4" />
                        My Account
                      </Link>
                      <button
                        onClick={() => {
                          signOut()
                          setIsUserMenuOpen(false)
                        }}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/signin" className="btn-ghost btn-sm hidden sm:flex">
                  Sign In
                </Link>
                <Link to="/signup" className="btn-primary btn-sm">
                  Sign Up
                </Link>
              </div>
            )}

            {/* Wishlist */}
            <Link
              to="/wishlist"
              className="btn-ghost p-2 text-muted-foreground hover:text-foreground hidden sm:flex"
              aria-label="Wishlist"
            >
              <Heart className="h-5 w-5" />
            </Link>

            {/* Cart */}
            <button
              onClick={toggleCart}
              className="btn-ghost p-2 relative"
              aria-label="Open cart"
            >
              <ShoppingBag className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs font-medium flex items-center justify-center">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
