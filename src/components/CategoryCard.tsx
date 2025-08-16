import React, { useState } from 'react';
import { Category } from '../types';
import { useApp } from '../context';

interface CategoryCardProps {
  category: Category;
  onEdit: (category: Category) => void;
  onDelete: (categoryId: string) => void;
}

export function CategoryCard({ category, onEdit, onDelete }: CategoryCardProps) {
  const { formatCurrency } = useApp();
  const [showActions, setShowActions] = useState(false);

  const remaining = category.allocated - category.spent;
  const isOverspent = category.spent > category.allocated;
  const spentPercentage = category.allocated > 0 ? (category.spent / category.allocated) * 100 : 0;

  return (
    <div className="card">
      <div className="flex flex-between mb-1 align-center">
        <div className="flex gap-1 align-center">
          <div
            style={{
              width: '12px',
              height: '12px',
              backgroundColor: category.color,
              borderRadius: '50%'
            }}
          />
          <h3 className="font-bold">{category.name}</h3>
        </div>
        <button
          className="button button-secondary"
          style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
          onClick={() => setShowActions(!showActions)}
        >
          ⋯
        </button>
      </div>

      {showActions && (
        <div className="flex gap-1 mb-2">
          <button
            className="button button-secondary"
            style={{ padding: '0.5rem', fontSize: '0.8rem', flex: 1 }}
            onClick={() => {
              onEdit(category);
              setShowActions(false);
            }}
          >
            Edit
          </button>
          <button
            className="button button-danger"
            style={{ padding: '0.5rem', fontSize: '0.8rem', flex: 1 }}
            onClick={() => {
              if (window.confirm(`Delete category "${category.name}"?`)) {
                onDelete(category.id);
              }
              setShowActions(false);
            }}
          >
            Delete
          </button>
        </div>
      )}

      <div className="mb-1">
        <div className="flex flex-between mb-1">
          <span>Allocated:</span>
          <span className="font-bold">{formatCurrency(category.allocated)}</span>
        </div>
        <div className="flex flex-between mb-1">
          <span>Spent:</span>
          <span className={isOverspent ? 'font-bold' : ''}
                style={{ color: isOverspent ? '#dc3545' : 'inherit' }}>
            {formatCurrency(category.spent)}
          </span>
        </div>
        <div className="flex flex-between">
          <span>Remaining:</span>
          <span className={`font-bold ${remaining < 0 ? '' : ''}`}
                style={{ color: remaining < 0 ? '#dc3545' : '#28a745' }}>
            {formatCurrency(remaining)}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{
        width: '100%',
        height: '8px',
        backgroundColor: '#e0e0e0',
        borderRadius: '4px',
        overflow: 'hidden'
      }}>
        <div
          style={{
            height: '100%',
            width: `${Math.min(spentPercentage, 100)}%`,
            backgroundColor: isOverspent ? '#dc3545' : spentPercentage > 80 ? '#ffc107' : '#28a745',
            transition: 'width 0.3s ease'
          }}
        />
      </div>
    </div>
  );
}
