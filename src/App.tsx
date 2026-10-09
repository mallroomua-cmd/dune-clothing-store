import React, { Suspense, lazy } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { TrustBadges } from './components/TrustBadges';
import { ProductGrid } from './components/ProductGrid';
import { ReviewsSection } from './components/ReviewsSection';
import { MobileFloatingBar } from './components/MobileFloatingBar';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CheckoutModal } from './components/CheckoutModal';
import { CartDrawer } from './components/CartDrawer';
import { Footer } from './components/Footer';

import { ContactWidget } from './components/ContactWidget';
import { WishlistModal } from './components/WishlistModal';
import { SearchModal } from './components/SearchModal';
import { SocialProofToast } from './components/SocialProofToast';
import { ToastContainer } from './components/ToastContainer';
import { RecentlyViewed } from './components/RecentlyViewed';
import { ScrollToTop } from './components/ScrollToTop';

// Code-splitting heavy components (Admin Hub: 2400+ LOC & Policy docs)
// This cuts initial bundle size drastically for storefront visitors
const AdminControlHub = lazy(() =>
  import('./components/AdminControlHub').then((m) => ({ default: m.AdminControlHub }))
);
const PolicyModal = lazy(() =>
  import('./components/PolicyModal').then((m) => ({ default: m.PolicyModal }))
);

export const AppContent: React.FC = () => {
  const { isPolicyModalOpen, policyModalTab, closePolicyModal, isAdminOpen } = useStore();

  return (
    <div className="min-h-screen flex flex-col bg-white text-dune-black selection:bg-black selection:text-white pb-20 sm:pb-0">
      <Header />
      <main className="flex-1">
        <Hero />
        <TrustBadges />
        <ProductGrid />
        <ReviewsSection />
        <RecentlyViewed />
      </main>
      <Footer />

      {/* Floating Elements: Contact Button (Right), Social Proof (Left), Scroll to Top */}
      <ContactWidget />
      <SocialProofToast />
      <ScrollToTop />
      <ToastContainer />

      {/* Sticky Mobile Floating Quick Bar */}
      <MobileFloatingBar />

      {/* Modals and Drawers */}
      <ProductDetailModal />
      <CheckoutModal />
      <CartDrawer />
      <WishlistModal />
      <SearchModal />

      {/* Lazy Modals loaded only on demand */}
      {isPolicyModalOpen && (
        <Suspense fallback={null}>
          <PolicyModal
            isOpen={isPolicyModalOpen}
            initialTab={policyModalTab}
            onClose={closePolicyModal}
          />
        </Suspense>
      )}

      {isAdminOpen && (
        <Suspense fallback={null}>
          <AdminControlHub />
        </Suspense>
      )}
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
