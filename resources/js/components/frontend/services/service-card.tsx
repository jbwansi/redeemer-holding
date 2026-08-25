import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Calendar, ChevronRight, Expand, Users, X } from 'lucide-react';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { route } from 'ziggy-js';

import IconComponent from '@/components/ui/icon';
import { normalizeServiceIconName } from '@/lib/service-icon';

type ServiceCardProps = {
  service: {
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
  index?: number;
  variant?: 'compact' | 'detailed';
  audience?: 'individual' | 'organization';
};

function ServiceCardIcon({ service }: { service: ServiceCardProps['service'] }) {
  return service.icon ? (
    <IconComponent name={normalizeServiceIconName(service.icon) || 'users'} color="white" />
  ) : (
    <Users className="h-5 w-5" />
  );
}

export default function ServiceCard({
  service,
  index = 0,
  variant = 'detailed',
  audience = 'individual',
}: ServiceCardProps) {
  const [imageOpen, setImageOpen] = useState(false);
  const isCompact = variant === 'compact';

  const imageUrl = service.image || '/assets/images/coaching-session.jpg';
  const idealFor = Array.isArray(service.ideal_for) ? service.ideal_for.filter(Boolean) : [];
  const primaryHref = service.cta_primary_url
    ? service.cta_primary_url
    : service.slug
      ? `/services-requests/${encodeURIComponent(service.slug)}`
      : null;
  const secondaryHref = service.cta_secondary_url
    ? service.cta_secondary_url
    : service.slug
      ? route('services.details', service.slug)
      : null;
  const detailHref = service.slug ? route('services.details', service.slug) : null;
  const compactCtaLabel =
    audience === 'organization' ? 'Découvrir la solution' : 'Découvrir l’accompagnement';
  const compactTagline = String(service.tagline || '').trim();
  const hasCompleteCompactTagline =
    compactTagline.length > 0 &&
    compactTagline.length <= 160 &&
    !compactTagline.endsWith('…') &&
    !compactTagline.endsWith('...');
  const compactSummary = hasCompleteCompactTagline
    ? compactTagline
    : service.excerpt || 'Accompagnement personnalisé et orienté résultats.';

  return (
    <>
      <motion.article
        key={service.id}
        initial={false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: index * 0.08 }}
        className={`group flex h-full flex-col overflow-hidden border shadow-xl shadow-slate-900/5 backdrop-blur transition hover:-translate-y-1 dark:shadow-black/25 ${
          isCompact
            ? `rounded-2xl bg-[#0b1424] p-5 text-white md:min-h-[220px] md:p-6 ${
                audience === 'organization'
                  ? 'border-blue-500/30 hover:border-blue-400/60'
                  : 'border-[#da2e29]/30 hover:border-[#da2e29]/60'
              }`
            : 'rounded-[2rem] border-slate-200 bg-white p-3 hover:border-[#da2e29]/40 dark:border-white/10 dark:bg-[#0b1424]'
        }`}
      >
        {/* Image */}
        {!isCompact && (
          <div className="relative overflow-visible">
            <button
              type="button"
              onClick={() => setImageOpen(true)}
              className={`group/image relative block w-full cursor-zoom-in overflow-hidden rounded-[1.25rem] ${
                isCompact ? 'h-44 md:h-48' : 'aspect-[16/9]'
              }`}
              aria-label={`Agrandir l'image de ${service.name}`}
            >
              <img
                src={imageUrl}
                alt={service.name}
                loading="lazy"
                decoding="async"
                className="block h-full w-full object-cover transition-transform duration-500 group-hover/image:scale-[1.02]"
              />

              {/* Overlay léger au hover */}
              <div className="pointer-events-none absolute inset-0 bg-black/0 transition duration-300 group-hover/image:bg-black/10" />

              {/* Bouton Agrandir au hover */}
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover/image:opacity-100">
                <span className="inline-flex items-center gap-2 rounded-full bg-black/65 px-4 py-2 text-sm font-semibold text-white shadow-lg backdrop-blur-sm">
                  <Expand className="h-4 w-4" />
                  Agrandir
                </span>
              </div>
            </button>

            {/* Icône du service */}
            <div className="absolute -bottom-7 left-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#da2e29] text-white shadow-lg shadow-[#da2e29]/30">
              <ServiceCardIcon service={service} />
            </div>
          </div>
        )}

        {/* Contenu */}
        {isCompact ? (
          <div className="flex flex-1 items-start gap-4 sm:gap-5">
            <div
              className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-white shadow-lg sm:h-16 sm:w-16 ${
                audience === 'organization'
                  ? 'bg-blue-600 shadow-blue-600/25'
                  : 'bg-[#da2e29] shadow-[#da2e29]/25'
              }`}
            >
              <ServiceCardIcon service={service} />
            </div>

            <div className="flex min-w-0 flex-1 flex-col self-stretch">
              <h3 className="text-xl font-black leading-tight text-white">{service.name}</h3>
              <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-300">{compactSummary}</p>

              {detailHref && (
                <Link
                  href={detailHref}
                  aria-label={`${compactCtaLabel} : ${service.name}`}
                  className={`mt-auto inline-flex w-fit items-center gap-1 pt-5 text-sm font-bold transition focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b1424] ${
                    audience === 'organization'
                      ? 'text-blue-300 hover:text-blue-200 focus-visible:ring-blue-400'
                      : 'text-[#ff6b67] hover:text-[#ff8d8a] focus-visible:ring-[#da2e29]'
                  }`}
                >
                  {compactCtaLabel}
                  <span aria-hidden="true">→</span>
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-1 flex-col px-4 pb-4 pt-9">
            <h3 className="text-2xl font-black leading-tight text-slate-900 dark:text-white">
              {service.name}
            </h3>

            {service.tagline && (
              <p className="mt-2 line-clamp-2 text-sm font-semibold leading-6 text-[#d93430] dark:text-[#ff8d8a]">
                {service.tagline}
              </p>
            )}

            <p className="mt-4 line-clamp-4 text-sm leading-6 text-slate-600 dark:text-slate-300">
              {service.excerpt || 'Accompagnement personnalisé et orienté résultats.'}
            </p>

            {/* Idéal si */}
            <div className="mt-5 rounded-2xl border border-slate-200 bg-white/5 p-5 shadow-sm dark:border-white/10">
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                Idéal si vous voulez :
              </p>

              <ul className="space-y-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                {(idealFor.length > 0
                  ? idealFor
                  : [
                      'Un accompagnement sur mesure',
                      'Des résultats concrets et durables',
                      'Avancer plus vite et plus sereinement',
                    ]
                ).map((item: string, itemIndex: number) => (
                  <li key={itemIndex} className="flex items-start gap-3">
                    <span className="mt-0.5 shrink-0 text-[#da2e29]">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Note mise en avant */}
            {service.featured_note && (
              <div className="mt-5 rounded-2xl border border-[#da2e29]/30 bg-[#da2e29]/10 px-4 py-3 text-xs font-bold text-[#da2e29]">
                {service.featured_note}
              </div>
            )}

            {/* Actions */}
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              {primaryHref && (
                <Link
                  href={primaryHref}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#da2e29] px-4 py-2.5 text-sm font-black text-white transition hover:bg-[#c62823] sm:w-fit"
                >
                  {service.cta_primary_label || 'Faire une demande'}
                  <Calendar className="h-4 w-4" />
                </Link>
              )}

              {secondaryHref && (
                <Link
                  href={secondaryHref}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-[#10213c] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#162946] sm:w-fit"
                >
                  {service.cta_secondary_label || 'En savoir plus'}
                  <ChevronRight className="h-4 w-4" />
                </Link>
              )}
            </div>
          </div>
        )}
      </motion.article>

      {/* Lightbox */}
      {!isCompact &&
        imageOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
            onClick={() => setImageOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-label={`Image agrandie de ${service.name}`}
          >
            {/* Fermer */}
            <button
              type="button"
              onClick={() => setImageOpen(false)}
              className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:right-6 sm:top-6"
              aria-label="Fermer l'image"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Image agrandie */}
            <img
              src={imageUrl}
              alt={service.name}
              className="max-h-[90vh] max-w-[95vw] rounded-xl object-contain shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            />
          </div>,
          document.body
        )}
    </>
  );
}
