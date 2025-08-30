import { MonthBudget } from "@/types";
import { motion } from "framer-motion"

interface SummaryCardProps {
    formatCurrency: (x: number) => string,
    getFreeMoneyCssClass: (x: number, y: number) => string,
    totalAllocated: number,
    totalSpent: number,
    freeMoney: number,
    currentBudget?: MonthBudget
}

const summaryVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.25 }
    }
};

export function GroupItem({ label, value }: { label: string, value: React.ReactNode }) {
    return (
        <div className="flex justify-between w-full">
            <span>{label}</span>
            <span>{value}</span>
        </div>
    )
}

export default function SummaryCard({ formatCurrency, getFreeMoneyCssClass, totalAllocated, totalSpent, freeMoney, currentBudget }: SummaryCardProps) {

    return (
        <motion.div
            className="card"
            variants={summaryVariants}
        >
            <h2 className="font-bold">Summary</h2>
            <div className="flex flex-col gap-0.5">
                <GroupItem
                    label="Spent/Allocated:"
                    value={`${formatCurrency(totalSpent)}/${formatCurrency(totalAllocated)}`}
                />
                {/* <GroupItem
                    label="Total Spent:"
                    value={formatCurrency(totalSpent)}
                /> */}
                <GroupItem
                    label="Left:"
                    value={formatCurrency(freeMoney)}
                />
                <GroupItem
                    label="Unallocated money:"
                    value={formatCurrency((currentBudget?.spendingLimit || 0) - totalAllocated)}
                />
            </div>
        </motion.div>
    )
}
