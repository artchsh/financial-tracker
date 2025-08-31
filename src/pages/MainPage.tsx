import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context';
import { Category, MonthBudget } from '../types';
import SummaryCard from '@/components/cards/summary-card';
import TopHeader from '@/components/top-header';
import MonthlyLimitCard from '@/components/cards/monthly-limit-card';
import CategoriesSection from '@/components/sections/categories-section';
import { MonthPicker } from '@/components/MonthPicker';
import { CategoryModal } from '@/components/CategoryModal';

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
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <TopHeader title='Budget Tracker' />

      <motion.div layout className='flex flex-col gap-2'>
        <motion.div layout className='flex flex-col gap-1'>
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1, duration: 0.25 }}>
            <MonthPicker currentMonth={state.currentMonth} onMonthChange={setCurrentMonth} />
          </motion.div>

          <MonthlyLimitCard
            value={currentBudget?.spendingLimit || 0}
            totalAllocated={totalAllocated}
            isOverAllocated={Boolean(isOverAllocated)}
            editing={showSpendingLimitEdit}
            input={spendingLimit}
            setInput={setSpendingLimit}
            onToggleEdit={() => setShowSpendingLimitEdit(!showSpendingLimitEdit)}
            onSave={handleSaveSpendingLimit}
            formatCurrency={formatCurrency}
          />

          <SummaryCard
            totalAllocated={totalAllocated}
            totalSpent={totalSpent}
            currentBudget={currentBudget}
            formatCurrency={formatCurrency}
            freeMoney={freeMoney}
          />
        </motion.div>

        <CategoriesSection
          categories={currentBudget?.categories || []}
          onAdd={() => {
            setEditingCategory(undefined);
            setIsModalOpen(true);
          }}
          onEdit={(cat) => {
            setEditingCategory(cat);
            setIsModalOpen(true);
          }}
          onDelete={handleDeleteCategory}
        />
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
