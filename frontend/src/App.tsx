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
import { HomePage } from '@/pages/HomePage'
import { ProductsPage } from '@/pages/ProductsPage'
import { ProductDetailPage } from '@/pages/ProductDetailPage'
import { CheckoutPage } from '@/pages/CheckoutPage'
import { SignInPage } from '@/pages/SignInPage'
import { SignUpPage } from '@/pages/SignUpPage'
import VerifyEmailPage from '@/pages/VerifyEmailPage'
import { AccountPage } from '@/pages/AccountPage'
import { OrderDetailPage } from '@/pages/OrderDetailPage'
import { AdminLayout } from '@/pages/admin/AdminLayout'
import { AdminDashboard } from '@/pages/admin/AdminDashboard'
import { AdminProducts } from '@/pages/admin/AdminProducts'
import { AdminOrders } from '@/pages/admin/AdminOrders'
import { AdminInventory } from '@/pages/admin/AdminInventory'
import { AdminCustomers } from '@/pages/admin/AdminCustomers'
import { AdminSettings } from '@/pages/admin/AdminSettings'

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
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <SettingsProvider>
          <CartProvider>
            <ToastProvider>
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
                <Route path="/orders/:id" element={<StoreLayout><OrderDetailPage /></StoreLayout>} />

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
              <ToastContainer />
              <SessionExpiredNotice />
            </ToastProvider>
          </CartProvider>
        </SettingsProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
