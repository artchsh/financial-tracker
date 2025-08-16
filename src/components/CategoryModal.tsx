import React, { useState, useEffect } from 'react';
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

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingCategory ? 'Edit Category' : 'Add Category'}
    >
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Category Name</label>
          <input
            type="text"
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Food, Transport"
            autoFocus
          />
        </div>

        <div className="form-group">
          <label className="form-label">Allocated Amount</label>
          <input
            type="number"
            className="input"
            value={allocated}
            onChange={(e) => setAllocated(e.target.value)}
            placeholder="0"
            min="0"
            step="0.01"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Spent Amount</label>
          <input
            type="number"
            className="input"
            value={spent}
            onChange={(e) => setSpent(e.target.value)}
            placeholder="0"
            min="0"
            step="0.01"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Color</label>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: '0.5rem',
            marginTop: '0.5rem'
          }}>
            {COLORS.map(colorOption => (
              <button
                key={colorOption}
                type="button"
                style={{
                  width: '40px',
                  height: '40px',
                  backgroundColor: colorOption,
                  border: color === colorOption ? '3px solid #000' : '1px solid #ccc',
                  borderRadius: '50%',
                  cursor: 'pointer'
                }}
                onClick={() => setColor(colorOption)}
              />
            ))}
          </div>
        </div>

        <div className="modal-actions">
          <button type="button" className="button-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="button">
            {editingCategory ? 'Update' : 'Add'} Category
          </button>
        </div>
      </form>
    </Modal>
  );
}
