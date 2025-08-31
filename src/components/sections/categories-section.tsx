import React from 'react';
import { motion } from 'framer-motion';
import { LucideDiamondPlus } from 'lucide-react';
import { Category } from '@/types';
import { CategoryCard } from '@/components/CategoryCard';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

const summaryVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25 } }
};

export default function CategoriesSection({
  categories,
  onAdd,
  onEdit,
  onDelete,
}: {
  categories: Category[];
  onAdd: () => void;
  onEdit: (cat: Category) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <motion.div layout className='flex flex-col gap-1'>
      <motion.div className="flex justify-between align-center" variants={summaryVariants}>
        <h2 className="font-bold">Categories</h2>
        <motion.button
          className="button button-ghost"
          style={{ padding: '0.4rem' }}
          onClick={onAdd}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <LucideDiamondPlus />
        </motion.button>
      </motion.div>

      <motion.div variants={containerVariants} initial="hidden" animate="visible" className='flex flex-col gap-2'>
        {categories.length > 0 ? (
          categories.map(category => (
            <CategoryCard key={category.id} category={category} onEdit={onEdit} onDelete={onDelete} />
          ))
        ) : (
          <motion.div className="text-muted text-center card" variants={summaryVariants}>
            <p>No categories yet</p>
            <p style={{ fontSize: '0.9rem' }}>Add your first category to start tracking your budget</p>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
