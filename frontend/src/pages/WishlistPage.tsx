
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Heart, ArrowRight, Trash2 } from 'lucide-react'
import { useAuth } from '@/store/AuthContext'
import { useToast } from '@/store/ToastContext'
import { wishlistService } from '@/services/wishlist'
import { Product } from '@/data/types'
import { ProductCard } from '@/components/ProductCard'

export function WishlistPage() {
    const { isAuthenticated } = useAuth()
    const { addToast } = useToast()
    const [wishlist, setWishlist] = useState<Product[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (isAuthenticated) {
            loadWishlist()
        } else {
            setIsLoading(false)
        }
    }, [isAuthenticated])

    const loadWishlist = async () => {
        setIsLoading(true)
        try {
            const data = await wishlistService.getWishlist()
            setWishlist(data)
        } catch (error) {
            addToast('Failed to load wishlist', 'error')
        } finally {
            setIsLoading(false)
        }
    }

    const handleRemove = async (productId: string) => {
        try {
            await wishlistService.removeFromWishlist(productId)
            setWishlist(prev => prev.filter(p => p.id !== productId))
            addToast('Removed from wishlist', 'success')
        } catch (error) {
            addToast('Failed to remove item', 'error')
        }
    }

    if (!isAuthenticated) {
        return (
            <div className="section">
                <div className="container-wide text-center py-20">
                    <Heart className="h-16 w-16 text-muted-foreground/30 mx-auto mb-6" />
                    <h1 className="text-3xl font-bold mb-4">Your Wishlist</h1>
                    <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                        Sign in to see your saved items and sync your wishlist across all your devices.
                    </p>
                    <Link to="/signin" className="btn-primary">
                        Sign In Now
                    </Link>
                </div>
            </div>
        )
    }

    if (isLoading) {
        return (
            <div className="section">
                <div className="container-wide">
                    <div className="h-8 w-48 bg-muted animate-pulse rounded mb-8"></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="aspect-[3/4] bg-muted animate-pulse rounded-xl"></div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="section min-h-[60vh]">
            <div className="container-wide">
                <header className="flex justify-between items-end mb-10">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">My Wishlist</h1>
                        <p className="text-muted-foreground">{wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} saved</p>
                    </div>
                    <Link to="/products" className="text-primary font-medium hover:underline flex items-center gap-2">
                        Continue Shopping <ArrowRight className="h-4 w-4" />
                    </Link>
                </header>

                {wishlist.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {wishlist.map((product) => (
                            <div key={product.id} className="relative group">
                                <ProductCard product={product} />
                                <button
                                    onClick={() => handleRemove(product.id)}
                                    className="absolute top-4 right-4 p-2 bg-background/80 backdrop-blur-sm rounded-full text-muted-foreground hover:text-red-500 hover:bg-background transition-all shadow-sm opacity-0 group-hover:opacity-100"
                                    aria-label="Remove from wishlist"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-muted/30 rounded-3xl border border-dashed border-border py-20 px-6 text-center">
                        <div className="bg-background h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                            <Heart className="h-10 w-10 text-muted-foreground/30" />
                        </div>
                        <h2 className="text-xl font-semibold mb-2">Your wishlist is empty</h2>
                        <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
                            Save items you're interested in while browsing to find them easily later.
                        </p>
                        <Link to="/products" className="btn-primary">
                            Browse Products
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}
