# CSV Feed, Supabase Cloud Sync & Mobile Optimization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement universal CSV feed upload with smart column recognition, full two-way Supabase database synchronization, and deep mobile UI/UX optimization (bottom nav bar, mobile filter drawer, touch-friendly interactions).

**Architecture:** Extend the existing Shopify CSV parser into a universal feed engine that auto-detects Ukrainian, English, and Shopify column formats with merge/replace strategies. Connect CSV import and the admin dashboard directly to Supabase cloud database (`bulkSyncProductsToSupabase`), providing real-time synchronization controls. Build a dedicated mobile bottom navigation bar and mobile filter drawer with faceted search, while refining mobile touch targets across cards and modals.

**Tech Stack:** React 19, TypeScript, Tailwind CSS, Lucide React, PapaParse, @supabase/supabase-js, IndexedDB, Jiti / Node.js test runner.

**Spec:** User request: "чтобы в проекте загружались товары фидом csv, был подключен supabase, был оптимизирован под мобильные телефоны и тд; вручную через панель управления, изучи и делай".

## Global Constraints

- Preserve all existing tests and passing test suite (`npm test`).
- Ensure `npm run build` (`tsc -b && vite build`) executes cleanly with zero TypeScript errors.
- Never regress existing Shopify CSV compatibility or existing orders/cart functionality.
- Mobile components must adhere to minimum 44px touch targets and iOS `safe-area-inset-bottom`.
- All prices parsed from Ukrainian formats (e.g. `1 499,00 грн`) must parse reliably into clean numeric numbers.

## Review Focus

- Malformed or non-standard CSV headers (e.g. Ukrainian `Назва, Ціна, Артикул` or Prom/Rozetka exports) must be auto-detected and imported cleanly.
- CSV imports with existing products must support both `upsert` (merge without wiping) and `replace` modes.
- Supabase synchronization must handle network failure gracefully with user-friendly alerts and offline fallback.
- Mobile bottom navigation bar must not overlap content or break layout on screens below 640px.
- Mobile filter drawer must update product count and filter criteria reactively without page reloads.

---

### Task 1: Universal CSV Feed Engine & Flexible Parser

**Files:**
- Create: `src/lib/universal-csv.ts`
- Modify: `src/lib/shopify-parser.ts`
- Test: `test/universal-csv.test.ts`

**Interfaces:**
- Consumes: `Product`, `CsvPreviewResult` from `src/types/index.ts`, `PapaParse`
- Produces:
  - `parseUniversalCsvFeed(csvString: string, options?: { defaultVendor?: string }): Promise<Product[]>`
  - `generateSampleCsvTemplate(): string`
  - `mergeProducts(existing: Product[], imported: Product[], mode: 'replace' | 'upsert'): Product[]`

- [ ] **Step 1: Write the failing test**

Create `test/universal-csv.test.ts` with tests for:
1. Parsing Ukrainian CSV headers (`Назва, Ціна, Артикул, Зображення, Категорія, Бренд, Опис, Розмір`).
2. Parsing generic English CSV (`title, price, sku, image, category, vendor, description`).
3. Generating a clean sample CSV template.
4. Product merge logic (`upsert` vs `replace`).

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jiti test/universal-csv.test.ts`
Expected: FAIL (module `universal-csv.ts` not found)

- [ ] **Step 3: Implement universal CSV parsing in `src/lib/universal-csv.ts`**

Implement:
- Smart column mapping detecting variations of Title (`title`, `назва`, `товар`, `name`), Price (`price`, `ціна`, `вартість`), SKU (`sku`, `артикул`, `код`), Image (`image`, `images`, `фото`, `зображення`, `image_url`), Category (`category`, `категорія`, `type`, `тип`), Vendor (`vendor`, `бренд`, `виробник`), Description (`description`, `опис`, `body`), Sizes (`розміри`, `розмір`, `sizes`, `size`).
- Fallback to `parseShopifyCsv` if Shopify headers are detected.
- Sample template generator for instant download by store managers.
- Merge helper (`mergeProducts`) handling SKU / handle key matching.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jiti test/universal-csv.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/universal-csv.ts test/universal-csv.test.ts
git commit -m "feat: add universal CSV feed parser with auto-mapping and merge logic"
```

---

### Task 2: Supabase Two-Way Cloud Sync & CSV Import Integration

**Files:**
- Modify: `src/context/StoreContext.tsx`
- Modify: `src/components/AdminControlHub.tsx`
- Modify: `src/components/SupabaseSettingsCard.tsx`
- Test: `test/supabase-sync.test.ts`

**Interfaces:**
- Consumes: `parseUniversalCsvFeed`, `generateSampleCsvTemplate`, `mergeProducts`, `bulkSyncProductsToSupabase`, `fetchProductsFromSupabase`
- Produces:
  - `uploadCsv(csvContent: string, options?: { syncToSupabase?: boolean; mode?: 'replace' | 'upsert' }): Promise<{ count: number; syncedToCloud?: number }>`
  - `syncCatalogWithCloud(direction: 'push' | 'pull'): Promise<{ success: boolean; count: number; message: string }>`

