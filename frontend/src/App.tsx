import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { CartProvider } from '@/store/CartContext'
import { ToastProvider } from '@/store/ToastContext'
import { AuthProvider } from '@/store/AuthContext'
import { SettingsProvider } from '@/store/SettingsContext'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { CartDrawer } from '@/components/CartDrawer'
import { ToastContainer } from '@/components/ToastContainer'
import { SessionExpiredNotice } from '@/components/SessionExpiredNotice'
const HomePage = React.lazy(() => import('@/pages/HomePage').then(m => ({ default: m.HomePage })));
const ProductsPage = React.lazy(() => import('@/pages/ProductsPage').then(m => ({ default: m.ProductsPage })));
const ProductDetailPage = React.lazy(() => import('@/pages/ProductDetailPage').then(m => ({ default: m.ProductDetailPage })));
const CheckoutPage = React.lazy(() => import('@/pages/CheckoutPage').then(m => ({ default: m.CheckoutPage })));
const SignInPage = React.lazy(() => import('@/pages/SignInPage').then(m => ({ default: m.SignInPage })));
const SignUpPage = React.lazy(() => import('@/pages/SignUpPage').then(m => ({ default: m.SignUpPage })));
const VerifyEmailPage = React.lazy(() => import('@/pages/VerifyEmailPage'));
const AccountPage = React.lazy(() => import('@/pages/AccountPage').then(m => ({ default: m.AccountPage })));
const OrderDetailPage = React.lazy(() => import('@/pages/OrderDetailPage').then(m => ({ default: m.OrderDetailPage })));
const WishlistPage = React.lazy(() => import('@/pages/WishlistPage').then(m => ({ default: m.WishlistPage })));
const AboutPage = React.lazy(() => import('@/pages/AboutPage').then(m => ({ default: m.AboutPage })));
const SustainabilityPage = React.lazy(() => import('@/pages/SustainabilityPage').then(m => ({ default: m.SustainabilityPage })));
const ContactPage = React.lazy(() => import('@/pages/ContactPage').then(m => ({ default: m.ContactPage })));
const BlogPage = React.lazy(() => import('@/pages/BlogPage').then(m => ({ default: m.BlogPage })));
const FAQPage = React.lazy(() => import('@/pages/FAQPage').then(m => ({ default: m.FAQPage })));
const ShippingPage = React.lazy(() => import('@/pages/ShippingPage').then(m => ({ default: m.ShippingPage })));
const PrivacyPage = React.lazy(() => import('@/pages/PrivacyPage').then(m => ({ default: m.PrivacyPage })));
const TermsPage = React.lazy(() => import('@/pages/TermsPage').then(m => ({ default: m.TermsPage })));
const AdminLayout = React.lazy(() => import('@/pages/admin/AdminLayout').then(m => ({ default: m.AdminLayout })));
const AdminDashboard = React.lazy(() => import('@/pages/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const AdminProducts = React.lazy(() => import('@/pages/admin/AdminProducts').then(m => ({ default: m.AdminProducts })));
const AdminOrders = React.lazy(() => import('@/pages/admin/AdminOrders').then(m => ({ default: m.AdminOrders })));
const AdminInventory = React.lazy(() => import('@/pages/admin/AdminInventory').then(m => ({ default: m.AdminInventory })));
const AdminCustomers = React.lazy(() => import('@/pages/admin/AdminCustomers').then(m => ({ default: m.AdminCustomers })));
const AdminSettings = React.lazy(() => import('@/pages/admin/AdminSettings').then(m => ({ default: m.AdminSettings })));
import { ErrorBoundary } from '@/components/ErrorBoundary'

function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex-1">{children}</div>
      <Footer />
      <CartDrawer />
    </div>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AuthProvider>
          <SettingsProvider>
            <CartProvider>
              <ToastProvider>
                <React.Suspense fallback={
                  <div className="flex items-center justify-center min-h-[50vh]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                  </div>
                }>
                  <Routes>
                    {/* Store Routes */}
                    <Route path="/" element={<StoreLayout><HomePage /></StoreLayout>} />
                    <Route path="/products" element={<StoreLayout><ProductsPage /></StoreLayout>} />
                    <Route path="/products/:slug" element={<StoreLayout><ProductDetailPage /></StoreLayout>} />
                    <Route path="/checkout" element={<StoreLayout><CheckoutPage /></StoreLayout>} />
                    <Route path="/signin" element={<SignInPage />} />
                    <Route path="/signup" element={<SignUpPage />} />
                    <Route path="/verify-email" element={<StoreLayout><VerifyEmailPage /></StoreLayout>} />
                    <Route path="/account" element={<StoreLayout><AccountPage /></StoreLayout>} />
                    <Route path="/wishlist" element={<StoreLayout><WishlistPage /></StoreLayout>} />
                    <Route path="/orders/:id" element={<StoreLayout><OrderDetailPage /></StoreLayout>} />

                    {/* Footer Pages */}
                    <Route path="/about" element={<StoreLayout><AboutPage /></StoreLayout>} />
                    <Route path="/sustainability" element={<StoreLayout><SustainabilityPage /></StoreLayout>} />
                    <Route path="/contact" element={<StoreLayout><ContactPage /></StoreLayout>} />
                    <Route path="/blog" element={<StoreLayout><BlogPage /></StoreLayout>} />
                    <Route path="/faq" element={<StoreLayout><FAQPage /></StoreLayout>} />
                    <Route path="/shipping" element={<StoreLayout><ShippingPage /></StoreLayout>} />
                    <Route path="/privacy" element={<StoreLayout><PrivacyPage /></StoreLayout>} />
                    <Route path="/terms" element={<StoreLayout><TermsPage /></StoreLayout>} />

                    {/* Admin Routes */}
                    <Route path="/admin" element={<AdminLayout />}>
                      <Route index element={<AdminDashboard />} />
                      <Route path="products" element={<AdminProducts />} />
                      <Route path="orders" element={<AdminOrders />} />
                      <Route path="inventory" element={<AdminInventory />} />
                      <Route path="customers" element={<AdminCustomers />} />
                      <Route path="settings" element={<AdminSettings />} />
                    </Route>
                  </Routes>
                </React.Suspense>
                <ToastContainer />
                <SessionExpiredNotice />
              </ToastProvider>
            </CartProvider>
          </SettingsProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App
