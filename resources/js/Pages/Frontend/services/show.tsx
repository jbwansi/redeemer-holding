import React, { useRef } from 'react';
import { Head, Link } from '@inertiajs/react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import {
  Calendar,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Clock,
  Shield,
} from 'lucide-react';
import parse from 'html-react-parser'; // Pour analyser le contenu HTML
import FrontLayout from '@/components/frontend/layouts/front-layout';
import IconComponent from '@/components/ui/icon';
import { normalizeServiceIconName } from '@/lib/service-icon';
import TestimonialsSection from '@/components/frontend/home/testimonials-section';

// Interface pour le type de service
interface Service {
  id: number;
  name: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  icon: string | null;
  views: number;
  status: number;
  created_at: string | null;
  updated_at: string | null;
  hero_image?: string | null;
  image?: string | null;
  tagline?: string | null;
  featured_note?: string | null;
  ideal_for?: string[] | null;
  cta_primary_label?: string | null;
  cta_primary_url?: string | null;
  cta_secondary_label?: string | null;
  cta_secondary_url?: string | null;
}

// Interface pour les props de la page
interface ServiceDetailProps {
  service: Service;
  relatedServices?: Service[];
  testimonials?: any[];
}

const ServiceDetail = ({
  service,
  relatedServices = [],
  testimonials = [],
}: ServiceDetailProps) => {
  // Refs pour les animations
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  // Détection de visibilité pour les animations
  const isHeroInView = useInView(heroRef, { once: false, amount: 0.3 });
  const isContentInView = useInView(contentRef, { once: false, amount: 0.3 });
  const isCtaInView = useInView(ctaRef, { once: false, amount: 0.3 });

  const serviceImage = service.image || service.existing_image || service.hero_image || null;

  const heroImage = serviceImage
    ? serviceImage.startsWith('/')
      ? serviceImage
      : `/storage/${serviceImage}`
    : '/assets/images/services-bg.jpg';

  const resolvedHeroImage = heroImage.includes('coach-hero.jpg')
    ? '/assets/images/services-bg.jpg'
    : heroImage;

  // Effet parallax pour le héro
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);

  // Formatage de la date de mise à jour si disponible
  const formattedDate = service.updated_at
    ? new Date(service.updated_at).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  const iconName = normalizeServiceIconName(service.icon);
  const requestUrl = service?.slug ? `/services-requests/${encodeURIComponent(service.slug)}` : '#';
  const primaryCtaUrl = service.cta_primary_url || requestUrl;
  const primaryCtaLabel = service.cta_primary_label || 'Faire une demande';
  const secondaryCtaUrl = service.cta_secondary_url || route('contact');
  const secondaryCtaLabel = service.cta_secondary_label || 'Poser une question';
  const fallbackContent = service.excerpt?.trim()
    ? service.excerpt
    : `Redeemer Holding vous accompagne dans le domaine « ${service.name} » avec une approche humaine, structurée et adaptée à votre contexte.`;

  return (
    <FrontLayout>
      <main
        ref={containerRef}
        className="min-h-screen bg-white dark:bg-gray-950 pt-20 pb-16 overflow-hidden"
      >
        <Head title={service.name} />

        {/* Breadcrumb back-nav */}
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 pt-4 pb-2">
          <Link
            href={route('services')}
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#DA2E29] dark:text-gray-400 dark:hover:text-[#DA2E29] transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Retour aux services
          </Link>
        </div>

        {/* Hero Section */}
        <section ref={heroRef} className="relative min-h-[420px] overflow-hidden md:min-h-[500px]">
          {/* Background avec effet parallax */}
          <motion.div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url("${resolvedHeroImage}")`,
              y: backgroundY,
            }}
          >
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-gray-900/80 via-gray-900/70 to-gray-900/60 dark:from-gray-950/90 dark:via-gray-950/80 dark:to-gray-950/70"></div>
          </motion.div>

          <div className="relative z-10 flex min-h-[420px] items-center py-8 md:min-h-[500px] md:py-10">
            <div className="max-w-[1400px] mx-auto px-4 md:px-8 w-full">
              <motion.div
                className="max-w-3xl"
                initial={{ opacity: 0, y: 30 }}
                animate={isHeroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.7 }}
              >
                {/* Icône du service */}
                <motion.div
                  className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm mb-6"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={isHeroInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <IconComponent name={iconName || 'checkCircle'} size={24} color="#DA2E29" />
                </motion.div>

                <motion.h1
                  className="mb-6 text-3xl font-bold leading-tight text-white sm:text-4xl md:text-5xl lg:text-6xl"
                  initial={{ opacity: 0, y: 20 }}
                  animate={isHeroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  {service.name}
                </motion.h1>

                {(service.tagline || service.excerpt) && (
                  <motion.p
                    className="text-xl text-gray-200 mb-8 max-w-2xl"
                    initial={{ opacity: 0, y: 20 }}
                    animate={isHeroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                  >
                    {service.tagline || service.excerpt}
                  </motion.p>
                )}

                <motion.div
                  className="flex flex-col sm:flex-row gap-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={isHeroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <Link
                    href={primaryCtaUrl}
                    className="inline-flex min-h-12 items-center justify-center rounded-lg border border-[#DA2E29] bg-[#DA2E29] px-6 py-3 font-semibold text-white shadow-lg shadow-[#DA2E29]/30 transition-colors duration-300 hover:bg-[#c02824]"
                  >
                    <Calendar className="mr-2 w-5 h-5" />
                    <span>{primaryCtaLabel}</span>
                  </Link>

                  <a
                    href="#details"
                    className="inline-flex min-h-12 items-center justify-center rounded-lg border border-white/35 bg-[#0f2342]/85 px-6 py-3 font-semibold text-white backdrop-blur-sm transition-colors duration-300 hover:bg-[#17315a]"
                  >
                    <span>En savoir plus</span>
                    <ChevronRight className="ml-2 w-5 h-5" />
                  </a>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Contenu principal */}
        <section id="details" className="py-16">
          <div className="max-w-[1400px] mx-auto px-4 md:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              {/* Contenu du service */}
              <div className="lg:col-span-8" ref={contentRef}>
                <motion.div
                  className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xl sm:p-8 md:p-10 dark:border-gray-700/30 dark:bg-gray-800"
                  initial={{ opacity: 0, y: 30 }}
                  animate={isContentInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                  transition={{ duration: 0.7 }}
                >
                  {service.content ? (
                    <div className="prose prose-lg max-w-none text-gray-700 dark:text-gray-300">
                      {parse(service.content)}
                    </div>
                  ) : (
                    <div className="prose prose-lg max-w-none text-gray-700 dark:text-gray-300">
                      <p>{fallbackContent}</p>
                    </div>
                  )}

                  {Array.isArray(service.ideal_for) && service.ideal_for.length > 0 && (
                    <div className="mt-8 rounded-2xl bg-gray-50 p-6 dark:bg-gray-900/50">
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        Cet accompagnement est adapté si vous souhaitez
                      </h2>
                      <ul className="mt-4 space-y-2 text-gray-700 dark:text-gray-300">
                        {service.ideal_for.map((item) => (
                          <li key={item} className="flex items-start gap-2">
                            <CheckCircle className="mt-1 h-4 w-4 shrink-0 text-[#DA2E29]" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {service.featured_note && (
                    <p className="mt-6 rounded-xl border border-[#DA2E29]/20 bg-[#DA2E29]/5 p-4 font-medium text-gray-700 dark:text-gray-200">
                      {service.featured_note}
                    </p>
                  )}

                  {formattedDate && (
                    <div className="mt-12 pt-6 border-t border-gray-100 dark:border-gray-700/30 text-sm text-gray-500 dark:text-gray-400">
                      Dernière mise à jour: {formattedDate}
                    </div>
                  )}
                </motion.div>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-4">
                <div className="sticky top-24 space-y-6">
                  {/* Carte CTA principale */}
                  <motion.div
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700/30"
                    initial={{ opacity: 0, y: 30 }}
                    animate={isContentInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                    transition={{ duration: 0.7, delay: 0.2 }}
                  >
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      Commencer maintenant
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-5">
                      Après votre demande, nous organisons un premier échange de 30 minutes pour clarifier vos objectifs.
                    </p>

                    <ul className="mb-6 space-y-2">
                      {[
                        'Sans engagement initial',
                        'Réponse garantie sous 24h',
                        'Format adapté à votre rythme',
                      ].map((item) => (
                        <li
                          key={item}
                          className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"
                        >
                          <CheckCircle className="h-4 w-4 text-[#DA2E29] flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>

                    <Link
                      href={primaryCtaUrl}
                      className="w-full flex justify-center items-center py-3 px-4 bg-[#DA2E29] hover:bg-[#c02824] text-white rounded-lg font-medium transition-colors duration-300"
                    >
                      {primaryCtaLabel}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>

                    <div className="mt-4 text-center">
                      <Link
                        href={secondaryCtaUrl}
                        className="text-sm text-gray-500 hover:text-[#DA2E29] dark:text-gray-400 dark:hover:text-[#DA2E29] transition-colors"
                      >
                        {secondaryCtaLabel} →
                      </Link>
                    </div>
                  </motion.div>

                  {/* Délai de réponse */}
                  <motion.div
                    className="rounded-xl bg-[#DA2E29]/5 border border-[#DA2E29]/20 p-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={isContentInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ duration: 0.6, delay: 0.35 }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 shrink-0 rounded-full bg-[#DA2E29]/10 flex items-center justify-center">
                        <Clock className="h-4 w-4 text-[#DA2E29]" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          Réponse rapide garantie
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Nous répondons en moins de 24h ouvrables
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Confiance */}
                  <motion.div
                    className="rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/30 p-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={isContentInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ duration: 0.6, delay: 0.45 }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 shrink-0 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                        <Shield className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                      </div>
                      <p className="text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                        Approche confidentielle, centrée sur vos objectifs, adaptée à votre contexte
                        personnel et professionnel.
                      </p>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {testimonials.length > 0 && <TestimonialsSection testimonials={testimonials} />}

        {/* Services connexes */}
        {relatedServices.length > 0 && (
          <section className="py-16 bg-gray-50 dark:bg-gray-900">
            <div className="max-w-[1400px] mx-auto px-4 md:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  Autres services qui pourraient vous intéresser
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {relatedServices.map((relatedService, index) => (
                  <motion.div
                    key={relatedService.id}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700/30 transition-all duration-300 hover:shadow-xl"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true, amount: 0.3 }}
                  >
                    <div className="p-6">
                      {relatedService.icon && (
                        <div className="w-12 h-12 rounded-full bg-[#DA2E29]/10 flex items-center justify-center mb-4">
                          {/* Ici vous pouvez adapter pour afficher l'icône */}
                          <CheckCircle className="w-6 h-6 text-[#DA2E29]" />
                        </div>
                      )}

                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        {relatedService.name}
                      </h3>

                      {relatedService.excerpt && (
                        <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                          {relatedService.excerpt}
                        </p>
                      )}

                      <Link
                        href={route('services.details', relatedService.slug)}
                        className="inline-flex items-center text-[#DA2E29] hover:text-[#c02824] font-medium transition-colors"
                      >
                        <span>Découvrir</span>
                        <ChevronRight className="ml-1 w-5 h-5" />
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA Section */}
        <section ref={ctaRef} className="py-16">
          <div className="max-w-[1400px] mx-auto px-4 md:px-8">
            <motion.div
              className="bg-gradient-to-r from-[#DA2E29] to-rose-600 rounded-2xl p-8 md:p-12 text-center text-white relative overflow-hidden"
              initial={{ opacity: 0, y: 30 }}
              animate={isCtaInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.8 }}
            >
              {/* Decorative elements */}
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-black/10 rounded-full blur-3xl"></div>

              <div className="relative z-10 max-w-3xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Prêt à franchir le pas?</h2>
                <p className="text-white/90 text-lg mb-8 md:mb-10">
                  Contactez-nous dès maintenant pour discuter de vos besoins et découvrir comment{' '}
                  {service.name} peut vous aider à atteindre vos objectifs.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href={primaryCtaUrl}
                    className="px-8 py-4 bg-white text-[#DA2E29] rounded-lg font-medium text-lg hover:bg-gray-100 transition-colors duration-300 inline-flex items-center justify-center shadow-xl shadow-rose-600/20"
                  >
                    <Calendar className="mr-2 w-5 h-5" />
                    <span>{primaryCtaLabel}</span>
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
    </FrontLayout>
  );
};

export default ServiceDetail;
