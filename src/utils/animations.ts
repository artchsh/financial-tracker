export const settingsVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 }
  }
};

export const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.2 } }
};

export const dropdownVariants = {
  hidden: { 
    opacity: 0, 
    y: -8, 
    scale: 0.96
  },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1, 
    transition: { 
      duration: 0.2, 
      ease: [0, 0, 0.2, 1],
      staggerChildren: 0.02,
      delayChildren: 0.02
    } 
  },
  exit: {
    opacity: 0,
    y: -8,
    scale: 0.96,
    transition: {
      duration: 0.18,
      ease: [0.4, 0, 1, 1]
    }
  }
};

export const optionVariants = {
  hidden: { opacity: 0, y: -4 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.15, ease: [0, 0, 0.2, 1] } 
  },
  hover: { backgroundColor: 'var(--color-bg-hover)', transition: { duration: 0.1 } }
};
