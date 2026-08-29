import * as LucideIcons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

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
};

const ICON_MAP: Record<string, LucideIcon> = {
  Clock: LucideIcons.Clock,
  MessageCircle: LucideIcons.MessageCircle,
  Search: LucideIcons.Search,
  SearchCheck: LucideIcons.SearchCheck,
  Clipboard: LucideIcons.Clipboard,
  ListChecks: LucideIcons.ListChecks,
  Target: LucideIcons.Target,
  CheckCircle: LucideIcons.CheckCircle,
  Brain: LucideIcons.Brain,
  Zap: LucideIcons.Zap,
  Users: LucideIcons.Users,
  Sprout: LucideIcons.Sprout,
  Lightbulb: LucideIcons.Lightbulb,
  TrendingUp: LucideIcons.TrendingUp,
  Star: LucideIcons.Star,
  Rocket: LucideIcons.Rocket,
  Award: LucideIcons.Award,
  Shield: LucideIcons.Shield,
  Heart: LucideIcons.Heart,
  BookOpen: LucideIcons.BookOpen,
  Calendar: LucideIcons.Calendar,
};

const DEFAULT_PROCESS_ICONS: LucideIcon[] = [
  LucideIcons.MessageCircle,
  LucideIcons.SearchCheck,
  LucideIcons.ListChecks,
  LucideIcons.Sprout,
];

export default function HowItWorks({
  title = 'Mon processus d’accompagnement',
  subtitle = '',
  steps = [],
}: HowItWorksProps) {
  if (!steps.length) return null;

  return (
    <section className="bg-gray-50 py-14 dark:bg-gray-900 md:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="[&>div]:mb-8">
          <SectionHeader label="Méthode" title={title} subtitle={subtitle} />
        </div>

        <ol className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {steps.slice(0, 4).map((step, index) => {
            const configuredIcon = step.icon ? ICON_MAP[step.icon] : undefined;

            const Icon = configuredIcon ?? DEFAULT_PROCESS_ICONS[index] ?? LucideIcons.CheckCircle;

            return (
              <li
                key={`${step.title}-${index}`}
                className="
                  relative rounded-2xl
                  border border-gray-200
                  bg-white p-5 shadow-sm
                  dark:border-gray-800
                  dark:bg-gray-950
                "
              >
                <div className="flex items-center justify-between">
                  <div
                    className="
                      flex h-10 w-10
                      items-center justify-center
                      rounded-xl bg-[#DA2E29]
                      text-white
                      shadow-md shadow-[#DA2E29]/20
                    "
                  >
                    <Icon className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
                  </div>

                  <span className="text-xs font-bold tracking-[0.16em] text-[#DA2E29]">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </div>

                <h3 className="mt-4 text-base font-bold text-gray-950 dark:text-white">
                  {step.title}
                </h3>

                <p className="mt-2 line-clamp-2 text-sm leading-6 text-gray-600 dark:text-gray-400">
                  {step.description}
                </p>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
