import React from 'react';
import { motion } from 'framer-motion';
import { Dropdown } from '@/components/Dropdown';
import { cardVariants } from '@/utils/animations';

type Option = { value: string; label: string };

interface CurrencyCardProps {
  value: string;
  options: Option[];
  onChange: (code: string) => void;
}

export default function CurrencyCard({ value, options, onChange }: CurrencyCardProps) {
  return (
    <motion.div className="card" variants={cardVariants}>
      <h3 className="card-title mb-2">Currency</h3>
      <div className="form-group">
        <label className="form-label">Display Currency</label>
        <Dropdown options={options} value={value} onChange={onChange} />
      </div>
    </motion.div>
  );
}
