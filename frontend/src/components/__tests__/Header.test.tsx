import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { Header } from '../Header'
import { CartProvider } from '@/store/CartContext'
import { AuthProvider } from '@/store/AuthContext'
import { SettingsProvider } from '@/store/SettingsContext'
import { settingsService } from '@/services/settings'
import { authService } from '@/services/auth'
import { categoryService } from '@/services/categories'

// Mock the services
vi.mock('@/services/settings', () => ({
    settingsService: {
        getSettings: vi.fn(),
    },
}))

vi.mock('@/services/auth', () => ({
    authService: {
        isAuthenticated: vi.fn(),
        getCurrentUser: vi.fn(),
        startSessionMonitor: vi.fn(),
        stopSessionMonitor: vi.fn(),
    },
}))

vi.mock('@/services/categories', () => ({
    categoryService: {
        getCategories: vi.fn(),
    },
}))

describe('Header Component', () => {
    beforeEach(() => {
        vi.clearAllMocks()

            // Default mock implementations
            ; (settingsService.getSettings as any).mockResolvedValue({
                id: '1',
                site_name: 'EcoShop Test',
                currency: 'USD',
                exchange_rate: 1,
                maintenance_mode: false,
            })
            ; (authService.isAuthenticated as any).mockReturnValue(false)
            ; (categoryService.getCategories as any).mockResolvedValue([])
    })

    it('renders the logo with the site name', async () => {
        render(
            <BrowserRouter>
                <AuthProvider>
                    <SettingsProvider>
                        <CartProvider>
                            <Header />
                        </CartProvider>
                    </SettingsProvider>
                </AuthProvider>
            </BrowserRouter>
        )

        // Wait for the loading state to disappear
        await waitFor(() => {
            expect(screen.queryByText(/Loading store configuration/i)).toBeNull()
        })

        expect(screen.getByText(/EcoShop Test/i)).toBeDefined()
    })

    it('renders the navigation search bar', async () => {
        render(
            <BrowserRouter>
                <AuthProvider>
                    <SettingsProvider>
                        <CartProvider>
                            <Header />
                        </CartProvider>
                    </SettingsProvider>
                </AuthProvider>
            </BrowserRouter>
        )

        await waitFor(() => {
            expect(screen.queryByText(/Loading store configuration/i)).toBeNull()
        })

        expect(screen.getByPlaceholderText(/Search products.../i)).toBeDefined()
    })
})
