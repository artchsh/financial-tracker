import { MonthBudget } from '@/types';
import { formatMonth } from '@/utils/budget';

export function buildCsvFilename(date: Date = new Date()) {
  return `budget-export-${date.toISOString().split('T')[0]}.csv`;
}

export function buildBackupJsonFilename(date: Date = new Date()) {
  return `financial-tracker-backup-${date.toISOString().split('T')[0]}.json`;
}

function escapeCSVField(field: string): string {
  if (field.includes(',') || field.includes('"') || field.includes('\n')) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}

export function formatBudgetsCsv(budgets: MonthBudget[]): string {
  const headers = ['Month', 'Monthly Limit', 'Category', 'Allocated', 'Spent', 'Remaining', '% Used'];
  const rows: string[][] = [headers];

  if (!budgets || budgets.length === 0) {
    return headers.join(',');
  }

  const sortedBudgets = [...budgets].sort((a, b) => b.month.localeCompare(a.month));

  sortedBudgets.forEach((budget) => {
    const monthName = formatMonth(budget.month);

    if (budget.categories.length === 0) {
      rows.push([
        escapeCSVField(monthName),
        budget.spendingLimit.toString(),
        '',
        '',
        '',
        '',
        ''
      ]);
    } else {
      budget.categories.forEach((category, index) => {
        const remaining = category.allocated - category.spent;
        const percentUsed = category.allocated > 0
          ? Math.round((category.spent / category.allocated) * 100)
          : 0;

        rows.push([
          index === 0 ? escapeCSVField(monthName) : '',
          index === 0 ? budget.spendingLimit.toString() : '',
          escapeCSVField(category.name),
          category.allocated.toString(),
          category.spent.toString(),
          remaining.toString(),
          `${percentUsed}%`
        ]);
      });
    }
  });

  return rows.map(row => row.join(',')).join('\n');
}

export function downloadCsvFile(filename: string, csvContent: string) {
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8' });
  triggerDownload(blob, filename);
}

export function downloadJsonFile(filename: string, jsonString: string) {
  const blob = new Blob([jsonString], { type: 'application/json' });
  triggerDownload(blob, filename);
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
