import React from 'react';
import { motion } from 'framer-motion';
import { Dropdown } from '@/components/Dropdown';
import { cardVariants } from '@/utils/animations';

type Option = { value: string; label: string };

interface HistoryRetentionCardProps {
  value: string;
  options: Option[];
  onChange: (val: number) => void;
  currentCount: number;
}

export default function HistoryRetentionCard({ value, options, onChange, currentCount }: HistoryRetentionCardProps) {
  return (
    <motion.div className="card" variants={cardVariants}>
      <h3 className="card-title mb-2">History Retention</h3>
      <div className="form-group">
        <label className="form-label">Keep history for</label>
        <Dropdown options={options} value={value} onChange={(v) => onChange(parseInt(v))} />
      </div>
      <p className="form-description mt-2">
        Currently storing {currentCount} month{currentCount !== 1 ? 's' : ''} of data
      </p>
    </motion.div>
  );
}
