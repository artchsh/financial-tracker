# FIX.md — Audit & Improvement Plan

This document summarizes issues and concrete improvements for this PWA (React + Bun) and prioritizes the work. It focuses on security, correctness, PWA behavior, code quality, DX, and maintainability.

## Priorities

- P0 (breaks users / PWA): Fix asset paths, SW scope, and dev server behavior so the app loads and installs correctly in dev and prod.
- P1 (correctness / UX): Currency formatting, type-safety, duplicated budget math, and validation.
- P2 (security / privacy): Service Worker hardening, CSP/referrer/privacy headers, import validation.
- P3 (quality / maintainability): Linting, tests, structure, and general refactors.

---

## P0 — Critical PWA and Dev Server Fixes

1) Asset path mismatches (production and dev)
- Problem: `src/index.html` points to `/public/...` (absolute) while `build` copies `public/*` to `dist/` root (no `/public` prefix). Result: 404s and invalid manifest/icons in prod; in dev, these URLs return HTML (wildcard route), not JSON/images.
- Files:
  - `src/index.html`:
    - `<link rel="manifest" href="/public/manifest.json" />` should be `manifest.json` (relative) or `/<base>/manifest.json`.
    - All icon/card meta tags point to `/public/...`; should be `icons/...` or relative.
  - `public/manifest.json`:
    - `icons.src` points to `/public/icon-*.png` but icons live in `public/icons/*.png`.
- Fix:
  - Use relative URLs everywhere in HTML and manifest (works locally and on GitHub Pages):
    - `href="manifest.json"`, `content="icons/icon-192.png"`, `content="cards/og.png"`.
  - Keep the GitHub Pages base path in mind only in canonical URLs.

  Note: If you deliberately use absolute paths with the `/financial-tracker` base (GitHub Pages), that’s valid in production. The main risk to address is ensuring development and the service worker also resolve assets correctly. The recommendations below are framed to work in both environments; keep the base-path-specific absolute URLs if that’s your preferred deploy strategy.

2) Service Worker scope and URLs
- Problem: `App.tsx` registers `navigator.serviceWorker.register('/sw.js')` (absolute). On GitHub Pages the app is hosted at `/financial-tracker/`, so SW scope will not match; locally in dev the path returns HTML instead of JS.
- Files: `src/App.tsx`, `public/sw.js`, `public/manifest.json`.
- Fix:
  - Register with a relative URL so it works regardless of base path:
    - `navigator.serviceWorker.register('./sw.js')`.
  - Ensure the manifest `start_url` and `scope` are compatible with deployment:
    - For GitHub Pages, either keep `/financial-tracker` or prefer relative `"start_url": "."`, `"scope": "."` for portability, then rely on correct base path.
  - In `public/sw.js`, the `urlsToCache` should be relative or computed from `self.registration.scope` to avoid wrong caching paths.

3) Dev server doesn’t serve static assets
- Problem: `src/index.tsx` uses `bun.serve` with a wildcard route mapping every request to `index.html`. Requests for `frontend.tsx`, manifest, icons, etc., return HTML, breaking dev.
- Files: `src/index.tsx`, `src/index.html`.
- Options:
  - A) Replace the custom server for dev with: build + static server (watch). Example approach:
    - Use Bun build to bundle `src/index.html` to `dist/` with `--watch` and serve `dist/` via a simple static server. This ensures the browser gets JS/JSON/images.
  - B) If keeping `bun.serve`, add proper static serving for `src` and `public` and do not map `/*` to HTML for asset/file requests. Also ensure the script in HTML points to built JS, not a TSX module path.

---

## P1 — Correctness and UX

1) Currency formatting
- Problem: `formatCurrency` does string concatenation (`toLocaleString()` + symbol suffix). It’s locale-ambiguous and yields `$` after amount for USD.
- Fix: Use `Intl.NumberFormat` with currency code from settings, and consistent fraction digits.

2) Budget math duplicates and inconsistency
- Problem: Two different “Free Money” calculations are used:
  - Context: `calculateFreeMoney = spendingLimit - totalAllocated + totalUnspent`
  - UI (various places): `spendingLimit - totalAllocated`
