import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingBag, Search, Menu, Leaf, User, LogOut, Settings } from 'lucide-react'
import { useCart } from '../store/CartContext'
import { useAuth } from '../store/AuthContext'
import { useSettings } from '../store/SettingsContext'

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

          {/* Centered content: Logo and Search */}
          <div className="flex items-center justify-center gap-6 flex-1">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 font-display text-xl font-semibold text-foreground mr-8">
              <Leaf className="h-6 w-6 text-primary" />
              <span>{settings?.site_name || 'EcoShop'}</span>
            </Link>

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
