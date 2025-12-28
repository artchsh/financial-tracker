import { AppData, AppSettings, MonthBudget, CURRENCIES } from "./types";

const DB_NAME = "FinancialTrackerDB";
const DB_VERSION = 1;
const STORE_NAME = "appData";

export class DatabaseService {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: "id" });
        }
      };
    });
  }

  async getData(): Promise<AppData> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get("appData");

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        if (request.result) {
          const data = request.result.data;
          // Migration: Remove theme property if it exists
          if (data.settings && "theme" in data.settings) {
            delete data.settings.theme;
          }
          resolve(data);
        } else {
          // Return default data if none exists
          const defaultData: AppData = {
            budgets: [],
            settings: {
              currency: CURRENCIES[0], // Default to KZT
              historyRetentionMonths: 12,
            },
          };
          resolve(defaultData);
        }
      };
    });
  }

  async saveData(data: AppData): Promise<void> {
    if (!this.db) await this.init();

    // Apply history retention limit
    const cutoffDate = new Date();
    cutoffDate.setMonth(
      cutoffDate.getMonth() - data.settings.historyRetentionMonths,
    );
    const cutoffMonth = `${cutoffDate.getFullYear()}-${String(cutoffDate.getMonth() + 1).padStart(2, "0")}`;

    data.budgets = data.budgets.filter((budget) => budget.month >= cutoffMonth);

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put({ id: "appData", data });

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async clearData(): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async exportData(): Promise<string> {
    const data = await this.getData();
    return JSON.stringify(data, null, 2);
  }

  async importData(jsonString: string): Promise<void> {
    try {
      const data: AppData = JSON.parse(jsonString);

      // Validate the imported data structure
      if (!data.budgets || !data.settings) {
        throw new Error("Invalid data format");
      }

      // Migration: Remove theme property if it exists in imported data
      if ("theme" in data.settings) {
        delete (data.settings as any).theme;
      }

      await this.clearData();
      await this.saveData(data);
    } catch (error) {
      throw new Error("Failed to import data: Invalid format");
    }
  }
}

export const dbService = new DatabaseService();
