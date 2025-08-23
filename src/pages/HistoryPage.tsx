import React from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context';

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
      <motion.h1 
        className="mb-2 font-large font-bold"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        Budget History
      </motion.h1>

      {sortedBudgets.length === 0 ? (
        <motion.div 
          className="text-center card" 
          style={{ color: '#666' }}
          variants={cardVariants}
        >
          <p>No budget history yet</p>
          <p style={{ fontSize: '0.9rem' }}>Start creating budgets to see your history here</p>
        </motion.div>
      ) : (
        <div>
          <motion.p 
            style={{ color: '#666', marginBottom: '1rem' }}
            variants={cardVariants}
          >
            Showing {sortedBudgets.length} month{sortedBudgets.length !== 1 ? 's' : ''}
          </motion.p>

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
                <div className="flex flex-between mb-1 align-center">
                  <h2 className="font-bold">
                    {formatMonth(budget.month)}
                    {isCurrentMonth && (
                      <span style={{ 
                        fontSize: '0.8rem', 
                        color: '#666', 
                        fontWeight: 'normal',
                        marginLeft: '0.5rem'
                      }}>
                        (Current)
                      </span>
                    )}
                  </h2>
                  <span style={{ fontSize: '0.9rem', color: '#666' }}>
                    {budget.categories.length} categor{budget.categories.length !== 1 ? 'ies' : 'y'}
                  </span>
                </div>

                <div className="mb-1">
                  <div className="flex flex-between" style={{ fontSize: '0.9rem' }}>
                    <span>Limit:</span>
                    <span>{formatCurrency(budget.spendingLimit)}</span>
                  </div>
                  <div className="flex flex-between" style={{ fontSize: '0.9rem' }}>
                    <span>Allocated:</span>
                    <span>{formatCurrency(totalAllocated)}</span>
                  </div>
                  <div className="flex flex-between" style={{ fontSize: '0.9rem' }}>
                    <span>Spent:</span>
                    <span>{formatCurrency(totalSpent)}</span>
                  </div>
                  <div className="flex flex-between" style={{ fontSize: '0.9rem' }}>
                    <span>Left:</span>
                    <span style={{ color: freeMoney < 0 ? '#dc3545' : '#28a745' }}>
                      {formatCurrency(freeMoney)}
                    </span>
                  </div>
                  <div className="flex flex-between" style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>
                    <span>Free Money:</span>
                    <span style={{ 
                      color: (() => {
                        const freeMoneyNew = budget.spendingLimit - totalAllocated;
                        const ratio = budget.spendingLimit > 0 ? freeMoneyNew / budget.spendingLimit : 0;
                        if (ratio < 0.1) return '#dc3545'; // Red when less than 10%
                        if (ratio < 0.3) return '#fd7e14'; // Orange when less than 30%
                        return '#28a745'; // Green when 30% or more
                      })()
                    }}>
                      {formatCurrency(budget.spendingLimit - totalAllocated)}
                    </span>
                  </div>
                </div>

                {budget.categories.length > 0 && (
                  <div>
                    <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem' }}>
                      Categories:
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                      {budget.categories.slice(0, 5).map((cat: any) => (
                        <span
                          key={cat.id}
                          style={{
                            fontSize: '0.8rem',
                            padding: '0.2rem 0.4rem',
                            backgroundColor: cat.color,
                            color: '#fff',
                            borderRadius: '12px',
                          }}
                        >
                          {cat.name}
                        </span>
                      ))}
                      {budget.categories.length > 5 && (
                        <span style={{
                          fontSize: '0.8rem',
                          padding: '0.2rem 0.4rem',
                          backgroundColor: '#ccc',
                          color: '#666',
                          borderRadius: '12px'
                        }}>
                          +{budget.categories.length - 5} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Storage Info */}
      <motion.div 
        className="card" 
        style={{ marginTop: '2rem', fontSize: '0.9rem', color: '#666' }}
        variants={cardVariants}
      >
        <div className="text-center">
          <div>📊 History retention: {state.settings.historyRetentionMonths} months</div>
          {sortedBudgets.length > 0 && (
            <div className="mt-1">
              Oldest: {formatMonth(sortedBudgets[sortedBudgets.length - 1].month)}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
