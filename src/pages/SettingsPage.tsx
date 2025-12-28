import React, { useState } from "react";
import { motion } from "framer-motion";
import { useApp } from "../context";
import { CURRENCIES, AppSettings } from "../types";
import VersionInfo from "../components/VersionInfo";
import TopHeader from "@/components/top-header";
import CurrencyCard from "@/components/cards/currency-card";
import HistoryRetentionCard from "@/components/cards/history-retention-card";
import DataManagementCard from "@/components/cards/data-management-card";
import {
  buildBackupJsonFilename,
  buildSummaryTextFilename,
  downloadJsonFile,
  downloadTextFile,
  formatSummaryText,
} from "@/utils/export-utils";
import { settingsVariants, cardVariants } from "@/utils/animations";

export function SettingsPage() {
  const {
    state,
    updateSettings,
    exportData,
    importData,
    clearAllData,
    formatCurrency,
  } = useApp();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const handleCurrencyChange = (currencyCode: string) => {
    const currency = CURRENCIES.find((c) => c.code === currencyCode);
    if (currency) {
      const newSettings: AppSettings = { ...state.settings, currency };
      updateSettings(newSettings);
    }
  };

  const currencyOptions = CURRENCIES.map((currency) => ({
    value: currency.code,
    label: `${currency.symbol} ${currency.name} (${currency.code})`,
  }));

  const handleRetentionChange = (months: number) => {
    const newSettings: AppSettings = {
      ...state.settings,
      historyRetentionMonths: months,
    };
    updateSettings(newSettings);
  };

  const retentionOptions = [
    { value: "3", label: "3 months" },
    { value: "6", label: "6 months" },
    { value: "12", label: "12 months" },
    { value: "24", label: "24 months" },
    { value: "36", label: "36 months" },
  ];

  const handleExportFormatted = async () => {
    try {
      setIsExporting(true);
      const text = formatSummaryText(state.budgets, formatCurrency);
      downloadTextFile(buildSummaryTextFilename(), text);
      alert("Formatted summary exported successfully!");
    } catch (error) {
      alert("Failed to export formatted summary");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const data = await exportData();
      downloadJsonFile(buildBackupJsonFilename(), data);
      alert("Data exported successfully!");
    } catch (error) {
      alert("Failed to export data");
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsImporting(true);
      const text = await file.text();
      await importData(text);
      alert("Data imported successfully!");
    } catch (error) {
      alert("Failed to import data. Please check the file format.");
    } finally {
      setIsImporting(false);
      // Reset the input
      event.target.value = "";
    }
  };

  const handleClearData = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete ALL data? This action cannot be undone.\n\nType "DELETE" in the next prompt to confirm.',
    );

    if (!confirmed) return;

    const confirmation = window.prompt(
      'Type "DELETE" to confirm you want to permanently delete all data:',
    );

    if (confirmation !== "DELETE") {
      alert("Data deletion cancelled.");
      return;
    }

    try {
      setIsClearing(true);
      await clearAllData();
      alert("All data has been deleted.");
    } catch (error) {
      alert("Failed to clear data");
    } finally {
      setIsClearing(false);
    }
  };

  if (state.loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <motion.div variants={settingsVariants} initial="hidden" animate="visible">
      <TopHeader title="Settings" />

      <motion.div layout className="flex flex-col gap-2">
        <CurrencyCard
          value={state.settings.currency.code}
          options={currencyOptions}
          onChange={handleCurrencyChange}
        />

        <HistoryRetentionCard
          value={state.settings.historyRetentionMonths.toString()}
          options={retentionOptions}
          onChange={handleRetentionChange}
          currentCount={state.budgets.length}
        />

        <DataManagementCard
          isExporting={isExporting}
          isImporting={isImporting}
          isClearing={isClearing}
          onExport={handleExport}
          onExportFormatted={handleExportFormatted}
          onImport={handleImport}
          onClear={handleClearData}
        />

        {/* <motion.div className="card" variants={cardVariants}>
          <h2 className="mb-1 font-bold">About</h2>
          <div style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
            <VersionInfo />
          </div>
        </motion.div> */}

        {state.error && (
          <motion.div className="error" variants={cardVariants}>
            {state.error}
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
