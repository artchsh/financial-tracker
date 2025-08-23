import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Category } from '../types';
import { Modal } from './Modal';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (category: Omit<Category, 'id'>) => void;
  editingCategory?: Category;
}

const COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE',
  '#85C1E9', '#F8C471', '#82E0AA', '#F1948A', '#AED6F1'
];

const formVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.15,
      staggerChildren: 0.05
    }
  }
};

const fieldVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.15 }
  }
};

const colorVariants = {
  unselected: { 
    scale: 1,
    // boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  selected: { 
    scale: 1.1,
    // boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
    transition: { duration: 0.1 }
  },
  hover: { 
    scale: 1.05,
    transition: { duration: 0.075 }
  },
  tap: { 
    scale: 0.95,
    transition: { duration: 0.05 }
  }
};

export function CategoryModal({ isOpen, onClose, onSave, editingCategory }: CategoryModalProps) {
  const [name, setName] = useState('');
  const [allocated, setAllocated] = useState('');
  const [spent, setSpent] = useState('');
  const [color, setColor] = useState(COLORS[0]);

  useEffect(() => {
    if (editingCategory) {
      setName(editingCategory.name);
      setAllocated(editingCategory.allocated.toString());
      setSpent(editingCategory.spent.toString());
      setColor(editingCategory.color);
    } else {
      setName('');
      setAllocated('');
      setSpent('0');
      setColor(COLORS[Math.floor(Math.random() * COLORS.length)]);
    }
  }, [editingCategory, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      alert('Please enter a category name');
      return;
    }

    const allocatedNum = parseFloat(allocated) || 0;
    const spentNum = parseFloat(spent) || 0;

    if (allocatedNum < 0 || spentNum < 0) {
      alert('Amounts cannot be negative');
      return;
    }

    onSave({
      name: name.trim(),
      allocated: allocatedNum,
      spent: spentNum,
      color
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingCategory ? 'Edit Category' : 'Add Category'}
    >
      <motion.form 
        onSubmit={handleSubmit}
        variants={formVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="form-group" variants={fieldVariants}>
          <label className="form-label">Category Name</label>
          <motion.input
            type="text"
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Food, Transport"
            autoFocus
            whileFocus={{ scale: 1.02 }}
            transition={{ duration: 0.1 }}
          />
        </motion.div>

        <motion.div className="form-group" variants={fieldVariants}>
          <label className="form-label">Allocated Amount</label>
          <motion.input
            type="number"
            className="input"
            value={allocated}
            onChange={(e) => setAllocated(e.target.value)}
            placeholder="0"
            min="0"
            step="0.01"
            whileFocus={{ scale: 1.02 }}
            transition={{ duration: 0.1 }}
          />
        </motion.div>

        <motion.div className="form-group" variants={fieldVariants}>
          <label className="form-label">Spent Amount</label>
          <motion.input
            type="number"
            className="input"
            value={spent}
            onChange={(e) => setSpent(e.target.value)}
            placeholder="0"
            min="0"
            step="0.01"
            whileFocus={{ scale: 1.02 }}
            transition={{ duration: 0.1 }}
          />
        </motion.div>

        <motion.div className="form-group" variants={fieldVariants}>
          <label className="form-label">Color</label>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: '0.5rem',
            marginTop: '0.5rem'
          }}>
            {COLORS.map((colorOption, index) => (
              <motion.button
                key={colorOption}
                type="button"
                style={{
                  width: '40px',
                  height: '40px',
                  backgroundColor: colorOption,
                  border: color === colorOption ? '1px solid rgba(0,0,0,0.2)' : 'none',
                  borderRadius: '50%',
                  cursor: 'pointer'
                }}
                onClick={() => setColor(colorOption)}
                variants={colorVariants}
                initial="unselected"
                animate={color === colorOption ? 'selected' : 'unselected'}
                whileHover="hover"
                whileTap="tap"
                transition={{ delay: index * 0.05 }}
              />
            ))}
          </div>
        </motion.div>

        <motion.div 
          className="modal-actions"
          variants={fieldVariants}
        >
          <motion.button 
            type="button" 
            className="button button-secondary" 
            onClick={onClose}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Cancel
          </motion.button>
          <motion.button 
            type="submit" 
            className="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {editingCategory ? 'Update' : 'Add'} Category
          </motion.button>
        </motion.div>
      </motion.form>
    </Modal>
  );
}
