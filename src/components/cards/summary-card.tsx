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

function DataRow({ label, value, valueClass }: { label: string, value: React.ReactNode, valueClass?: string }) {
    return (
        <div className="data-row">
            <span className="data-row-label">{label}</span>
            <span className={`data-row-value ${valueClass || ''}`}>{value}</span>
        </div>
    )
}

export default function SummaryCard({ formatCurrency, totalAllocated, totalSpent, freeMoney, currentBudget }: SummaryCardProps) {
    const unallocated = (currentBudget?.spendingLimit || 0) - totalAllocated;

    return (
        <motion.div className="card" variants={cardVariants}>
            <h3 className="card-title mb-1">Summary</h3>
            <div className="card-content">
                <DataRow
                    label="Spent / Allocated"
                    value={`${formatCurrency(totalSpent)} / ${formatCurrency(totalAllocated)}`}
                />
                <DataRow
                    label="Remaining"
                    value={formatCurrency(freeMoney)}
                    valueClass={freeMoney < 0 ? 'text-danger' : 'text-success'}
                />
                <DataRow
                    label="Unallocated"
                    value={formatCurrency(unallocated)}
                    valueClass={unallocated < 0 ? 'text-danger' : ''}
                />
            </div>
        </motion.div>
    )
}
