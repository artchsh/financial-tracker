import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Category } from '../types';
import { useApp } from '../context';

interface CategoryCardProps {
  category: Category;
  onEdit: (category: Category) => void;
  onDelete: (categoryId: string) => void;
}

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: {
      type: 'spring' as const,
      damping: 20,
      stiffness: 300
    }
  },
  hover: {
    scale: 1.02,
    transition: {
      type: 'spring' as const,
      damping: 20,
      stiffness: 400
    }
  }
};

const actionsVariants = {
  hidden: { 
    opacity: 0, 
    height: 0,
    transition: {
      duration: 0.2
    }
  },
  visible: { 
    opacity: 1, 
    height: 'auto',
    transition: {
      duration: 0.3,
      ease: 'easeOut' as const
    }
  }
};

const progressVariants = {
  initial: { width: 0 },
  animate: (width: number) => ({
    width: `${width}%`,
    transition: {
      duration: 0.8,
      ease: 'easeOut' as const
    }
  })
};

export function CategoryCard({ category, onEdit, onDelete }: CategoryCardProps) {
  const { formatCurrency } = useApp();
  const [showActions, setShowActions] = useState(false);

  const remaining = category.allocated - category.spent;
  const isOverspent = category.spent > category.allocated;
  const spentPercentage = category.allocated > 0 ? (category.spent / category.allocated) * 100 : 0;

  return (
    <motion.div 
      className="card"
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      layout
    >
      <div className="flex flex-between mb-1 align-center">
        <div className="flex gap-1 align-center">
          <motion.div
            style={{
              width: '12px',
              height: '12px',
              backgroundColor: category.color,
              borderRadius: '50%'
            }}
            whileHover={{ scale: 1.2 }}
            transition={{ duration: 0.2 }}
          />
          <h3 className="font-bold">{category.name}</h3>
        </div>
        <motion.button
          className="button button-secondary"
          style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
          onClick={() => setShowActions(!showActions)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          animate={{ rotate: showActions ? 90 : 0 }}
          transition={{ duration: 0.2 }}
        >
          ⋯
        </motion.button>
      </div>

      <AnimatePresence>
        {showActions && (
          <motion.div 
            className="flex gap-1 mb-2"
            variants={actionsVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <motion.button
              className="button button-secondary"
              style={{ padding: '0.5rem', fontSize: '0.8rem', flex: 1 }}
              onClick={() => {
                onEdit(category);
                setShowActions(false);
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Edit
            </motion.button>
            <motion.button
              className="button button-danger"
              style={{ padding: '0.5rem', fontSize: '0.8rem', flex: 1 }}
              onClick={() => {
                if (window.confirm(`Delete category "${category.name}"?`)) {
                  onDelete(category.id);
                }
                setShowActions(false);
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Delete
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div className="mb-1" layout>
        <div className="flex flex-between mb-1">
          <span>Allocated:</span>
          <motion.span 
            className="font-bold"
            key={category.allocated}
            initial={{ scale: 1.2, color: '#000' }}
            animate={{ scale: 1, color: '#000' }}
            transition={{ duration: 0.3 }}
          >
            {formatCurrency(category.allocated)}
          </motion.span>
        </div>
        <div className="flex flex-between mb-1">
          <span>Spent:</span>
          <motion.span 
            className={isOverspent ? 'font-bold' : ''}
            style={{ color: isOverspent ? '#dc3545' : 'inherit' }}
            key={category.spent}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            {formatCurrency(category.spent)}
          </motion.span>
        </div>
        <div className="flex flex-between">
          <span>Remaining:</span>
          <motion.span 
            className={`font-bold ${remaining < 0 ? '' : ''}`}
            style={{ color: remaining < 0 ? '#dc3545' : '#28a745' }}
            key={remaining}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            {formatCurrency(remaining)}
          </motion.span>
        </div>
      </motion.div>

      {/* Progress Bar */}
      <div style={{
        width: '100%',
        height: '8px',
        backgroundColor: '#e0e0e0',
        borderRadius: '4px',
        overflow: 'hidden'
      }}>
        <motion.div
          style={{
            height: '100%',
            backgroundColor: isOverspent ? '#dc3545' : spentPercentage > 80 ? '#ffc107' : '#28a745',
          }}
          variants={progressVariants}
          initial="initial"
          animate="animate"
          custom={Math.min(spentPercentage, 100)}
        />
      </div>
    </motion.div>
  );
}
