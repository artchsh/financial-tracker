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
    scale: 1.01,
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

function getProgressBarClass(spentPercentage: number, isOverspent: boolean): string {
  if (isOverspent) return 'danger';
  if (spentPercentage > 80) return 'warning';
  return 'success';
}

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
      <div className="card-header mb-2">
        <div className="flex items-center gap-2">
          <span
            className="flex-shrink-0"
            style={{
              width: '12px',
              height: '12px',
              backgroundColor: category.color,
              borderRadius: '50%'
            }}
          />
          <h3 className="card-title">{category.name}</h3>
        </div>
        <ActionMenu items={actionItems} />
      </div>

      <div className="card-content">
        <div className="data-row">
          <span className="data-row-label">Allocated</span>
          <motion.span 
            className="data-row-value"
            key={category.allocated}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.15 }}
          >
            {formatCurrency(category.allocated)}
          </motion.span>
        </div>
        <div className="data-row">
          <span className="data-row-label">Spent</span>
          <motion.span 
            className={`data-row-value ${isOverspent ? 'text-danger' : ''}`}
            key={category.spent}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.15 }}
          >
            {formatCurrency(category.spent)}
          </motion.span>
        </div>
        <div className="data-row">
          <span className="data-row-label">Remaining</span>
          <motion.span 
            className={`data-row-value font-bold ${remaining < 0 ? 'text-danger' : 'text-success'}`}
            key={remaining}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.15 }}
          >
            {formatCurrency(remaining)}
          </motion.span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="progress-bar">
        <motion.div
          className={`progress-bar-fill ${getProgressBarClass(spentPercentage, isOverspent)}`}
          variants={progressVariants}
          initial="initial"
          animate="animate"
          custom={Math.min(spentPercentage, 100)}
        />
      </div>
    </motion.div>
  );
}
