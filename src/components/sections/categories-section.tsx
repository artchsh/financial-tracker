import React from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { Category } from '@/types';
import { CategoryCard } from '@/components/CategoryCard';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.2 } }
};

interface CategoriesSectionProps {
  categories: Category[];
  onAdd: () => void;
  onEdit: (cat: Category) => void;
  onDelete: (id: string) => void;
}

export default function CategoriesSection({ categories, onAdd, onEdit, onDelete }: CategoriesSectionProps) {
  return (
    <motion.div layout className="flex flex-col gap-2">
      <motion.div className="section-header" variants={itemVariants}>
        <h2 className="section-title">Categories</h2>
        <motion.button
          className="btn-icon"
          onClick={onAdd}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          title="Add category"
        >
          <Plus size={20} />
        </motion.button>
      </motion.div>

      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="flex flex-col gap-2">
        {categories.length > 0 ? (
          categories.map(category => (
            <CategoryCard key={category.id} category={category} onEdit={onEdit} onDelete={onDelete} />
          ))
        ) : (
          <motion.div className="card empty-state" variants={itemVariants}>
            <p className="empty-state-title">No categories yet</p>
            <p className="empty-state-description">Add your first category to start tracking your budget</p>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
