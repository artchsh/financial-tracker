import { MonthBudget } from '@/types';

export function getFreeMoneyCssClass(limit: number, allocated: number) {
  const freeMoneyNew = limit - allocated;
  const ratio = limit > 0 ? freeMoneyNew / limit : 0;
  if (ratio < 0.1) return 'text-danger';
  if (ratio < 0.3) return 'text-warning-orange';
  return 'text-success';
}

export function formatMonth(monthKey: string): string {
  const [year, month] = monthKey.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
}

export function getBudgetSummary(budget: MonthBudget) {
  const totalAllocated = budget.categories.reduce((sum, cat) => sum + cat.allocated, 0);
  const totalSpent = budget.categories.reduce((sum, cat) => sum + cat.spent, 0);
  const freeMoney = budget.spendingLimit - totalAllocated + (totalAllocated - totalSpent);
  return { totalAllocated, totalSpent, freeMoney };
}
