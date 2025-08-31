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
}: {
  value: number;
  isOverAllocated: boolean;
  totalAllocated: number;
  onToggleEdit: () => void;
  onSave: () => void;
  editing: boolean;
  input: string;
  setInput: (v: string) => void;
  formatCurrency: (n: number) => string;
}) {
  return (
    <motion.div className="card" variants={summaryVariants}>
      <div className="flex justify-between align-center">
        <h2 className="font-bold">Monthly Limit</h2>
        <motion.button
          className="button"
          style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', background: 'none', color: 'black' }}
          onClick={onToggleEdit}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title="Edit spending limit"
        >
          <Edit3 size={16} />
        </motion.button>
      </div>

      <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.18 }}>
        {editing ? (
          <motion.div
            key="edit"
            layout
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 0 }}
            transition={{ duration: 0.18 }}
          >
            <div className="flex items-center gap-1">
              <input
                type="number"
                className="input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="0"
                min="0"
                step="0.01"
              />
              <button className="button" onClick={onSave}>Save</button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="view"
            layout
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18 }}
            className="font-large"
          >
            {formatCurrency(value || 0)}
          </motion.div>
        )}
      </motion.div>

      {isOverAllocated && (
        <div className="mt-1 warning">
          <AlertTriangle size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
          You've allocated {formatCurrency(totalAllocated - (value || 0))} more than your limit
        </div>
      )}
    </motion.div>
  );
}
