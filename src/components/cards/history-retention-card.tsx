import React from 'react';
import { motion } from 'framer-motion';
import { Dropdown } from '@/components/Dropdown';
import { cardVariants } from '@/utils/animations';

type Option = { value: string; label: string };

export default function HistoryRetentionCard({
  value,
  options,
  onChange,
  currentCount,
}: {
  value: string;
  options: Option[];
  onChange: (val: number) => void;
  currentCount: number;
}) {
  return (
    <motion.div className="card" variants={cardVariants}>
      <h2 className="mb-1 font-bold">History</h2>
      <div className="form-group">
        <label className="form-label">Keep history for (months)</label>
        <Dropdown options={options} value={value} onChange={(v) => onChange(parseInt(v))} />
      </div>
      <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginTop: '0.5rem' }}>
        Currently storing {currentCount} month{currentCount !== 1 ? 's' : ''} of data
      </p>
    </motion.div>
  );
}
