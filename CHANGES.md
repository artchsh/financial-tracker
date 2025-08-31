# Refactor: Extract reusable components and utilities

Date: 2025-08-30

## Goal
Improve readability, reusability, and maintainability by splitting large page components into smaller, focused components and centralizing duplicated logic into utilities.

## Summary of Changes

- Added reusable UI components:
  - `src/components/cards/monthly-limit-card.tsx`: Encapsulates the Monthly Limit card (edit/save logic, warning state).
  - `src/components/sections/categories-section.tsx`: Encapsulates the Categories section (header, add button, list rendering, empty state).
  - `src/components/cards/budget-history-card.tsx`: Encapsulates a single budget item in History.
  - `src/components/cards/appearance-card.tsx`: Encapsulates Appearance/Theme selection card.

- Added shared utilities:
  - `src/utils/budget.ts`: Common helpers: `getFreeMoneyCssClass`, `formatMonth`. A `getBudgetSummary` helper is provided for future use.

- Updated pages to use new components/utilities:
  - `src/pages/MainPage.tsx`: Replaced inline Monthly Limit and Categories rendering with `MonthlyLimitCard` and `CategoriesSection`. Uses `getFreeMoneyCssClass` from utils in `SummaryCard`. Removed redundant UI code and unused imports.
  - `src/pages/HistoryPage.tsx`: Replaced inline history card rendering and helpers with `BudgetHistoryCard` and `formatMonth` from `utils/budget`. `freeMoney` is computed via existing app logic and passed to the card.
  - `src/pages/SettingsPage.tsx`: Replaced inline Appearance/Theme block with `AppearanceCard` to simplify the file.

## Rationale and Notes

- The Monthly Limit section previously mixed UI and update logic. Now the UI is self-contained in `MonthlyLimitCard`, while the page retains the business update callback (`onSave`).
- The Categories list and its header/add button were repeated concerns. Moving to `CategoriesSection` cleans the page and makes it reusable if needed elsewhere.
- History page had inline helpers (`formatMonth`, item rendering). These are now centralized/encapsulated; budget calculations continue to rely on the existing context functions to avoid behavior changes.
- File naming follows existing patterns like `summary-card.tsx` and `category-tag.tsx` for consistency.

## Files Added

- `src/components/cards/monthly-limit-card.tsx`
- `src/components/sections/categories-section.tsx`
- `src/components/cards/budget-history-card.tsx`
- `src/components/cards/appearance-card.tsx`
- `src/utils/budget.ts`

## Files Modified

- `src/pages/MainPage.tsx`
- `src/pages/HistoryPage.tsx`
- `src/pages/SettingsPage.tsx`

## How to Verify

- Build and run the app as usual.
- Main page:
  - Monthly Limit card shows current limit and allows editing/saving.
  - Summary card displays totals; free money color uses `getFreeMoneyCssClass`.
  - Categories section shows list, supports add/edit/delete via modal.
- History page:
  - Renders a list of budget history cards; clicking a card sets the current month.
- Settings page:
  - Appearance/Theme selection works via `AppearanceCard`.

No changes to data structures or storage formats.
