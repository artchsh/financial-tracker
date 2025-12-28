import { motion } from "framer-motion"

interface TopHeaderProps {
    title: string;
}

export default function TopHeader({ title }: TopHeaderProps) {
    return (
        <motion.h1
            className="page-title"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
        >
            {title}
        </motion.h1>
    )
}