import React from 'react';
import { motion } from 'framer-motion';
import { Edit2, Trash2 } from 'lucide-react';
import { Category } from '../types';
import { useApp } from '../context';
import { ActionMenu } from './ActionMenu';

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

const progressVariants = {
  initial: { width: 0 },
  animate: (width: number) => ({
    width: `${width}%`,
    transition: {
      duration: 0.4,
      ease: 'easeOut' as const
    }
  })
};

export function CategoryCard({ category, onEdit, onDelete }: CategoryCardProps) {
  const { formatCurrency } = useApp();

  const remaining = category.allocated - category.spent;
  const isOverspent = category.spent > category.allocated;
  const spentPercentage = category.allocated > 0 ? (category.spent / category.allocated) * 100 : 0;

  const actionItems = [
    {
      key: 'edit',
      label: 'Edit',
      icon: <Edit2 size={16} />,
      onClick: () => onEdit(category)
    },
    {
      key: 'delete',
      label: 'Delete',
      icon: <Trash2 size={16} />,
      variant: 'danger' as const,
      onClick: () => {
        if (window.confirm(`Delete category "${category.name}"?`)) {
          onDelete(category.id);
        }
      }
    }
  ];

  return (
    <motion.div 
      className="card"
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      layout
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-1">
          <motion.div
            style={{
              width: '12px',
              height: '12px',
              backgroundColor: category.color,
              borderRadius: '50%'
            }}
            whileHover={{ scale: 1.2 }}
            transition={{ duration: 0.1 }}
          />
          <h3 className="font-bold">{category.name}</h3>
        </div>
        <ActionMenu items={actionItems} />
      </div>

      <motion.div className="flex flex-col gap-1" layout>
        <div className="flex justify-between">
          <span>Allocated:</span>
          <motion.span 
            className="font-bold"
            key={category.allocated}
            initial={{ scale: 1.2, color: '#000' }}
            animate={{ scale: 1, color: '#000' }}
            transition={{ duration: 0.15 }}
          >
            {formatCurrency(category.allocated)}
          </motion.span>
        </div>
        <div className="flex justify-between">
          <span>Spent:</span>
          <motion.span 
            className={`${isOverspent ? 'font-bold text-danger' : ''}`}
            key={category.spent}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.15 }}
          >
            {formatCurrency(category.spent)}
          </motion.span>
        </div>
        <div className="flex justify-between">
          <span>Remaining:</span>
          <motion.span 
            className={`font-bold ${remaining < 0 ? 'text-danger' : 'text-success'}`}
            key={remaining}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.15 }}
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
