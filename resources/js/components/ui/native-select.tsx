import * as React from 'react';
import { cn } from '@/lib/utils';

const NativeSelect = React.forwardRef<HTMLSelectElement, React.ComponentProps<'select'>>(
  ({ className, children, ...props }, ref) => (
    <select
      className={cn(
        'flex h-12 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm transition-colors focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:[color-scheme:dark]',
        className
      )}
      ref={ref}
      {...props}
    >
      {children}
    </select>
  )
);
NativeSelect.displayName = 'NativeSelect';

export { NativeSelect };
