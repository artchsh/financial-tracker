import React from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context';
import TopHeader from '@/components/top-header';
import BudgetHistoryCard from '@/components/cards/budget-history-card';
import { formatMonth } from '@/utils/budget';

const historyVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.15 }
  }
};

export function HistoryPage() {
  const { state, formatCurrency, calculateFreeMoney, setCurrentMonth } = useApp();

  const sortedBudgets = [...state.budgets].sort((a, b) => b.month.localeCompare(a.month));

  const handleViewMonth = (month: string) => {
    setCurrentMonth(month);
  };

  if (state.loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <motion.div
      variants={historyVariants}
      initial="hidden"
      animate="visible"
    >
      <TopHeader title="Budget History" />

      {sortedBudgets.length === 0 ? (
        <motion.div className="card empty-state" variants={cardVariants}>
          <p className="empty-state-title">No budget history yet</p>
          <p className="empty-state-description">Start creating budgets to see your history here</p>
        </motion.div>
      ) : (
        <div className="flex flex-col gap-3">
          <motion.p className="text-secondary text-sm" variants={cardVariants}>
            Showing {sortedBudgets.length} month{sortedBudgets.length !== 1 ? 's' : ''}
          </motion.p>

          <motion.div layout className="flex flex-col gap-2">
            {sortedBudgets.map((budget) => (
              <BudgetHistoryCard
                key={budget.month}
                budget={budget}
                isCurrent={budget.month === state.currentMonth}
                onClick={() => handleViewMonth(budget.month)}
                formatMonth={formatMonth}
                formatCurrency={formatCurrency}
                freeMoney={calculateFreeMoney(budget)}
              />
            ))}
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