- Clarify the intended definition:
  - If “Free Money” means unallocated budget (ignores category spend), use: `spendingLimit - totalAllocated`.
  - If it means money left to spend overall, use `spendingLimit - totalSpent`.
- Fix: Define one formula, centralize it in context/selectors, and use it consistently in all pages.

3) Boolean logic type safety
- Problem: `const isOverAllocated = currentBudget && totalAllocated > currentBudget.spendingLimit;` results in `MonthBudget | boolean`.
- Fix: `const isOverAllocated = totalAllocated > (currentBudget?.spendingLimit ?? 0);`

4) Types: remove `any`
- Files: `src/pages/HistoryPage.tsx` uses `any` for `budget` and `cat`.
- Fix: Use `MonthBudget` and `Category` types.

5) Numeric inputs / parsing
- Problem: `parseFloat(spendingLimit)` and category amounts accept any precision; negative checks exist but no upper bounds or NaN consequences.
- Fix:
  - Guard against NaN explicitly.
  - Normalize to fixed precision if desired (e.g., round to 2 decimals).
  - Optionally limit max values.

6) IDs and collisions
- Problem: Category IDs use `Date.now()`; across fast interactions, collisions are possible.
- Fix: Use `crypto.randomUUID()` (supported widely) or a small `nanoid`.

7) Derivations recalculated ad hoc
- Problem: Totals and derived values are recomputed inline across components.
- Fix: Extract selectors in context (or helper module) and memoize where helpful.

---

## P2 — Security and Privacy

1) Service Worker hardening
- Current SW is a minimal cache-first, caches everything in `urlsToCache` and returns cache for any request matched by `caches.match`.
- Risks: Stale/poisoned cache; no version rotation; no origin checks; caches HTML as app shell but no runtime strategy for non-core assets.
- Fixes:
  - Bump cache version and implement `activate` handler to delete old caches.
  - Only cache GET, same-origin requests. Skip opaque/cross-origin.
  - Prefer network-first or stale-while-revalidate for HTML and app shell; cache-first for static assets.
  - Add `self.skipWaiting()` on install and `clients.claim()` on activate to tighten update flow.

2) Import data validation
- Problem: `importData` only verifies presence of `budgets` and `settings`; it doesn’t validate shapes or ranges.
- Risks: Broken app state or unexpected values.
- Fix: Add schema validation (e.g., Zod) for `AppData` with constraints:
  - `month` matches `YYYY-MM`.
  - Non-negative numbers; integers where required; currency code in whitelist.
  - Category fields validated; unique IDs.

3) CSP and security meta
- GitHub Pages limits response headers, but you can still improve:
  - Add `<meta http-equiv="Content-Security-Policy" ...>` to restrict scripts to self and disallow inline if feasible (consider framer-motion inline styles/animations).
  - Already using `referrer` meta; keep `strict-origin-when-cross-origin`.
  - Avoid `user-scalable=0` to support accessibility.

4) XSS risk review
- React escapes text content by default. You do not use `dangerouslySetInnerHTML`. Inputs only set numeric/text state. Low risk currently.
- Keep it that way; sanitize any future rich text.

---

## P3 — Code Quality, DX, and Maintainability

1) Lint + format
- Do not ever use lint.

2) Tests
- Do not ever add tests.

3) Structure and naming
- Consider splitting context into:
  - State/reducer (pure), selectors (pure), and side-effects (db interactions).
- Co-locate page-specific helpers.

4) Build & scripts
- `build` script looks good (copies `public/*` to `dist/`). After path fixes, assets will resolve correctly.
- Consider adding a `preview` script to statically serve `dist/` to test PWA and SW.

5) Accessibility
- Remove zoom lock in viewport meta.
- Ensure all interactive elements have accessible names and `aria` where needed.
- Focus states are present; keep them visible on dark backgrounds as well.

6) Performance
- Framer Motion is used lightly; consider `prefers-reduced-motion` (already applied in CSS) and avoid animating layout thrash-prone properties.
- Consider code-splitting pages if bundle grows.

