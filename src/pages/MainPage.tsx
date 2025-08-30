import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Edit3, AlertTriangle, LucideDiamondPlus } from 'lucide-react';
import { useApp } from '../context';
import { Category, MonthBudget } from '../types';
import { CategoryCard } from '../components/CategoryCard';
import { CategoryModal } from '../components/CategoryModal';
import { MonthPicker } from '../components/MonthPicker';
import SummaryCard from '@/components/cards/summary-card';
import TopHeader from '@/components/top-header';

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
    transition: { duration: 0.25 }
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

  const getFreeMoneyCssClass = (limit: number, allocated: number) => {
    const freeMoneyNew = limit - allocated;
    const ratio = limit > 0 ? freeMoneyNew / limit : 0;
    if (ratio < 0.1) return 'text-danger'; // Red when less than 10%
    if (ratio < 0.3) return 'text-warning-orange'; // Orange when less than 30%
    return 'text-success'; // Green when 30% or more
  };

  if (state.loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <TopHeader title='Budget Tracker' />


      {/* Spending, Summary and Categories sections */}
      <motion.div layout className='flex flex-col gap-2'>

        {/* Spending and Summary sections */}
        <motion.div layout className='flex flex-col gap-1'>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.25 }}
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
            <div className="flex justify-between align-center">
              <h2 className="font-bold">Monthly Limit</h2>
              <motion.button
                className="button"
                style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', background: 'none', color: 'black' }}
                onClick={() => setShowSpendingLimitEdit(!showSpendingLimitEdit)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Edit spending limit"
              >
                <Edit3 size={16} />
              </motion.button>
            </div>

            <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.18 }}>
              {showSpendingLimitEdit ? (
                <motion.div
                  key="edit"
                  layout
                  initial={{ opacity: 0, y: 0 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 0 }}
                  transition={{ duration: 0.18 }}
                >
                  <div className="flex items-center gap-1">
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
                </motion.div>
              ) : (
                <motion.div
                  key="view"
                  layout
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.18 }}
                  className="font-large"
                >
                  {formatCurrency(currentBudget?.spendingLimit || 0)}
                </motion.div>
              )}
            </motion.div>

            {isOverAllocated && (
              <div className="mt-1 warning">
                <AlertTriangle size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                You've allocated {formatCurrency(totalAllocated - (currentBudget?.spendingLimit || 0))} more than your limit
              </div>
            )}
          </motion.div>

          {/* Summary */}
          <SummaryCard
            totalAllocated={totalAllocated}
            totalSpent={totalSpent}
            currentBudget={currentBudget}
            formatCurrency={formatCurrency}
            getFreeMoneyCssClass={getFreeMoneyCssClass}
            freeMoney={freeMoney}
          />
        </motion.div>

        {/* Categories */}
        <motion.div layout className='flex flex-col gap-1'>
          <motion.div
            className="flex justify-between align-center"
            variants={summaryVariants}
          >
            <h2 className="font-bold">Categories</h2>
            <motion.button
              className="button button-ghost"
              style={{ padding: "0.4rem" }}
              onClick={() => {
                setEditingCategory(undefined);
                setIsModalOpen(true);
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <LucideDiamondPlus />
            </motion.button>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className='flex flex-col gap-2'
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
                className="text-muted text-center card"
                variants={summaryVariants}
              >
                <p>No categories yet</p>
                <p style={{ fontSize: '0.9rem' }}>Add your first category to start tracking your budget</p>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
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
