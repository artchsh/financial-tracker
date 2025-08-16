import React, { useState } from 'react';
import { useApp } from '../context';
import { CURRENCIES, AppSettings } from '../types';

export function SettingsPage() {
  const { state, updateSettings, exportData, importData, clearAllData } = useApp();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const handleCurrencyChange = (currencyCode: string) => {
    const currency = CURRENCIES.find(c => c.code === currencyCode);
    if (currency) {
      const newSettings: AppSettings = {
        ...state.settings,
        currency
      };
      updateSettings(newSettings);
    }
  };

  const handleRetentionChange = (months: number) => {
    const newSettings: AppSettings = {
      ...state.settings,
      historyRetentionMonths: months
    };
    updateSettings(newSettings);
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const data = await exportData();
      
      // Create and download file
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `financial-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      alert('Data exported successfully!');
    } catch (error) {
      alert('Failed to export data');
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
      alert('Data imported successfully!');
    } catch (error) {
      alert('Failed to import data. Please check the file format.');
    } finally {
      setIsImporting(false);
      // Reset the input
      event.target.value = '';
    }
  };

  const handleClearData = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete ALL data? This action cannot be undone.\n\nType "DELETE" in the next prompt to confirm.'
    );
    
    if (!confirmed) return;

    const confirmation = window.prompt(
      'Type "DELETE" to confirm you want to permanently delete all data:'
    );

    if (confirmation !== 'DELETE') {
      alert('Data deletion cancelled.');
      return;
    }

    try {
      setIsClearing(true);
      await clearAllData();
      alert('All data has been deleted.');
    } catch (error) {
      alert('Failed to clear data');
    } finally {
      setIsClearing(false);
    }
  };

  if (state.loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div>
      <h1 className="font-bold font-large mb-2">Settings</h1>

      {/* Currency Settings */}
      <div className="card">
        <h2 className="font-bold mb-1">Currency</h2>
        <div className="form-group">
          <label className="form-label">Display Currency</label>
          <select
            className="select"
            value={state.settings.currency.code}
            onChange={(e) => handleCurrencyChange(e.target.value)}
          >
            {CURRENCIES.map(currency => (
              <option key={currency.code} value={currency.code}>
                {currency.symbol} {currency.name} ({currency.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* History Settings */}
      <div className="card">
        <h2 className="font-bold mb-1">History</h2>
        <div className="form-group">
          <label className="form-label">Keep history for (months)</label>
          <select
            className="select"
            value={state.settings.historyRetentionMonths}
            onChange={(e) => handleRetentionChange(parseInt(e.target.value))}
          >
            <option value={3}>3 months</option>
            <option value={6}>6 months</option>
            <option value={12}>12 months</option>
            <option value={24}>24 months</option>
            <option value={36}>36 months</option>
          </select>
        </div>
        <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.5rem' }}>
          Currently storing {state.budgets.length} month{state.budgets.length !== 1 ? 's' : ''} of data
        </p>
      </div>

      {/* Data Management */}
      <div className="card">
        <h2 className="font-bold mb-2">Data Management</h2>
        
        {/* Export */}
        <div className="mb-2">
          <h3 className="font-bold mb-1" style={{ fontSize: '1rem' }}>Export Data</h3>
          <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>
            Download all your budget data as a JSON file for backup or transfer.
          </p>
          <button
            className="button w-full"
            onClick={handleExport}
            disabled={isExporting}
          >
            {isExporting ? 'Exporting...' : '📤 Export Data'}
          </button>
        </div>

        {/* Import */}
        <div className="mb-2">
          <h3 className="font-bold mb-1" style={{ fontSize: '1rem' }}>Import Data</h3>
          <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>
            Import budget data from a JSON file. This will replace all current data.
          </p>
          <label className="button w-full" style={{ display: 'block', textAlign: 'center', cursor: 'pointer' }}>
            {isImporting ? 'Importing...' : '📥 Import Data'}
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              disabled={isImporting}
              style={{ display: 'none' }}
            />
          </label>
        </div>

        {/* Clear Data */}
        <div>
          <h3 className="font-bold mb-1" style={{ fontSize: '1rem' }}>Reset All Data</h3>
          <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>
            Permanently delete all budget data. This action cannot be undone.
          </p>
          <button
            className="button-danger w-full"
            onClick={handleClearData}
            disabled={isClearing}
          >
            {isClearing ? 'Clearing...' : '🗑️ Delete All Data'}
          </button>
        </div>
      </div>

      {/* App Info */}
      <div className="card">
        <h2 className="font-bold mb-1">About</h2>
        <div style={{ fontSize: '0.9rem', color: '#666' }}>
          <p><strong>Financial Tracker PWA</strong></p>
          <p>Version 1.0.0</p>
          <p className="mt-1">Built with React and IndexedDB for offline use</p>
          <p className="mt-1">✅ Works offline</p>
          <p>✅ Mobile optimized</p>
          <p>✅ Data stored locally</p>
        </div>
      </div>

      {state.error && (
        <div className="error">
          {state.error}
        </div>
      )}
    </div>
  );
}
