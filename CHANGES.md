# Refactor: Extract reusable components and utilities

Date: 2025-08-30

## Goal
Improve readability, reusability, and maintainability by splitting large page components into smaller, focused components and centralizing duplicated logic into utilities.

## Summary of Changes

- Added reusable UI components:
  - `src/components/cards/monthly-limit-card.tsx`: Encapsulates the Monthly Limit card (edit/save logic, warning state).
  - `src/components/sections/categories-section.tsx`: Encapsulates the Categories section (header, add button, list rendering, empty state).
  - `src/components/cards/budget-history-card.tsx`: Encapsulates a single budget item in History.
  - `src/components/cards/currency-card.tsx`: Encapsulates currency selection.
  - `src/components/cards/history-retention-card.tsx`: Encapsulates history retention settings.
  - `src/components/cards/data-management-card.tsx`: Encapsulates export/import/reset actions.

- Added shared utilities:
  - `src/utils/budget.ts`: Common helpers: `getFreeMoneyCssClass`, `formatMonth`. A `getBudgetSummary` helper is provided for future use.
  - `src/utils/export-utils.ts`: Extracted export/import helpers: filename builders, text formatter, and download helpers.
  - `src/utils/animations.ts`: Centralized motion variants (`settingsVariants`, `cardVariants`, `dropdownVariants`, `optionVariants`).

- Updated pages/components to use new components/utilities:
  - `src/pages/MainPage.tsx`: Replaced inline Monthly Limit and Categories rendering with `MonthlyLimitCard` and `CategoriesSection`. Summary card shows totals; removed unused `getFreeMoneyCssClass` import. Removed redundant UI code and unused imports.
  - `src/pages/HistoryPage.tsx`: Replaced inline history card rendering and helpers with `BudgetHistoryCard` and `formatMonth` from `utils/budget`. `freeMoney` is computed via existing app logic and passed to the card.
  - `src/pages/SettingsPage.tsx`: Simplified using `CurrencyCard`, `HistoryRetentionCard`, and `DataManagementCard`. Moved export/download logic to `export-utils`. Uses shared `settingsVariants`/`cardVariants` from `utils/animations`.
  - `src/components/cards/{currency-card,history-retention-card,data-management-card,summary-card}.tsx`: Updated to consume shared `cardVariants` from `utils/animations`.
  - `src/components/VersionInfo.tsx`: Refactored to use `useVersionCheck` hook instead of custom fetch logic.

## Rationale and Notes

- The Monthly Limit section previously mixed UI and update logic. Now the UI is self-contained in `MonthlyLimitCard`, while the page retains the business update callback (`onSave`).
- The Categories list and its header/add button were repeated concerns. Moving to `CategoriesSection` cleans the page and makes it reusable if needed elsewhere.
- Settings page is now a thin composition layer that wires state to cards; formatting and download concerns live in `export-utils`; common motion variants live in `utils/animations`.
- History page had inline helpers (`formatMonth`, item rendering). These are now centralized/encapsulated; budget calculations continue to rely on the existing context functions to avoid behavior changes.
- File naming follows existing patterns like `summary-card.tsx` and `category-tag.tsx` for consistency.

## Files Added

- `src/components/cards/monthly-limit-card.tsx`
- `src/components/sections/categories-section.tsx`
- `src/components/cards/budget-history-card.tsx`
- `src/components/cards/currency-card.tsx`
- `src/components/cards/history-retention-card.tsx`
- `src/components/cards/data-management-card.tsx`
- `src/utils/budget.ts`
- `src/utils/export-utils.ts`
- `src/utils/animations.ts`

## Files Modified

- `src/pages/MainPage.tsx`
- `src/pages/HistoryPage.tsx`
- `src/pages/SettingsPage.tsx`
- `src/components/cards/currency-card.tsx`
- `src/components/cards/history-retention-card.tsx`
- `src/components/cards/data-management-card.tsx`
- `src/components/cards/summary-card.tsx`
- `src/components/VersionInfo.tsx`

## How to Verify

- Build and run the app as usual.
- Main page:
  - Monthly Limit card shows current limit and allows editing/saving.
  - Summary card displays totals and free money; styling reflects sign via standard text colors.
  - Categories section shows list, supports add/edit/delete via modal.
- History page:
  - Renders a list of budget history cards; clicking a card sets the current month.
- Settings page:
  - Currency, History retention, and Data management work via their cards.
  - Export Data (JSON) downloads a .json backup; Export Summary (Text) downloads a .txt summary.
- About section shows version via `useVersionCheck`; when a new version is available, it indicates an update.

No changes to data structures or storage formats.
