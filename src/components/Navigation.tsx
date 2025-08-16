import React from 'react';
import { motion } from 'framer-motion';

type Page = 'main' | 'history' | 'settings';

interface NavigationProps {
  currentPage: Page;
  onPageChange: (page: Page) => void;
}

const navItemVariants = {
  inactive: { 
    scale: 1,
    opacity: 0.7,
    transition: { duration: 0.2 }
  },
  active: { 
    scale: 1.1,
    opacity: 1,
    transition: { duration: 0.2 }
  },
  tap: { 
    scale: 0.95,
    transition: { duration: 0.1 }
  }
};

const iconVariants = {
  inactive: { rotate: 0 },
  active: { rotate: [0, -10, 10, 0], transition: { duration: 0.5 } },
  hover: { scale: 1.2, transition: { duration: 0.2 } }
};

export function Navigation({ currentPage, onPageChange }: NavigationProps) {
  return (
    <nav className="bottom-nav">
      <motion.button
        className={`nav-item ${currentPage === 'main' ? 'active' : ''}`}
        onClick={() => onPageChange('main')}
        variants={navItemVariants}
        initial="inactive"
        animate={currentPage === 'main' ? 'active' : 'inactive'}
        whileTap="tap"
        whileHover={{ scale: 1.05 }}
      >
        <motion.div 
          className="nav-icon"
          variants={iconVariants}
          animate={currentPage === 'main' ? 'active' : 'inactive'}
          whileHover="hover"
        >
          <i className="fas fa-chart-pie"></i>
        </motion.div>
        <div className="nav-label">Budget</div>
      </motion.button>
      
      <motion.button
        className={`nav-item ${currentPage === 'history' ? 'active' : ''}`}
        onClick={() => onPageChange('history')}
        variants={navItemVariants}
        initial="inactive"
        animate={currentPage === 'history' ? 'active' : 'inactive'}
        whileTap="tap"
        whileHover={{ scale: 1.05 }}
      >
        <motion.div 
          className="nav-icon"
          variants={iconVariants}
          animate={currentPage === 'history' ? 'active' : 'inactive'}
          whileHover="hover"
        >
          <i className="fas fa-history"></i>
        </motion.div>
        <div className="nav-label">History</div>
      </motion.button>
      
      <motion.button
        className={`nav-item ${currentPage === 'settings' ? 'active' : ''}`}
        onClick={() => onPageChange('settings')}
        variants={navItemVariants}
        initial="inactive"
        animate={currentPage === 'settings' ? 'active' : 'inactive'}
        whileTap="tap"
        whileHover={{ scale: 1.05 }}
      >
        <motion.div 
          className="nav-icon"
          variants={iconVariants}
          animate={currentPage === 'settings' ? 'active' : 'inactive'}
          whileHover="hover"
        >
          <i className="fas fa-cog"></i>
        </motion.div>
        <div className="nav-label">Settings</div>
      </motion.button>
    </nav>
  );
}
