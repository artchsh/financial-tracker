import React from 'react';
import { motion } from 'framer-motion';
import { Dropdown } from '@/components/Dropdown';
import { cardVariants } from '@/utils/animations';

type Option = { value: string; label: string };

export default function CurrencyCard({
  value,
  options,
  onChange,
}: {
  value: string;
  options: Option[];
  onChange: (code: string) => void;
}) {
  return (
    <motion.div className="card" variants={cardVariants}>
      <h2 className="mb-1 font-bold">Currency</h2>
      <div className="form-group">
        <label className="form-label">Display Currency</label>
        <Dropdown options={options} value={value} onChange={onChange} />
      </div>
    </motion.div>
  );
}
