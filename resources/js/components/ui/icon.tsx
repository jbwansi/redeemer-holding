import React, { Suspense, lazy, useMemo } from 'react';
import { Package } from 'lucide-react';
import type { LucideProps } from 'lucide-react';
import dynamicIconImports from 'lucide-react/dynamicIconImports';

interface IconComponentProps {
    name: keyof typeof dynamicIconImports | string;
    color?: string;
    size?: number;
}

const IconComponent = ({ name, color = '#000', size = 24, ...props }: IconComponentProps & LucideProps) => {
    const LazyIcon = useMemo(() => {
        const importer = dynamicIconImports[name as keyof typeof dynamicIconImports];

        if (!importer) {
            return null;
        }

        return lazy(async () => {
            const mod = await importer();

            return { default: mod.default };
        });
    }, [name]);

    if (!LazyIcon) {
        return <Package color={color} size={size} {...props} />;
    }

    return (
        <Suspense fallback={<Package color={color} size={size} {...props} />}>
            <LazyIcon color={color} size={size} {...props} />
        </Suspense>
    );
};

export default IconComponent;
