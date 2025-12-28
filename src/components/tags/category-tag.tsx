interface CategoryTagProps {
    color?: string;
    value: string;
}

export default function CategoryTag({ color, value }: CategoryTagProps) {
    const style = color 
        ? { backgroundColor: color, color: getContrastColor(color) }
        : {};
    
    return (
        <span className={`tag ${color ? '' : 'tag-default'}`} style={style}>
            {value}
        </span>
    );
}

function getContrastColor(hexColor: string): string {
    // Simple contrast check - if color is light, use dark text
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? '#000000' : '#ffffff';
}