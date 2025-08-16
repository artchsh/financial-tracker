import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context';
import { MonthPicker } from '../components/MonthPicker';
import { CategoryCard } from '../components/CategoryCard';
import { CategoryModal } from '../components/CategoryModal';
import { Category, MonthBudget } from '../types';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const summaryVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5 }
  }
};

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
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.h1 
        className="mb-2 font-large font-bold"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        Budget Tracker
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <MonthPicker
          currentMonth={state.currentMonth}
          onMonthChange={setCurrentMonth}
        />
      </motion.div>

      {/* Spending Limit */}
      <motion.div 
        className="card"
        variants={summaryVariants}
      >
        <div className="flex flex-between mb-1 align-center">
          <h2 className="font-bold">Monthly Limit</h2>
          <motion.button
            className="button button-secondary"
            style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
            onClick={() => setShowSpendingLimitEdit(!showSpendingLimitEdit)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Edit spending limit"
          >
            <i className="fas fa-pencil-alt"></i>
          </motion.button>
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
          <div className="mt-1 warning">
            <i className="fas fa-exclamation-triangle"></i> You've allocated {formatCurrency(totalAllocated - (currentBudget?.spendingLimit || 0))} more than your limit
          </div>
        )}
      </motion.div>

      {/* Summary */}
      <motion.div 
        className="card"
        variants={summaryVariants}
      >
        <h2 className="mb-1 font-bold">Summary</h2>
        <div className="flex flex-between mb-1">
          <span>Total Allocated:</span>
          <span className="font-bold">{formatCurrency(totalAllocated)}</span>
        </div>
        <div className="flex flex-between mb-1">
          <span>Total Spent:</span>
          <span className="font-bold">{formatCurrency(totalSpent)}</span>
        </div>
        <div className="flex flex-between mb-1">
          <span>Left:</span>
          <span className={`font-bold ${freeMoney < 0 ? '' : ''}`}
                style={{ color: freeMoney < 0 ? '#dc3545' : '#28a745' }}>
            {formatCurrency(freeMoney)}
          </span>
        </div>
        <div className="flex flex-between">
          <span>Free Money:</span>
          <span className={`font-bold`}
                style={{ 
                  color: (() => {
                    const limit = currentBudget?.spendingLimit || 0;
                    const freeMoneyNew = limit - totalAllocated;
                    const ratio = limit > 0 ? freeMoneyNew / limit : 0;
                    if (ratio < 0.1) return '#dc3545'; // Red when less than 10%
                    if (ratio < 0.3) return '#fd7e14'; // Orange when less than 30%
                    return '#28a745'; // Green when 30% or more
                  })()
                }}>
            {formatCurrency((currentBudget?.spendingLimit || 0) - totalAllocated)}
          </span>
        </div>
      </motion.div>

      {/* Categories */}
      <motion.div 
        className="flex flex-between mb-2 align-center"
        variants={summaryVariants}
      >
        <h2 className="font-bold">Categories</h2>
        <motion.button
          className="button"
          onClick={() => {
            setEditingCategory(undefined);
            setIsModalOpen(true);
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Add Category
        </motion.button>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
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
          <motion.div 
            className="text-center card" 
            style={{ color: '#666' }}
            variants={summaryVariants}
          >
            <p>No categories yet</p>
            <p style={{ fontSize: '0.9rem' }}>Add your first category to start tracking your budget</p>
          </motion.div>
        )}
      </motion.div>

      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCategory(undefined);
        }}
        onSave={handleSaveCategory}
        editingCategory={editingCategory}
      />
    </motion.div>
  );
}
