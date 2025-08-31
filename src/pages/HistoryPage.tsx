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
      staggerChildren: 0.1
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
        <motion.div
          className="text-muted text-center card"
          variants={cardVariants}
        >
          <p>No budget history yet</p>
          <p style={{ fontSize: '0.9rem' }}>Start creating budgets to see your history here</p>
        </motion.div>
      ) : (
        <div>
          <motion.p
            className="text-muted"
            style={{ marginBottom: '1rem' }}
            variants={cardVariants}
          >
            Showing {sortedBudgets.length} month{sortedBudgets.length !== 1 ? 's' : ''}
          </motion.p>

          <motion.div layout className='flex flex-col gap-1'>
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
