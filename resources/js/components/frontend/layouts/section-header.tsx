import React from 'react';

interface SectionHeaderProps {
  label?: string;
  title?: string;
  subtitle?: string;
}

export default function SectionHeader({ label, title, subtitle }: SectionHeaderProps) {
  return (
    <div className="mx-auto mb-12 max-w-3xl text-center">
      {label ? (
        <span className="ux-kicker inline-flex rounded-full bg-red-50 px-3 py-1 dark:bg-red-500/10">
          {label}
        </span>
      ) : null}

      {title ? <h2 className="ux-section-title mt-4">{title}</h2> : null}

      {subtitle ? <p className="ux-section-subtitle mt-4">{subtitle}</p> : null}
    </div>
  );
}
