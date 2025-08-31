import React from 'react';
import { motion } from 'framer-motion';
import CategoryTag from '@/components/tags/category-tag';
import { MonthBudget } from '@/types';

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.15 } }
};

export default function BudgetHistoryCard({
  budget,
  isCurrent,
  onClick,
  formatMonth,
  formatCurrency,
  freeMoney,
}: {
  budget: MonthBudget;
  isCurrent: boolean;
  onClick: () => void;
  formatMonth: (m: string) => string;
  formatCurrency: (n: number) => string;
  freeMoney: number;
}) {
  const totalAllocated = budget.categories.reduce((sum, cat) => sum + cat.allocated, 0);
  const totalSpent = budget.categories.reduce((sum, cat) => sum + cat.spent, 0);

  return (
    <motion.div
      className="card"
      style={{ border: isCurrent ? '1px solid #aaa' : '1px solid #e0e0e0', cursor: 'pointer' }}
      onClick={onClick}
      variants={cardVariants}
      whileHover={{ scale: 1.02, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', transition: { duration: 0.1 } }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex justify-between items-center">
        <h2 className="font-bold">
          {formatMonth(budget.month)}
          {isCurrent && (
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 'normal', marginLeft: '0.5rem' }}>
              (Current)
            </span>
          )}
        </h2>
        <span style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
          {budget.categories.length} categor{budget.categories.length !== 1 ? 'ies' : 'y'}
        </span>
      </div>

      <div className="flex flex-col gap-0.5">
        <div className="flex justify-between">
          <span className="text-muted">Spent/Allocated:</span>
          <span>{`${formatCurrency(totalSpent)}/${formatCurrency(totalAllocated)}`}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted">Left:</span>
          <span className={freeMoney < 0 ? 'text-danger' : 'text-success'}>{formatCurrency(freeMoney)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted">Unallocated money:</span>
          <span>{formatCurrency(budget.spendingLimit - totalAllocated)}</span>
        </div>
      </div>

      {budget.categories.length > 0 && (
        <motion.div layout className='flex flex-wrap gap-1'>
          {budget.categories.slice(0, 5).map(cat => (
            <CategoryTag key={cat.id} value={cat.name} color={cat.color} />
          ))}
          {budget.categories.length > 5 && (
            <CategoryTag value={`+${budget.categories.length - 5} more`} />
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