- [ ] **Step 1: Write the failing test**

Create `test/supabase-sync.test.ts` verifying:
1. `uploadCsv` options signature and `mergeProducts` integration.
2. Cloud sync payload mapping (`rowToProduct`, `productToRow`).
3. Sample template download trigger.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jiti test/supabase-sync.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement Supabase sync in `StoreContext.tsx` & UI in `AdminControlHub.tsx`**

- Update `uploadCsv` in `StoreContext.tsx` to accept `{ syncToSupabase?: boolean; mode?: 'replace' | 'upsert' }`. If `syncToSupabase` is true and Supabase is configured, run `bulkSyncProductsToSupabase`.
- Add `syncCatalogWithCloud(direction: 'push' | 'pull')` to `StoreContextType`.
- In `AdminControlHub.tsx` (Feed Tab):
  - Add import mode radio ("Оновити та додати за артикулом" vs "Повна заміна каталогу").
  - Add "Синхронізувати з хмарою Supabase" checkbox (checked by default if Supabase is active).
  - Add "Завантажити шаблон CSV (.csv)" button.
  - Show detailed result toast/message with cloud sync status.
- In `SupabaseSettingsCard.tsx`:
  - Add 2 action buttons: "Вивантажити товари в хмару (Push)" and "Завантажити товари з хмари (Pull)".
  - Display live product count comparison (Local IndexedDB vs Supabase).

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jiti test/supabase-sync.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/context/StoreContext.tsx src/components/AdminControlHub.tsx src/components/SupabaseSettingsCard.tsx test/supabase-sync.test.ts
git commit -m "feat: integrate Supabase cloud sync with CSV feed import and add admin sync controls"
```

---

### Task 3: Mobile Experience & Navigation Optimization

**Files:**
- Create: `src/components/MobileFilterDrawer.tsx`
- Modify: `src/components/MobileFloatingBar.tsx`
- Modify: `src/components/ProductGrid.tsx`
- Modify: `src/components/ProductCard.tsx`
- Modify: `src/App.tsx`
- Test: `test/mobile-experience.test.ts`

**Interfaces:**
- Consumes: `useStore`, `ProductGrid` filter state, `FashionFilter`
- Produces:
  - `MobileFilterDrawer`: slide-up bottom sheet on mobile for filtering by category, brand, price, and sorting.
  - `MobileFloatingBar`: 5-item mobile bottom navigation (Home/Catalog, Search, Filters, Wishlist, Bag).

- [ ] **Step 1: Write the failing test**

Create `test/mobile-experience.test.ts` to test:
1. Mobile navigation items structure and state management.
2. Filter criteria evaluation (price ranges, brand match, in-stock filter).
3. Ensure phone href references `storeSettings.phone`.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jiti test/mobile-experience.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement Mobile Bottom Bar & Filter Drawer**

- Create `src/components/MobileFilterDrawer.tsx`:
  - Full-featured mobile bottom sheet with drag handle and backdrop.
  - Categories list with product counts.
  - Brands selector (A-Z).
  - Price range inputs (Min ₴ / Max ₴).
  - "Тільки в наявності" toggle.
  - Sticky bottom CTA: "ПОКАЗАТИ [X] ТОВАРІВ" and "Скинути".
- Upgrade `src/components/MobileFloatingBar.tsx`:
  - Replace legacy skin quiz button with mobile Filter toggle & Wishlist button with count badge.
  - Dynamic store phone from `storeSettings.phone`.
  - Add safe-area padding for modern iOS and Android devices (`pb-[max(0.6rem,env(safe-area-inset-bottom))]`).
- Wire `MobileFilterDrawer` into `App.tsx` and `ProductGrid.tsx`.
- Refine touch targets in `ProductCard.tsx` (min 44px touch boundaries).

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jiti test/mobile-experience.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/MobileFilterDrawer.tsx src/components/MobileFloatingBar.tsx src/components/ProductGrid.tsx src/components/ProductCard.tsx src/App.tsx test/mobile-experience.test.ts
git commit -m "feat: add mobile filter bottom sheet, redesign mobile bottom navigation and optimize touch interactions"
```

---

### Task 4: Complete Test Suite & Production Build Verification

**Files:**
- Modify: `package.json` (add new test files to test script)
- Test: all tests in `test/`

- [ ] **Step 1: Update test script in `package.json` to include new test suites**
- [ ] **Step 2: Run complete test suite**
Run: `npm test`
Expected: ALL TESTS PASS
- [ ] **Step 3: Run production build**
Run: `npm run build`
Expected: Zero TypeScript errors, Vite build successful
- [ ] **Step 4: Commit and Push**
```bash
git add package.json
git commit -m "chore: verify full test suite and production build"
```
