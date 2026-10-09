import React from 'react';
import { StoreProvider } from './context/StoreContext';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { TrustBadges } from './components/TrustBadges';
import { ProductGrid } from './components/ProductGrid';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CheckoutModal } from './components/CheckoutModal';
import { CartDrawer } from './components/CartDrawer';
import { AdminDrawer } from './components/AdminDrawer';
import { Footer } from './components/Footer';

export const AppContent: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 selection:bg-brand-600 selection:text-white">
      <Header />
      <main className="flex-1">
        <Hero />
        <TrustBadges />
        <ProductGrid />
      </main>
      <Footer />

      {/* Modals and Drawers */}
      <ProductDetailModal />
      <CheckoutModal />
      <CartDrawer />
      <AdminDrawer />
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
}
