import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MoreVertical } from 'lucide-react';

interface ActionMenuItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'danger';
  onClick: () => void;
}

interface ActionMenuProps {
  items: ActionMenuItem[];
  trigger?: React.ReactNode;
  className?: string;
}

const menuVariants = {
  hidden: {
    opacity: 0,
    scale: 0.9,
    y: -10,
    transition: {
      duration: 0.075
    }
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.1,
      ease: 'easeOut' as const
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.075 }
  },
  hover: {
    backgroundColor: '#f5f5f5',
    x: 4,
    transition: { duration: 0.05 }
  }
};

export function ActionMenu({ items, trigger, className = "" }: ActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuPosition, setMenuPosition] = useState<'right' | 'left'>('right');

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    // Check menu position to prevent clipping
    const checkMenuPosition = () => {
      if (menuRef.current && isOpen) {
        const rect = menuRef.current.getBoundingClientRect();
        const menuWidth = 120; // min-width from CSS
        const rightEdge = rect.right + menuWidth;
        const windowWidth = window.innerWidth;
        
        if (rightEdge > windowWidth) {
          setMenuPosition('left');
        } else {
          setMenuPosition('right');
        }
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
      // Small delay to ensure DOM is updated
      setTimeout(checkMenuPosition, 10);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const handleItemClick = (item: ActionMenuItem) => {
    item.onClick();
    setIsOpen(false);
  };

  const defaultTrigger = (
    <motion.button
      className="button button-circle action-menu-trigger"
      
      onClick={() => setIsOpen(!isOpen)}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      transition={{ duration: 0.1 }}
    >
      <motion.div
        animate={{ rotate: isOpen ? 90 : 0 }}
        transition={{ duration: 0.1 }}
        style={{ height: "16px" }}
      >
        <MoreVertical size={16} />
      </motion.div>
    </motion.button>
  );

  return (
    <div className={`action-menu-container ${className}`} ref={menuRef}>
      {trigger ? (
        <div onClick={() => setIsOpen(!isOpen)}>
          {trigger}
        </div>
      ) : (
        defaultTrigger
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={`action-menu ${menuPosition === 'left' ? 'action-menu-right' : 'action-menu-left'}`}
            variants={menuVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            {items.map((item, index) => (
              <motion.button
                key={item.key}
                type="button"
                className={`action-menu-item ${item.variant === 'danger' ? 'danger' : ''}`}
                onClick={() => handleItemClick(item)}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                whileHover="hover"
                transition={{ delay: index * 0.01 }}
              >
                {item.icon && <span className="action-menu-icon">{item.icon}</span>}
                <span className="action-menu-label">{item.label}</span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
