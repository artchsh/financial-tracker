import React from 'react';
import { motion } from 'framer-motion';
import { Edit3, AlertTriangle } from 'lucide-react';

const summaryVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25 }
  }
};

interface MonthlyLimitCardProps {
  value: number;
  isOverAllocated: boolean;
  totalAllocated: number;
  onToggleEdit: () => void;
  onSave: () => void;
  editing: boolean;
  input: string;
  setInput: (v: string) => void;
  formatCurrency: (n: number) => string;
}

export default function MonthlyLimitCard({
  value,
  isOverAllocated,
  totalAllocated,
  onToggleEdit,
  onSave,
  editing,
  input,
  setInput,
  formatCurrency,
}: MonthlyLimitCardProps) {
  return (
    <motion.div className="card" variants={summaryVariants}>
      <div className="card-header">
        <h3 className="card-title">Monthly Limit</h3>
        <motion.button
          className="btn-icon"
          onClick={onToggleEdit}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title="Edit spending limit"
        >
          <Edit3 size={18} />
        </motion.button>
      </div>

      <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.18 }}>
        {editing ? (
          <motion.div
            key="edit"
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            <div className="flex items-center gap-2">
              <input
                type="number"
                className="input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="0"
                min="0"
                step="0.01"
              />
              <button className="button btn-sm" onClick={onSave}>Save</button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="view"
            layout
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18 }}
            className="text-2xl font-bold"
          >
            {formatCurrency(value || 0)}
          </motion.div>
        )}
      </motion.div>

      {isOverAllocated && (
        <div className="warning mt-2">
          <AlertTriangle size={16} className="inline mr-1" style={{ verticalAlign: 'text-bottom' }} />
          Over-allocated by {formatCurrency(totalAllocated - (value || 0))}
        </div>
      )}
    </motion.div>
  );
}
