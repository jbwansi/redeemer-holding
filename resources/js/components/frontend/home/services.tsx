import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { Link } from '@inertiajs/react';
import SectionHeader from '@/components/frontend/layouts/section-header';
import ServiceCard from '@/components/frontend/services/service-card';

const Services = ({ services }: any) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: false, amount: 0.2 });

  if (!services?.length) return null;

  return (
    <section className="relative overflow-hidden bg-white py-20 dark:bg-gray-950 md:py-24">
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50/70 to-white dark:from-gray-900/40 dark:to-gray-950" />

      <div className="absolute left-20 top-20 h-80 w-80 rounded-full bg-[#DA2E29]/4 blur-[120px] dark:bg-[#DA2E29]/6" />

      <div className="absolute bottom-20 right-20 h-80 w-80 rounded-full bg-rose-500/4 blur-[120px] dark:bg-rose-500/6" />

      <div className="relative z-10 mx-auto max-w-[1820px] px-4 md:px-6">
        <SectionHeader
          label="Accompagnements"
          title="Des accompagnements concrets pour avancer avec clarté"
          subtitle="Découvrez des accompagnements pensés pour structurer vos actions, renforcer votre posture et obtenir des résultats durables."
        />

        <div ref={sectionRef} className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {services.map((service: any, index: number) => (
            <ServiceCard key={service?.id ?? index} service={service} index={index} />
          ))}
        </div>

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
