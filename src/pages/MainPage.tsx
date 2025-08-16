import React, { useState, useEffect } from 'react';
import { useApp } from '../context';
import { MonthPicker } from '../components/MonthPicker';
import { CategoryCard } from '../components/CategoryCard';
import { CategoryModal } from '../components/CategoryModal';
import { Category, MonthBudget } from '../types';

export function MainPage() {
  const {
    state,
    getCurrentBudget,
    updateBudget,
    setCurrentMonth,
    calculateFreeMoney,
    formatCurrency
  } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | undefined>();
  const [spendingLimit, setSpendingLimit] = useState('');
  const [showSpendingLimitEdit, setShowSpendingLimitEdit] = useState(false);

  const currentBudget = getCurrentBudget();

  useEffect(() => {
    if (currentBudget) {
      setSpendingLimit(currentBudget.spendingLimit.toString());
    } else {
      setSpendingLimit('0');
    }
  }, [currentBudget]);

  const handleSaveCategory = (categoryData: Omit<Category, 'id'>) => {
    const budget = currentBudget || {
      id: `budget-${state.currentMonth}`,
      month: state.currentMonth,
      spendingLimit: 0,
      categories: []
    };

    let updatedCategories;
    
    if (editingCategory) {
      // Update existing category
      updatedCategories = budget.categories.map(cat =>
        cat.id === editingCategory.id
          ? { ...editingCategory, ...categoryData }
          : cat
      );
    } else {
      // Add new category
      const newCategory: Category = {
        id: `cat-${Date.now()}`,
        ...categoryData
      };
      updatedCategories = [...budget.categories, newCategory];
    }

    const updatedBudget: MonthBudget = {
      ...budget,
      categories: updatedCategories
    };

    updateBudget(updatedBudget);
    setEditingCategory(undefined);
  };

  const handleDeleteCategory = (categoryId: string) => {
    if (!currentBudget) return;

    const updatedBudget: MonthBudget = {
      ...currentBudget,
      categories: currentBudget.categories.filter(cat => cat.id !== categoryId)
    };

    updateBudget(updatedBudget);
  };

  const handleSaveSpendingLimit = () => {
    const limit = parseFloat(spendingLimit) || 0;
    
    if (limit < 0) {
      alert('Spending limit cannot be negative');
      return;
    }

    const budget = currentBudget || {
      id: `budget-${state.currentMonth}`,
      month: state.currentMonth,
      spendingLimit: 0,
      categories: []
    };

    const updatedBudget: MonthBudget = {
      ...budget,
      spendingLimit: limit
    };

    updateBudget(updatedBudget);
    setShowSpendingLimitEdit(false);
  };

  const freeMoney = currentBudget ? calculateFreeMoney(currentBudget) : 0;
  const totalAllocated = currentBudget ? currentBudget.categories.reduce((sum, cat) => sum + cat.allocated, 0) : 0;
  const totalSpent = currentBudget ? currentBudget.categories.reduce((sum, cat) => sum + cat.spent, 0) : 0;
  const isOverAllocated = currentBudget && totalAllocated > currentBudget.spendingLimit;

  if (state.loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div>
      <h1 className="font-bold font-large mb-2">Budget Tracker</h1>

      <MonthPicker
        currentMonth={state.currentMonth}
        onMonthChange={setCurrentMonth}
      />

      {/* Spending Limit */}
      <div className="card">
        <div className="flex flex-between align-center mb-1">
          <h2 className="font-bold">Monthly Limit</h2>
          <button
            className="button-secondary"
            style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
            onClick={() => setShowSpendingLimitEdit(!showSpendingLimitEdit)}
          >
            Edit
          </button>
        </div>

        {showSpendingLimitEdit ? (
          <div>
            <div className="flex gap-1 align-center">
              <input
                type="number"
                className="input"
                value={spendingLimit}
                onChange={(e) => setSpendingLimit(e.target.value)}
                placeholder="0"
                min="0"
                step="0.01"
              />
              <button className="button" onClick={handleSaveSpendingLimit}>
                Save
              </button>
            </div>
          </div>
        ) : (
          <div className="font-large">
            {formatCurrency(currentBudget?.spendingLimit || 0)}
          </div>
        )}

        {isOverAllocated && (
          <div className="warning mt-1">
            ⚠️ You've allocated {formatCurrency(totalAllocated - (currentBudget?.spendingLimit || 0))} more than your limit
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="card">
        <h2 className="font-bold mb-1">Summary</h2>
        <div className="flex flex-between mb-1">
          <span>Total Allocated:</span>
          <span className="font-bold">{formatCurrency(totalAllocated)}</span>
        </div>
        <div className="flex flex-between mb-1">
          <span>Total Spent:</span>
          <span className="font-bold">{formatCurrency(totalSpent)}</span>
        </div>
        <div className="flex flex-between">
          <span>Free Money:</span>
          <span className={`font-bold ${freeMoney < 0 ? '' : ''}`}
                style={{ color: freeMoney < 0 ? '#dc3545' : '#28a745' }}>
            {formatCurrency(freeMoney)}
          </span>
        </div>
      </div>

      {/* Categories */}
      <div className="flex flex-between align-center mb-2">
        <h2 className="font-bold">Categories</h2>
        <button
          className="button"
          onClick={() => {
            setEditingCategory(undefined);
            setIsModalOpen(true);
          }}
        >
          Add Category
        </button>
      </div>

      {currentBudget && currentBudget.categories.length > 0 ? (
        currentBudget.categories.map(category => (
          <CategoryCard
            key={category.id}
            category={category}
            onEdit={(cat) => {
              setEditingCategory(cat);
              setIsModalOpen(true);
            }}
            onDelete={handleDeleteCategory}
          />
        ))
      ) : (
        <div className="card text-center" style={{ color: '#666' }}>
          <p>No categories yet</p>
          <p style={{ fontSize: '0.9rem' }}>Add your first category to start tracking your budget</p>
        </div>
      )}

      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCategory(undefined);
        }}
        onSave={handleSaveCategory}
        editingCategory={editingCategory}
      />
    </div>
  );
}
