import React from 'react';
import { useApp } from '../context';

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
    // In a real router setup, you'd navigate to the main page
    // For now, we'll just switch the current month
  };

  if (state.loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div>
      <h1 className="mb-2 font-large font-bold">Budget History</h1>

      {sortedBudgets.length === 0 ? (
        <div className="text-center card" style={{ color: '#666' }}>
          <p>No budget history yet</p>
          <p style={{ fontSize: '0.9rem' }}>Start creating budgets to see your history here</p>
        </div>
      ) : (
        <div>
          <p style={{ color: '#666', marginBottom: '1rem' }}>
            Showing {sortedBudgets.length} month{sortedBudgets.length !== 1 ? 's' : ''}
          </p>

          {sortedBudgets.map(budget => {
            const { totalAllocated, totalSpent, freeMoney } = getBudgetSummary(budget);
            const isCurrentMonth = budget.month === state.currentMonth;

            return (
              <div 
                key={budget.month} 
                className="card"
                style={{ 
                  border: isCurrentMonth ? '2px solid #000' : '1px solid #e0e0e0',
                  cursor: 'pointer'
                }}
                onClick={() => handleViewMonth(budget.month)}
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
                  <div className="flex flex-between" style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>
                    <span>Free Money:</span>
                    <span style={{ color: freeMoney < 0 ? '#dc3545' : '#28a745' }}>
                      {formatCurrency(freeMoney)}
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
                            textShadow: '0 1px 2px rgba(0,0,0,0.5)'
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
              </div>
            );
          })}
        </div>
      )}

      {/* Storage Info */}
      <div className="card" style={{ marginTop: '2rem', fontSize: '0.9rem', color: '#666' }}>
        <div className="text-center">
          <div>📊 History retention: {state.settings.historyRetentionMonths} months</div>
          {sortedBudgets.length > 0 && (
            <div className="mt-1">
              Oldest: {formatMonth(sortedBudgets[sortedBudgets.length - 1].month)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
