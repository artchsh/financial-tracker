export default function CategoryTag({ color, value }: { color?: string, value: string }) {
    return (
        <span
            className='flex justify-center items-center rounded-xl font-bold'
            style={{ backgroundColor: color ? color : "#ccc", paddingBlock: "2px", paddingInline: "8px", color: color ? "inherit" : "#666" }}
        >
            {value}
        </span>
    )
}