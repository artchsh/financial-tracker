import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
} from "react";
import { AppData, MonthBudget, Category, AppSettings } from "./types";
import { dbService } from "./database";

interface AppState extends AppData {
  currentMonth: string;
  loading: boolean;
  error: string | null;
}

type AppAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_DATA"; payload: AppData }
  | { type: "SET_CURRENT_MONTH"; payload: string }
  | { type: "UPDATE_BUDGET"; payload: MonthBudget }
  | { type: "UPDATE_SETTINGS"; payload: AppSettings }
  | { type: "DELETE_BUDGET"; payload: string };

const initialState: AppState = {
  budgets: [],
  settings: {
    currency: { code: "KZT", symbol: "₸", name: "Kazakhstani Tenge" },
    historyRetentionMonths: 12,
  },
  currentMonth: getCurrentMonth(),
  loading: true,
  error: null,
};

function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload };

    case "SET_ERROR":
      return { ...state, error: action.payload };

    case "SET_DATA":
      return {
        ...state,
        budgets: action.payload.budgets,
        settings: action.payload.settings,
        loading: false,
        error: null,
      };

    case "SET_CURRENT_MONTH":
      return { ...state, currentMonth: action.payload };

    case "UPDATE_BUDGET":
      const updatedBudgets = state.budgets.filter(
        (b) => b.month !== action.payload.month,
      );
      return {
        ...state,
        budgets: [...updatedBudgets, action.payload].sort((a, b) =>
          b.month.localeCompare(a.month),
        ),
      };

    case "UPDATE_SETTINGS":
      return { ...state, settings: action.payload };

    case "DELETE_BUDGET":
      return {
        ...state,
        budgets: state.budgets.filter((b) => b.month !== action.payload),
      };

    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  getCurrentBudget: () => MonthBudget | undefined;
  updateBudget: (budget: MonthBudget) => Promise<void>;
  updateSettings: (settings: AppSettings) => Promise<void>;
  setCurrentMonth: (month: string) => void;
  createBudgetFromPrevious: (month: string) => Promise<void>;
  exportData: () => Promise<string>;
  importData: (jsonString: string) => Promise<void>;
  clearAllData: () => Promise<void>;
  calculateFreeMoney: (budget: MonthBudget) => number;
  formatCurrency: (amount: number) => string;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      const data = await dbService.getData();
      dispatch({ type: "SET_DATA", payload: data });
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Failed to load data" });
    }
  };

  const saveData = async () => {
    try {
      const data: AppData = {
        budgets: state.budgets,
        settings: state.settings,
      };
      await dbService.saveData(data);
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Failed to save data" });
    }
  };

  useEffect(() => {
    if (!state.loading) {
      saveData();
    }
  }, [state.budgets, state.settings]);

  const getCurrentBudget = (): MonthBudget | undefined => {
    return state.budgets.find((b) => b.month === state.currentMonth);
  };

  const updateBudget = async (budget: MonthBudget) => {
    dispatch({ type: "UPDATE_BUDGET", payload: budget });
  };

  const updateSettings = async (settings: AppSettings) => {
    dispatch({ type: "UPDATE_SETTINGS", payload: settings });
  };

  const setCurrentMonth = (month: string) => {
    dispatch({ type: "SET_CURRENT_MONTH", payload: month });
  };

  const createBudgetFromPrevious = async (month: string) => {
    const sortedBudgets = [...state.budgets].sort((a, b) =>
      b.month.localeCompare(a.month),
    );
    const previousBudget = sortedBudgets[0];

    if (previousBudget) {
      const newBudget: MonthBudget = {
        id: `budget-${month}`,
        month,
        spendingLimit: previousBudget.spendingLimit,
        categories: previousBudget.categories.map((cat) => ({
          ...cat,
          id: `${cat.id}-${month}`,
          spent: 0,
        })),
      };
      await updateBudget(newBudget);
    } else {
      // Create empty budget if no previous budget exists
      const newBudget: MonthBudget = {
        id: `budget-${month}`,
        month,
        spendingLimit: 0,
        categories: [],
      };
      await updateBudget(newBudget);
    }
  };

  const exportData = async (): Promise<string> => {
    return await dbService.exportData();
  };

  const importData = async (jsonString: string) => {
    try {
      await dbService.importData(jsonString);
      await loadData();
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Failed to import data" });
      throw error;
    }
  };

  const clearAllData = async () => {
    try {
      await dbService.clearData();
      dispatch({
        type: "SET_DATA",
        payload: {
          budgets: [],
          settings: state.settings,
        },
      });
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Failed to clear data" });
    }
  };

  const calculateFreeMoney = (budget: MonthBudget): number => {
    const totalAllocated = budget.categories.reduce(
      (sum, cat) => sum + cat.allocated,
      0,
    );
    const totalUnspent = budget.categories.reduce(
      (sum, cat) => sum + Math.max(0, cat.allocated - cat.spent),
      0,
    );
    return budget.spendingLimit - totalAllocated + totalUnspent;
  };

  const formatCurrency = (amount: number): string => {
    const { symbol } = state.settings.currency;
    return `${amount.toLocaleString()} ${symbol}`;
  };

  const contextValue: AppContextType = {
    state,
    getCurrentBudget,
    updateBudget,
    updateSettings,
    setCurrentMonth,
    createBudgetFromPrevious,
    exportData,
    importData,
    clearAllData,
    calculateFreeMoney,
    formatCurrency,
  };

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
}
