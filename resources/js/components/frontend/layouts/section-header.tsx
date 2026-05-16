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
        <span className="inline-flex rounded-full bg-red-50 px-3 py-1 text-sm font-medium text-[#DA2E29] dark:bg-red-500/10">
          {label}
        </span>
      ) : null}

      {title ? (
        <h2 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 dark:text-white md:text-4xl">
          {title}
        </h2>
      ) : null}

      {subtitle ? (
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">{subtitle}</p>
      ) : null}
    </div>
  );
}
