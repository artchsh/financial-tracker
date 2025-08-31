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
  hidden: { opacity: 0, y: -10, scale: 0.95, transition: { duration: 0.075 } },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.1, ease: 'easeOut' as const } }
};

export const optionVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.075 } },
  hover: { backgroundColor: '#f5f5f5', x: 0, transition: { duration: 0.05 } }
};
