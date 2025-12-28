// Types for the application
export interface Category {
  id: string;
  name: string;
  allocated: number;
  spent: number;
  color: string;
}

export interface MonthBudget {
  id: string;
  month: string; // YYYY-MM format
  spendingLimit: number;
  categories: Category[];
}

export interface AppSettings {
  currency: Currency;
  historyRetentionMonths: number;
}

export interface Currency {
  code: "KZT" | "USD" | "RUB";
  symbol: string;
  name: string;
}

export const CURRENCIES: Currency[] = [
  { code: "KZT", symbol: "₸", name: "Kazakhstani Tenge" },
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "RUB", symbol: "₽", name: "Russian Ruble" },
];

export interface AppData {
  budgets: MonthBudget[];
  settings: AppSettings;
}
