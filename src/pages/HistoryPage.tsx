import React from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context';
import { LucideCalendarClock } from 'lucide-react';
import TopHeader from '@/components/top-header';
import { GroupItem } from '@/components/cards/summary-card';
import CategoryTag from '@/components/tags/category-tag';

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

  const formatMonth = (monthKey: string): string => {
    const [year, month] = monthKey.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
  };

  const getBudgetSummary = (budget: any) => {
    const totalAllocated = budget.categories.reduce((sum: number, cat: any) => sum + cat.allocated, 0);
    const totalSpent = budget.categories.reduce((sum: number, cat: any) => sum + cat.spent, 0);
    const freeMoney = calculateFreeMoney(budget);

    return { totalAllocated, totalSpent, freeMoney };
  };

  const getFreeMoneyCssClass = (limit: number, allocated: number) => {
    const freeMoneyNew = limit - allocated;
    const ratio = limit > 0 ? freeMoneyNew / limit : 0;
    if (ratio < 0.1) return 'text-danger'; // Red when less than 10%
    if (ratio < 0.3) return 'text-warning-orange'; // Orange when less than 30%
    return 'text-success'; // Green when 30% or more
  };

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
            {sortedBudgets.map((budget, index) => {
              const { totalAllocated, totalSpent, freeMoney } = getBudgetSummary(budget);
              const isCurrentMonth = budget.month === state.currentMonth;

              return (
                <motion.div
                  key={budget.month}
                  className="card"
                  style={{
                    border: isCurrentMonth ? '1px solid #aaa' : '1px solid #e0e0e0',
                    cursor: 'pointer'
                  }}
                  onClick={() => handleViewMonth(budget.month)}
                  variants={cardVariants}
                  whileHover={{
                    scale: 1.02,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    transition: { duration: 0.1 }
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex justify-between items-center">
                    <h2 className="font-bold">
                      {formatMonth(budget.month)}
                      {isCurrentMonth && (
                        <span style={{
                          fontSize: '0.8rem',
                          color: 'var(--color-text-muted)',
                          fontWeight: 'normal',
                          marginLeft: '0.5rem'
                        }}>
                          (Current)
                        </span>
                      )}
                    </h2>
                    <span style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                      {budget.categories.length} categor{budget.categories.length !== 1 ? 'ies' : 'y'}
                    </span>
                  </div>

                  <div className="flex flex-col gap-0.5">
                    <GroupItem
                      label="Spent/Allocated:"
                      value={`${formatCurrency(totalSpent)}/${formatCurrency(totalAllocated)}`}
                    />
                    <GroupItem
                      label="Left:"
                      value={formatCurrency(freeMoney)}
                    />
                    <GroupItem
                      label="Unallocated money:"
                      value={formatCurrency(budget.spendingLimit - totalAllocated)}
                    />

                  </div>

                  {budget.categories.length > 0 && (

                      <motion.div layout className='flex flex-wrap gap-1'>
                        {budget.categories.slice(0, 5).map((cat: any) => (
                          <CategoryTag key={cat.id} value={cat.name} color={cat.color}  />
                        ))}
                        {budget.categories.length > 5 && (
                          <CategoryTag value={`+${budget.categories.length - 5} more`}  />
                        )}
                      </motion.div>
       
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
