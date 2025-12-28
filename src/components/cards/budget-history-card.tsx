import React from 'react';
import { motion } from 'framer-motion';
import CategoryTag from '@/components/tags/category-tag';
import { MonthBudget } from '@/types';

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.15 } }
};

interface BudgetHistoryCardProps {
  budget: MonthBudget;
  isCurrent: boolean;
  onClick: () => void;
  formatMonth: (m: string) => string;
  formatCurrency: (n: number) => string;
  freeMoney: number;
}

export default function BudgetHistoryCard({
  budget,
  isCurrent,
  onClick,
  formatMonth,
  formatCurrency,
  freeMoney,
}: BudgetHistoryCardProps) {
  const totalAllocated = budget.categories.reduce((sum, cat) => sum + cat.allocated, 0);
  const totalSpent = budget.categories.reduce((sum, cat) => sum + cat.spent, 0);

  return (
    <motion.div
      className={`card card-clickable ${isCurrent ? 'card-highlight' : ''}`}
      onClick={onClick}
      variants={cardVariants}
      whileHover={{ scale: 1.01, transition: { duration: 0.1 } }}
      whileTap={{ scale: 0.99 }}
    >
      <div className="card-header mb-2">
        <div className="flex items-center gap-2">
          <h3 className="card-title">{formatMonth(budget.month)}</h3>
          {isCurrent && <span className="tag tag-current">Current</span>}
        </div>
        <span className="text-sm text-secondary">
          {budget.categories.length} {budget.categories.length === 1 ? 'category' : 'categories'}
        </span>
      </div>

      <div className="card-content">
        <div className="data-row">
          <span className="data-row-label">Spent / Allocated</span>
          <span className="data-row-value">{formatCurrency(totalSpent)} / {formatCurrency(totalAllocated)}</span>
        </div>
        <div className="data-row">
          <span className="data-row-label">Remaining</span>
          <span className={`data-row-value ${freeMoney < 0 ? 'text-danger' : 'text-success'}`}>
            {formatCurrency(freeMoney)}
          </span>
        </div>
        <div className="data-row">
          <span className="data-row-label">Unallocated</span>
          <span className="data-row-value">{formatCurrency(budget.spendingLimit - totalAllocated)}</span>
        </div>
      </div>

      {budget.categories.length > 0 && (
        <div className="flex gap-1 mt-2 overflow-x-auto" style={{ paddingBottom: '2px' }}>
          {budget.categories.slice(0, 4).map(cat => (
            <CategoryTag 
              key={cat.id} 
              value={cat.name.length > 10 ? cat.name.substring(0, 8) + '...' : cat.name} 
              color={cat.color} 
            />
          ))}
          {budget.categories.length > 4 && (
            <CategoryTag value={`+${budget.categories.length - 4}`} />
          )}
        </div>
      )}
    </motion.div>
  );
}
