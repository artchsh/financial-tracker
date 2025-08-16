import React, { useState } from 'react';
import { useApp } from '../context';

interface MonthPickerProps {
  currentMonth: string;
  onMonthChange: (month: string) => void;
}

export function MonthPicker({ currentMonth, onMonthChange }: MonthPickerProps) {
  const { createBudgetFromPrevious, state } = useApp();
  const [isCreating, setIsCreating] = useState(false);

  const generateMonthOptions = () => {
    const options = [];
    const currentDate = new Date();
    
    // Add current and next 6 months
    for (let i = -6; i <= 6; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
      options.push({ value: monthKey, label: monthLabel });
    }
    
    return options;
  };

  const handleMonthChange = async (month: string) => {
    onMonthChange(month);
    
    // If selected month doesn't have a budget, offer to create from previous
    const existingBudget = state.budgets.find(b => b.month === month);
    if (!existingBudget && month !== currentMonth) {
      const shouldCreate = window.confirm(
        'This month doesn\'t have a budget yet. Would you like to create one based on the previous month?'
      );
      
      if (shouldCreate) {
        setIsCreating(true);
        try {
          await createBudgetFromPrevious(month);
        } catch (error) {
          console.error('Failed to create budget:', error);
        } finally {
          setIsCreating(false);
        }
      }
    }
  };

  return (
    <div className="form-group">
      <label className="form-label">Month</label>
      <select
        className="select"
        value={currentMonth}
        onChange={(e) => handleMonthChange(e.target.value)}
        disabled={isCreating}
      >
        {generateMonthOptions().map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {isCreating && (
        <div className="mt-1" style={{ fontSize: '0.9rem', color: '#666' }}>
          Creating budget from previous month...
        </div>
      )}
    </div>
  );
}
