# Pareto Principle (80/20) High-Impact Improvements Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the 20% highest-impact features that deliver 80% of conversion, revenue, and usability improvements for the Ukrainian luxury fashion & beauty store, verify with 100% test pass rate, and push to remote `https://github.com/mallroomua-cmd/v0-luxury-fashion-homepage`.

**Architecture:** Lightweight TypeScript modules and React components enhancing the client-side store (Vite + React 18 + Tailwind) with Telegram WebApp SDK bindings, haptic feedback, 1-click Monobank payment flow, cross-sell bundle synergies with 10% auto-discount, brand filter chips, and Telegram bot web_app launch.

**Tech Stack:** TypeScript, React, Tailwind CSS, Telegram WebApp API, Supabase, Jiti test runner.

---

## Global Constraints
- Zero external runtime dependencies added; use standard web and Telegram WebApp globals.
- Preserve 100% backward compatibility with existing tests and Supabase schema.
- All pricing and discounts formatted in Ukrainian Hryvnia (UAH / ₴).
- All customer-facing text in professional, clean Ukrainian.
- Keep test suite passing 100% with `npm test` and `npm run build`.

---

## Tasks

### Task 1: Telegram WebApp (TMA) & Haptic SDK Integration
**Files:**
- Create: `src/lib/telegram-webapp.ts`
- Modify: `src/components/CheckoutModal.tsx`
- Modify: `src/components/ProductCard.tsx`
- Modify: `src/components/CartDrawer.tsx`
- Modify: `src/lib/telegram-bot-core.ts`
- Test: `test/pareto-features.test.ts`

- [x] Step 1: Create `src/lib/telegram-webapp.ts` with safe Telegram WebApp detection, user info getter, and haptic feedback wrappers (`hapticImpact`, `hapticNotification`).
- [x] Step 2: In `src/components/CheckoutModal.tsx`, pre-fill customer name and Telegram username from WebApp user info, and trigger success haptic on order placement.
- [x] Step 3: In `src/components/ProductCard.tsx` and `src/components/CartDrawer.tsx`, invoke light haptic impact on add-to-cart and quantity adjustments.
- [x] Step 4: In `src/lib/telegram-bot-core.ts`, add a direct `web_app` button to `/start` inline keyboard for instant Mini App store opening.

### Task 2: 1-Click Monobank & Quick-Pay Requisites Widget
**Files:**
- Modify: `src/components/CheckoutModal.tsx`
- Test: `test/pareto-features.test.ts`

- [x] Step 1: Enhance the card payment selection in `CheckoutModal.tsx` with high-converting Monobank requisites, 1-click copy buttons, and deep link button.
- [x] Step 2: Add trust badges (0% комісії, офіційний рахунок ФОП, фіскальний чек).

### Task 3: Beauty Badges & "Часто купують разом" (Bundle Synergies)
**Files:**
- Create: `src/lib/bundle-synergy.ts`
- Modify: `src/components/ProductDetailModal.tsx`
- Modify: `src/components/CartDrawer.tsx`
- Test: `test/pareto-features.test.ts`

- [x] Step 1: Create `src/lib/bundle-synergy.ts` providing bundle pairing logic (e.g. Rhode Lip Tint + Pocket Blush, Olaplex Oil + K18 Mask) with 10% bundle discount math.
- [x] Step 2: In `ProductDetailModal.tsx`, detect beauty items and render appropriate beauty badges instead of streetwear fallbacks.
- [x] Step 3: In `ProductDetailModal.tsx`, render "Часто купують разом" widget with 1-click "Купити комплектом (-10%)" button.

### Task 4: Interactive Sticky Brand Filter Bar
**Files:**
- Modify: `src/components/ProductGrid.tsx`
- Modify: `src/components/Header.tsx`
- Test: `test/pareto-features.test.ts`

- [x] Step 1: Add horizontal scrolling brand pills with product counts right above the product catalog grid for 1-tap brand filtering.

### Task 5: Testing, Build Verification & Git Push to Target
**Files:**
- Create: `test/pareto-features.test.ts`
- Execute: `npm test && npm run build`
- Git: Push to `https://github.com/mallroomua-cmd/v0-luxury-fashion-homepage` (main branch).

- [x] Step 1: Create and run `test/pareto-features.test.ts` verifying all new logic.
- [x] Step 2: Run full test suite and production build.
- [x] Step 3: Commit all changes with clean commit messages.
- [x] Step 4: Push to `target/main` (`https://github.com/mallroomua-cmd/v0-luxury-fashion-homepage`).
