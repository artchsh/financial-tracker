import { MonthBudget } from "@/types";
import { motion } from "framer-motion"
import { cardVariants } from "@/utils/animations";

interface SummaryCardProps {
    formatCurrency: (x: number) => string,
    totalAllocated: number,
    totalSpent: number,
    freeMoney: number,
    currentBudget?: MonthBudget
}

export function GroupItem({ label, value }: { label: string, value: React.ReactNode }) {
    return (
        <div className="flex justify-between w-full">
            <span>{label}</span>
            <span>{value}</span>
        </div>
    )
}

export default function SummaryCard({ formatCurrency, totalAllocated, totalSpent, freeMoney, currentBudget }: SummaryCardProps) {

    return (
        <motion.div
            className="card"
            variants={cardVariants}
        >
            <h2 className="font-bold">Summary</h2>
            <div className="flex flex-col gap-0.5">
                <GroupItem
                    label="Spent/Allocated:"
                    value={`${formatCurrency(totalSpent)}/${formatCurrency(totalAllocated)}`}
                />
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
