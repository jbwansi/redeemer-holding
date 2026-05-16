import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { Link } from '@inertiajs/react';
import IconComponent from '@/components/ui/icon';
import SectionHeader from '@/components/frontend/layouts/section-header';
import { normalizeServiceIconName } from '@/lib/service-icon';

const Services = ({ services }: any) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: false, amount: 0.2 });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  if (!services?.length) return null;

  return (
    <section className="py-20 md:py-24 bg-white dark:bg-gray-950 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50/70 to-white dark:from-gray-900/40 dark:to-gray-950" />
      <div className="absolute top-20 left-20 h-80 w-80 rounded-full bg-[#DA2E29]/4 dark:bg-[#DA2E29]/6 blur-[120px]" />
      <div className="absolute bottom-20 right-20 h-80 w-80 rounded-full bg-rose-500/4 dark:bg-rose-500/6 blur-[120px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          label="Accompagnements"
          title="Des accompagnements concrets pour avancer avec clarté"
          subtitle="Découvrez des accompagnements pensés pour structurer vos actions, renforcer votre posture et obtenir des résultats durables."
        />

        <motion.div
          ref={sectionRef}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid gap-6 md:grid-cols-2 xl:grid-cols-3"
        >
          {services.map((service: any, index: number) => (
            <motion.article
              key={service?.id ?? index}
              variants={cardVariants}
              className="group overflow-hidden rounded-[2rem] border border-white/10 bg-[#0b1424] p-3 shadow-xl shadow-black/25 backdrop-blur transition hover:-translate-y-1 hover:border-[#ef2d2d]/40"
            >
              <div className="relative overflow-hidden rounded-[1.5rem]">
                <img
                  src={service.image || '/assets/images/coaching-session.jpg'}
                  alt={service.name}
                  className="h-48 w-full object-cover transition duration-700 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#020817]/80 via-[#020817]/10 to-transparent" />
              </div>

              <div className="px-5 pb-6">
                <div className="-mt-8 relative z-10 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#da2e29] text-white shadow-lg shadow-[#da2e29]/30">
                  <IconComponent
                    name={normalizeServiceIconName(service.icon) || 'users'}
                    color="white"
                  />
                </div>

                <h3 className="mt-5 text-2xl font-black text-white">{service.name}</h3>

                {service.tagline && (
                  <p className="mt-1 text-sm font-bold text-red-500">{service.tagline}</p>
                )}

                <p className="mt-4 line-clamp-4 text-sm leading-7 text-slate-300">
                  {service.excerpt || 'Accompagnement personnalisé et orienté résultats.'}
                </p>

                <div className="mt-6 rounded-2xl border border-white/5 bg-white/[0.04] p-5">
                  <p className="mb-3 font-bold text-white">Idéal si vous voulez :</p>

                  <ul className="space-y-2 text-sm leading-6 text-slate-300">
                    {(Array.isArray(service.ideal_for) && service.ideal_for.length > 0
                      ? service.ideal_for
                      : [
                          'Un accompagnement sur mesure',
                          'Des résultats concrets et durables',
                          'Avancer plus vite et plus sereinement',
                        ]
                    ).map((item: string, i: number) => (
                      <li key={i} className="flex gap-2">
                        <span className="text-[#ef2d2d]">✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-7 flex flex-wrap gap-3">
                  <Link
                    href={
                      service.cta_primary_url ||
                      (service.slug
                        ? `/services-requests/${encodeURIComponent(service.slug)}`
                        : '#')
                    }
                    className="inline-flex items-center gap-2 rounded-xl bg-[#da2e29] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#c62823]"
                  >
                    {service.cta_primary_label || 'Réserver'}
                  </Link>

                  <Link
                    href={service.cta_secondary_url || route('services.details', service.slug)}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold text-slate-200 transition hover:bg-white/10"
                  >
                    {service.cta_secondary_label || 'En savoir plus'}
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </motion.article>
          ))}
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="mt-12 flex flex-col items-center gap-4 text-center"
        >
          <Link
            href="/services"
            className="group inline-flex items-center gap-2 rounded-2xl border border-[#da2e29]/30 bg-[#da2e29]/10 px-7 py-4 text-sm font-bold text-[#da2e29] shadow-lg shadow-[#da2e29]/10 transition hover:-translate-y-0.5 hover:bg-[#da2e29] hover:text-white hover:shadow-[#da2e29]/25"
          >
            Voir tous les accompagnements
            <ChevronRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default Services;
