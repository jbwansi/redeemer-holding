import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Building2, UserRound } from 'lucide-react';
import { KeyboardEvent, useId, useRef, useState } from 'react';
import { route } from 'ziggy-js';

import ServiceCard from '@/components/frontend/services/service-card';

type ServiceItem = {
  id?: number;
  name: string;
  slug?: string | null;
  excerpt?: string | null;
  icon?: string | null;
  image?: string | null;
  tagline?: string | null;
  ideal_for?: string[] | null;
  featured_note?: string | null;
  cta_primary_label?: string | null;
  cta_primary_url?: string | null;
  cta_secondary_label?: string | null;
  cta_secondary_url?: string | null;
};

type Audience = 'individual' | 'organization';

type ServicesProps = {
  individualServices?: ServiceItem[];
  organizationServices?: ServiceItem[];
  fallbackServices?: ServiceItem[];
};

const tabs: Array<{ id: Audience; label: string; icon: typeof UserRound }> = [
  { id: 'individual', label: 'Pour les particuliers', icon: UserRound },
  { id: 'organization', label: 'Pour les entreprises', icon: Building2 },
];

export default function Services({
  individualServices = [],
  organizationServices = [],
  fallbackServices = [],
}: ServicesProps) {
  const [activeAudience, setActiveAudience] = useState<Audience>('individual');
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const instanceId = useId();
  const hasIndividuals = individualServices.length > 0;
  const hasOrganizations = organizationServices.length > 0;
  const hasBoth = hasIndividuals && hasOrganizations;
  const hasCategorizedServices = hasIndividuals || hasOrganizations;

  if (!hasCategorizedServices && !fallbackServices.length) return null;

  const visibleAudience: Audience = hasBoth
    ? activeAudience
    : hasOrganizations
      ? 'organization'
      : 'individual';
  const visibleServices = hasCategorizedServices
    ? visibleAudience === 'individual'
      ? individualServices
      : organizationServices
    : fallbackServices;
  const gridWidthClass =
    visibleServices.length === 1
      ? 'mx-auto max-w-md'
      : visibleServices.length === 2
        ? 'mx-auto max-w-4xl'
        : 'mx-auto max-w-7xl';
  const audienceDescription =
    visibleAudience === 'organization'
      ? 'Des solutions pour renforcer la coopération et accompagner vos équipes.'
      : 'Des accompagnements pour retrouver de la clarté et passer à l’action.';
  const catalogCtaLabel =
    visibleAudience === 'organization'
      ? 'Voir toutes les solutions pour entreprises'
      : 'Voir tous les accompagnements individuels';

  const selectTab = (index: number) => {
    const tab = tabs[index];
    setActiveAudience(tab.id);
    tabRefs.current[index]?.focus();
  };

  const handleTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();

    if (event.key === 'Home') return selectTab(0);
    if (event.key === 'End') return selectTab(tabs.length - 1);

    const offset = event.key === 'ArrowRight' ? 1 : -1;
    selectTab((index + offset + tabs.length) % tabs.length);
  };

  return (
    <section className="relative overflow-hidden bg-slate-50 py-14 dark:bg-[#020817] md:py-16">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(218,46,41,0.10),transparent_42%)]" />
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="mx-auto mb-8 max-w-3xl text-center">
          <span className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#DA2E29]">
            Particuliers & entreprises
          </span>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 dark:text-white md:text-4xl">
            Nos accompagnements
          </h2>
        </header>

        {hasBoth ? (
          <div
            role="tablist"
            aria-label="Choisir un type d’accompagnement"
            className="mx-auto mb-8 grid max-w-xl grid-cols-2 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm dark:border-white/10 dark:bg-white/5"
          >
            {tabs.map((tab, index) => {
              const Icon = tab.icon;
              const selected = activeAudience === tab.id;

              return (
                <button
                  key={tab.id}
                  ref={(element) => {
                    tabRefs.current[index] = element;
                  }}
                  id={`${instanceId}-${tab.id}-tab`}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  aria-controls={`${instanceId}-${tab.id}-panel`}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setActiveAudience(tab.id)}
                  onKeyDown={(event) => handleTabKeyDown(event, index)}
                  className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DA2E29] ${
                    selected
                      ? 'bg-[#DA2E29] text-white shadow-md shadow-[#DA2E29]/20'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-[#DA2E29] dark:text-slate-300 dark:hover:bg-white/10'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        ) : null}

        <p className="mx-auto mb-6 max-w-2xl text-center text-sm leading-6 text-slate-600 dark:text-slate-300">
          {audienceDescription}
        </p>

        <motion.div
          key={visibleAudience}
          id={`${instanceId}-${visibleAudience}-panel`}
          role={hasBoth ? 'tabpanel' : undefined}
          aria-labelledby={hasBoth ? `${instanceId}-${visibleAudience}-tab` : undefined}
          tabIndex={hasBoth ? 0 : undefined}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={`grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3 ${gridWidthClass}`}
        >
          {visibleServices.map((service, index) => (
            <ServiceCard
              key={service?.id ?? index}
              service={service}
              index={index}
              variant="compact"
              audience={visibleAudience}
            />
          ))}
        </motion.div>

        <div className="mt-7 flex justify-center">
          <Link
            href={route('services', { audience: visibleAudience })}
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#DA2E29]/40 px-5 py-2.5 text-center text-sm font-bold text-[#DA2E29] transition hover:border-[#DA2E29] hover:bg-[#DA2E29] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DA2E29] focus-visible:ring-offset-2 dark:ring-offset-[#020817]"
          >
            {catalogCtaLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}