---

## Concrete Changes (Shortlist)

- Paths and PWA
  - In `src/index.html`:
    - manifest: `href="manifest.json"`.
    - icons: `icons/icon-192.png`, `icons/icon-512.png`.
    - og/twitter images: `cards/og.png`, `cards/twitter.png`.
    - Remove `user-scalable=0` and `maximum-scale=1.0`.
  - In `public/manifest.json`:
    - `start_url` and `scope`: prefer `"."` for portability, or keep GitHub Pages paths but match SW registration accordingly.
    - Fix icons `src` to `"icons/icon-192.png"` and `"icons/icon-512.png"`.
  - In `src/App.tsx`:
    - `navigator.serviceWorker.register('./sw.js')`.
  - In `public/sw.js`:
    - Use relative URLs (e.g., `'./', 'manifest.json'`) or build from `self.registration.scope`.
    - Add `activate` to clean old caches and `clients.claim()`; guard to same-origin, GET requests.

- Types and logic
  - Replace `any` in `HistoryPage` with `MonthBudget`/`Category`.
  - Fix `isOverAllocated` boolean type.
  - Unify “Free Money” formula via a single selector in context.
  - Upgrade `formatCurrency` to `Intl.NumberFormat` with `currency`.

- Validation
  - Add strict schema to `importData` with precise error messages; reject invalid payloads.

- IDs
  - Replace `Date.now()` with `crypto.randomUUID()` for category IDs.

- Dev Workflow
  - Prefer a static preview of `dist/` for PWA testing. Ensure the dev experience serves actual built assets instead of the wildcard HTML route.

---

## Example Snippets (for reference only)

1) Robust currency formatter (context)

```ts
const numberFmt = new Intl.NumberFormat(undefined, {
  style: 'currency',
  currency: state.settings.currency.code,
  currencyDisplay: 'symbol',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const formatCurrency = (amount: number) => numberFmt.format(amount);
```

2) Safer SW

```js
const CACHE_NAME = 'financial-tracker-v2';
const CORE = ['/', 'index.html', 'manifest.json'];
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then((c) => c.addAll(CORE)));
});
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET' || new URL(request.url).origin !== location.origin) return;
  event.respondWith(
    caches.match(request).then((cached) =>
      cached || fetch(request).then((res) => {
        if (res.ok && request.destination !== 'document') {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(request, copy));
        }
        return res;
      })
    )
  );
});
```

3) Import validation (conceptual)

```ts
import { z } from 'zod';
const Category = z.object({ id: z.string(), name: z.string().min(1), allocated: z.number().min(0), spent: z.number().min(0), color: z.string() });
const MonthBudget = z.object({ id: z.string(), month: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/), spendingLimit: z.number().min(0), categories: z.array(Category) });
const Currency = z.object({ code: z.enum(['KZT', 'USD', 'RUB']), symbol: z.string(), name: z.string() });
const AppSettings = z.object({ currency: Currency, historyRetentionMonths: z.number().int().min(1).max(120) });
const AppData = z.object({ budgets: z.array(MonthBudget), settings: AppSettings });
// then in importData: AppData.parse(JSON.parse(jsonString));
```

---

## Quality Gates (what to check after fixes)

- Build: prod build succeeds and `dist/` contains `index.html`, `manifest.json`, `sw.js`, `icons/`, `cards/`.
- Lint/Typecheck: ESLint passes; `tsc --noEmit` clean; no `any` in pages.
- Unit tests: reducer + selectors green.
- PWA smoke test: manifest valid, SW active, install works locally and on GitHub Pages path.

---

## Requirements Coverage

- Security precautions: SW hardening, CSP/meta guidance, strict import validation.
- Potential bugs: PWA asset paths, SW scope, boolean typing, duplicated budget logic, ID generation.
- Code design/writing: Type-safe models, selectors, formatter, lint/tests, structure and dev workflow.

---

If you’d like, I can implement P0 fixes in a branch: update paths in `index.html` and `manifest.json`, switch SW registration to relative, and improve `sw.js` with versioning and cleanup.
