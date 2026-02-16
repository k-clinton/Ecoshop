import { Category } from '@/data/types'
import { cn } from '@/lib/utils'

interface FilterSidebarProps {
    categories: Category[]
    selectedCategory: string | null
    onCategoryChange: (slug: string | null) => void
    priceRanges: string[]
    onPriceRangeChange: (range: string) => void
    currencySymbol: string
    thresholds: number[]
    inStockOnly: boolean
    onInStockChange: (checked: boolean) => void
    onClearFilters: () => void
}

export function FilterSidebar({
    categories,
    selectedCategory,
    onCategoryChange,
    priceRanges,
    onPriceRangeChange,
    currencySymbol,
    thresholds,
    inStockOnly,
    onInStockChange,
    onClearFilters
}: FilterSidebarProps) {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="font-semibold mb-3">Categories</h3>
                <ul className="space-y-2">
                    <li>
                        <button
                            onClick={() => onCategoryChange(null)}
                            className={cn(
                                'text-sm transition-colors',
                                !selectedCategory
                                    ? 'text-primary font-medium'
                                    : 'text-muted-foreground hover:text-foreground'
                            )}
                        >
                            All Products
                        </button>
                    </li>
                    {categories.map((category) => (
                        <li key={category.id}>
                            <button
                                onClick={() => onCategoryChange(category.slug)}
                                className={cn(
                                    'text-sm transition-colors',
                                    selectedCategory === category.slug
                                        ? 'text-primary font-medium'
                                        : 'text-muted-foreground hover:text-foreground'
                                )}
                            >
                                {category.name}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="border-t pt-6">
                <h3 className="font-semibold mb-3">Price Range</h3>
                <div className="space-y-2">
                    {[
                        { id: 'under-25', label: `Under ${currencySymbol}${thresholds[0].toLocaleString()}` },
                        { id: '25-50', label: `${currencySymbol}${thresholds[0].toLocaleString()} - ${currencySymbol}${thresholds[1].toLocaleString()}` },
                        { id: '50-100', label: `${currencySymbol}${thresholds[1].toLocaleString()} - ${currencySymbol}${thresholds[2].toLocaleString()}` },
                        { id: 'over-100', label: `Over ${currencySymbol}${thresholds[2].toLocaleString()}` }
                    ].map(range => (
                        <label key={range.id} className="flex items-center gap-2 text-sm cursor-pointer">
                            <input
                                type="checkbox"
                                className="rounded border-input text-primary focus:ring-primary"
                                checked={priceRanges.includes(range.id)}
                                onChange={() => onPriceRangeChange(range.id)}
                            />
                            <span>{range.label}</span>
                        </label>
                    ))}
                </div>
            </div>

            <div className="border-t pt-6">
                <h3 className="font-semibold mb-3">Availability</h3>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                        type="checkbox"
                        className="rounded border-input text-primary focus:ring-primary"
                        checked={inStockOnly}
                        onChange={(e) => onInStockChange(e.target.checked)}
                    />
                    <span>In Stock Only</span>
                </label>
            </div>

            <div className="border-t pt-6">
                <button
                    onClick={onClearFilters}
                    className="text-sm text-primary hover:underline"
                >
                    Clear all filters
                </button>
            </div>
        </div>
    )
}
