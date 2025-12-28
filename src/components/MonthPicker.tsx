import React, { useState } from 'react';
import { useApp } from '../context';
import { Dropdown } from './Dropdown';

interface MonthPickerProps {
  currentMonth: string;
  onMonthChange: (month: string) => void;
}

function generateMonthOptions() {
  const options = [];
  const currentDate = new Date();
  
  for (let i = -6; i <= 6; i++) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const monthLabel = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    options.push({ value: monthKey, label: monthLabel });
  }
  
  return options;
}

export function MonthPicker({ currentMonth, onMonthChange }: MonthPickerProps) {
  const { createBudgetFromPrevious, state } = useApp();
  const [isCreating, setIsCreating] = useState(false);

  const handleMonthChange = async (month: string) => {
    onMonthChange(month);
    
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
    <div className="card">
      <div className="form-group">
        <label className="form-label">Month</label>
        <Dropdown
          options={generateMonthOptions()}
          value={currentMonth}
          onChange={handleMonthChange}
          disabled={isCreating}
        />
      </div>
      {isCreating && (
        <p className="form-description mt-1">Creating budget from previous month...</p>
      )}
    </div>
  );
}
