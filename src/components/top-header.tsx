import { motion } from "framer-motion"

export default function TopHeader({ title }: { title: string }) {

    return (
        <motion.h1
            className="mb-2 font-large font-bold"
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            {title}
        </motion.h1>
    )
}