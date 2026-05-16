import React from 'react';
import * as LucideIcons from 'lucide-react';
import { LucideIcon, ArrowRight } from 'lucide-react';
import SectionHeader from '@/components/frontend/layouts/section-header';

type StepItem = {
  icon?: string;
  title: string;
  description: string;
};

type HowItWorksProps = {
  title?: string;
  subtitle?: string;
  steps?: StepItem[];
  activeStep?: number;
};

const ICON_MAP: Record<string, LucideIcon> = {
  MessageCircle: LucideIcons.MessageCircle,
  Search: LucideIcons.Search,
  Clipboard: LucideIcons.Clipboard,
  Target: LucideIcons.Target,
  CheckCircle: LucideIcons.CheckCircle,
  Brain: LucideIcons.Brain,
  Zap: LucideIcons.Zap,
  Users: LucideIcons.Users,
  Lightbulb: LucideIcons.Lightbulb,
};

export default function HowItWorks({
  title = 'Mon approche',
  subtitle = '',
  steps = [],
  activeStep = 0,
}: HowItWorksProps) {
  if (!steps.length) return null;

  return (
    <section className="py-20 md:py-24 bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader label="Méthode" title={title} subtitle={subtitle} />

        <div className="relative flex flex-col gap-6 md:flex-row md:items-start md:gap-0">
          {steps.map((step, index) => {
            const Icon = ICON_MAP[step.icon || 'CheckCircle'] ?? LucideIcons.CheckCircle;

            const isActive = index === activeStep;
            const isCompleted = index < activeStep;
            const isLast = index === steps.length - 1;

            return (
              <React.Fragment key={index}>
                {/* Step card */}
                <div className="flex-1 flex flex-col items-center text-center px-2">
                  {/* Step number */}
                  <span
                    className={`mb-3 text-xs font-semibold tracking-widest uppercase transition-colors duration-300 ${
                      isActive
                        ? 'text-[#DA2E29]'
                        : isCompleted
                          ? 'text-[#DA2E29]/60'
                          : 'text-gray-300 dark:text-gray-700'
                    }`}
                  >
                    {String(index + 1).padStart(2, '0')}
                  </span>

                  {/* Icon */}
                  <div
                    className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-300 ${
                      isActive
                        ? 'bg-[#DA2E29] text-white shadow-lg shadow-red-500/20'
                        : isCompleted
                          ? 'bg-[#DA2E29]/10 text-[#DA2E29]'
                          : 'bg-red-50 text-[#DA2E29] dark:bg-red-500/10'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>

                  {/* Card */}
                  <div
                    className={`w-full rounded-2xl border p-6 transition-all duration-300 ${
                      isActive
                        ? 'border-[#DA2E29] bg-white shadow-md dark:bg-gray-950'
                        : isCompleted
                          ? 'border-[#DA2E29]/30 bg-white dark:bg-gray-950'
                          : 'border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950'
                    }`}
                  >
                    <h3
                      className={`text-base font-semibold transition-colors duration-300 ${
                        isActive ? 'text-[#DA2E29]' : 'text-gray-900 dark:text-white'
                      }`}
                    >
                      {step.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-400">
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* Connector — hidden on last step */}
                {!isLast && (
                  <div className="hidden md:flex items-start pt-[52px] px-1">
                    <ArrowRight
                      className={`h-5 w-5 shrink-0 transition-colors duration-300 ${
                        index < activeStep ? 'text-[#DA2E29]' : 'text-gray-300 dark:text-gray-700'
                      }`}
                    />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </section>
  );
}
