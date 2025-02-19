import { icons, Package } from 'lucide-react';

interface IconComponentProps {
    name: keyof typeof icons;
    color?: string;
    size?: number;
}

const IconComponent = ({ name, color = '#000', size = 24, ...props }: IconComponentProps) => {
    const LucideIcon = icons[name] || Package;

    return <LucideIcon color={color} size={size}  />;
};

export default IconComponent;
