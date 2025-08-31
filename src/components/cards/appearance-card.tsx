import React from 'react';
import { motion } from 'framer-motion';
import { ThemeToggle } from '@/components/ThemeToggle';

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.2 } }
};

export default function AppearanceCard({
  theme,
  onThemeChange,
}: {
  theme: 'light' | 'dark' | 'system';
  onThemeChange: (theme: 'light' | 'dark' | 'system') => void;
}) {
  return (
    <motion.div className="card" variants={cardVariants}>
      <h2 className="mb-1 font-bold">Appearance</h2>
      <div className="form-group">
        <label className="form-label">Theme</label>
        <ThemeToggle theme={theme} onChange={onThemeChange} />
      </div>
    </motion.div>
  );
}
