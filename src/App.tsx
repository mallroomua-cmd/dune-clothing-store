import React from 'react';
import { StoreProvider } from './context/StoreContext';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { TrustBadges } from './components/TrustBadges';
import { ProductGrid } from './components/ProductGrid';
import { ReviewsSection } from './components/ReviewsSection';
import { MobileFloatingBar } from './components/MobileFloatingBar';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CheckoutModal } from './components/CheckoutModal';
import { CartDrawer } from './components/CartDrawer';
import { AdminDrawer } from './components/AdminDrawer';
import { Footer } from './components/Footer';

export const AppContent: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 selection:bg-brand-600 selection:text-white pb-20 sm:pb-0">
      <Header />
      <main className="flex-1">
        <Hero />
        <TrustBadges />
        <ProductGrid />
        <ReviewsSection />
      </main>
      <Footer />

      {/* Sticky Mobile Floating Quick Bar */}
      <MobileFloatingBar />

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
