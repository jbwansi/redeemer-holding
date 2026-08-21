import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Calendar, ChevronRight, Expand, Users, X } from 'lucide-react';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { route } from 'ziggy-js';

import IconComponent from '@/components/ui/icon';
import { normalizeServiceIconName } from '@/lib/service-icon';

type ServiceCardProps = {
  service: any;
  index?: number;
};

export default function ServiceCard({ service, index = 0 }: ServiceCardProps) {
  const [imageOpen, setImageOpen] = useState(false);

  const imageUrl = service.image || '/assets/images/coaching-session.jpg';

  return (
    <>
      <motion.article
        key={service.id}
        initial={false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: index * 0.08 }}
        className="group overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-3 shadow-xl shadow-slate-900/5 backdrop-blur transition hover:-translate-y-1 hover:border-[#da2e29]/40 dark:border-white/10 dark:bg-[#0b1424] dark:shadow-black/25"
      >
        {/* Image */}
        <div className="relative overflow-visible">
          <button
            type="button"
            onClick={() => setImageOpen(true)}
            className="group/image relative block w-full cursor-zoom-in overflow-hidden rounded-[1.25rem]"
            aria-label={`Agrandir l'image de ${service.name}`}
          >
            <img
              src={imageUrl}
              alt={service.name}
              loading="lazy"
              decoding="async"
              className="block h-auto w-full transition-transform duration-500 group-hover/image:scale-[1.02]"
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
            {service.icon ? (
              <IconComponent
                name={normalizeServiceIconName(service.icon) || 'users'}
                color="white"
              />
            ) : (
              <Users className="h-5 w-5" />
            )}
          </div>
        </div>

        {/* Contenu */}
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
              {(Array.isArray(service.ideal_for) && service.ideal_for.length > 0
                ? service.ideal_for
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
            <Link
              href={
                service.cta_primary_url ||
                (service.slug ? `/services-requests/${encodeURIComponent(service.slug)}` : '#')
              }
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#da2e29] px-4 py-2.5 text-sm font-black text-white transition hover:bg-[#c62823] sm:w-fit"
            >
              {service.cta_primary_label || 'Réserver une séance découverte'}
              <Calendar className="h-4 w-4" />
            </Link>

            <Link
              href={service.cta_secondary_url || route('services.details', service.slug)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-[#10213c] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#162946] sm:w-fit"
            >
              {service.cta_secondary_label || 'En savoir plus'}
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </motion.article>

      {/* Lightbox */}
      {imageOpen &&
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
