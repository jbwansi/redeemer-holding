import React, { Suspense, lazy, useMemo } from 'react';
import { Package } from 'lucide-react';
import type { LucideProps } from 'lucide-react';
import dynamicIconImports from 'lucide-react/dynamicIconImports';
import { findServiceIcon } from '@/lib/service-icon-registry';

interface IconComponentProps {
  name: keyof typeof dynamicIconImports | string;
  color?: string;
  size?: number;
}

const IconComponent = ({
  name,
  color = '#000',
  size = 24,
  ...props
}: IconComponentProps & LucideProps) => {
  const registeredIcon = findServiceIcon(name);
  const LazyIcon = useMemo(() => {
    if (registeredIcon) return null;
    const importer = dynamicIconImports[name as keyof typeof dynamicIconImports];

    if (!importer) {
      return null;
    }

    return lazy(async () => {
      const mod = await importer();

      return { default: mod.default };
    });
  }, [name, registeredIcon]);

  if (registeredIcon) {
    const RegisteredIcon = registeredIcon.component;
    return <RegisteredIcon color={color} size={size} {...props} />;
  }

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
