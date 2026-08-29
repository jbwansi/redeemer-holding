/* eslint-disable prettier/prettier */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from '@inertiajs/react';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  ArrowRight,
  Calendar,
  Clock3,
  ShieldCheck,
  UsersRound,
} from 'lucide-react';

// import heroImage from '../../../../images/portrait.jpg?w=600&format=webp&quality=80';
import heroImage from '../../../../images/portrait.jpg?w=1000&format=webp&quality=85';

type ReassuranceItem = {
  text: string;
};

interface HeroMeta {
  hero_badge?: string;
  hero_title_line1?: string;
  hero_title_line2?: string;
  hero_title_line3?: string;
  hero_subtitle?: string;
  hero_cta_text?: string;
  hero_cta_url?: string;
  hero_secondary_cta_text?: string;
  hero_secondary_cta_url?: string;
  hero_image?: string;
  hero_images?: string[];
  hero_reassurance_items?: ReassuranceItem[];
  hero_floating_stat_enabled?: boolean;
  hero_floating_stat_value?: string;
  hero_floating_stat_label?: string;
  hero_social_proof_text?: string;
  hero_social_rating?: string;
  hero_social_platform?: string;
}

const defaultImages = [heroImage];

const withTextFallback = (value: string | undefined, fallback: string) =>
  value?.trim() || fallback;

const Hero = ({ meta }: { meta?: HeroMeta }) => {
  const containerRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '8%']);
  const imageY = useTransform(scrollYProgress, [0, 1], ['0%', '5%']);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});

  const handleImageError = (index: number) => {
    setImageErrors((previousErrors) => ({
      ...previousErrors,
      [index]: true,
    }));
  };

  /*
   * Contenu du Hero
   */
  const badge = withTextFallback(meta?.hero_badge, 'Transformer par les valeurs');

  const titleLine1 = withTextFallback(
    meta?.hero_title_line1,
    'Vous avez l’impression de tourner en rond ?',
  );

  const titleLine2 = withTextFallback(
    meta?.hero_title_line2,
    'Transformez votre potentiel en résultats',
  );

  const titleLine3 = withTextFallback(meta?.hero_title_line3, 'concrets et durables.');

  const subtitle = withTextFallback(
    meta?.hero_subtitle,
    'Je vous aide à clarifier vos priorités, prendre les bonnes décisions et avancer avec méthode.',
  );

  const ctaText = withTextFallback(meta?.hero_cta_text, 'Clarifier ma situation');

  const ctaUrl = withTextFallback(meta?.hero_cta_url, route('contact'));

  const secondaryCtaText = withTextFallback(
    meta?.hero_secondary_cta_text,
    'Découvrir nos accompagnements',
  );

  const secondaryCtaUrl = withTextFallback(meta?.hero_secondary_cta_url, route('services'));

  const reassuranceItems = meta?.hero_reassurance_items?.length
    ? meta.hero_reassurance_items
    : [{ text: 'Sans engagement' }, { text: '30 minutes' }, { text: 'En visio ou en présentiel' }];

  const reassuranceIcons = [ShieldCheck, Clock3, UsersRound];

  const showFloatingStat = meta?.hero_floating_stat_enabled !== false;

  const floatingStatValue = withTextFallback(meta?.hero_floating_stat_value, '97%');

  const floatingStatLabel = withTextFallback(meta?.hero_floating_stat_label, 'Satisfaction');

  const heroSocialProofText = withTextFallback(
    meta?.hero_social_proof_text,
    'Des professionnels accompagnés avec méthode et bienveillance',
  );

  const heroSocialRating = withTextFallback(meta?.hero_social_rating, 'Retours très positifs');

  const heroSocialPlatform = withTextFallback(
    meta?.hero_social_platform,
    'Accompagnements appréciés',
  );

  /*
   * Images du carrousel
   */
  const images = useMemo(() => {
    const imagesFromMeta =
      meta?.hero_images?.filter((image) => typeof image === 'string' && image.trim() !== '') ?? [];

    if (imagesFromMeta.length > 0) {
      return imagesFromMeta;
    }

    if (meta?.hero_image?.trim()) {
      return [meta.hero_image];
    }

    return defaultImages;
  }, [meta?.hero_images, meta?.hero_image]);

  /*
   * Rotation automatique du carrousel
   */
  useEffect(() => {
    if (images.length <= 1) {
      setCurrentIndex(0);
      return;
    }

    let interval: ReturnType<typeof setInterval> | null = null;

    const timeout = setTimeout(() => {
      interval = setInterval(() => {
        setCurrentIndex((previousIndex) => (previousIndex + 1) % images.length);
      }, 5000);
    }, 2500);

    return () => {
      clearTimeout(timeout);

      if (interval) {
        clearInterval(interval);
      }
    };
  }, [images.length]);

  /*
   * Empêche un index invalide lorsque la liste d’images change.
   */
  useEffect(() => {
    if (currentIndex >= images.length) {
      setCurrentIndex(0);
    }
  }, [currentIndex, images.length]);

  /*
   * Animations
   */
  const containerVariants = {
    hidden: {
      opacity: 0,
    },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 24,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.65,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  const imageVariants = {
    hidden: {
      opacity: 0,
      scale: 0.96,
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  return (
    <section
      ref={containerRef}
      className="
        relative w-full overflow-hidden
        bg-gradient-to-b from-gray-50 to-white
        pb-10 pt-28 text-gray-900
        dark:from-[#020817] dark:to-[#020817] dark:text-white
        md:pb-12 md:pt-24
        lg:pb-14 lg:pt-28
      "
    >
      {/* Décorations d’arrière-plan */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(218,46,41,0.14),transparent_32%)]" />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(30,64,175,0.06),transparent_30%)] dark:bg-[radial-gradient(circle_at_bottom_right,rgba(30,64,175,0.14),transparent_30%)]" />

      <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent dark:via-white/20" />

      {/* <div className="relative z-10 mx-auto w-full max-w-[1600px] px-5 sm:px-8 lg:px-12 xl:px-16"> */}
      <div className="relative z-10 mx-auto w-full max-w-[1700px] px-5 sm:px-8 lg:px-12 xl:px-14">
        {/* Courbes décoratives */}
        <svg
          aria-hidden="true"
          viewBox="0 0 240 560"
          fill="none"
          className="
            pointer-events-none absolute left-[43%] top-1/2
            hidden h-[88%] w-48 -translate-y-1/2
            text-[#DA2E29] opacity-65
            lg:block
          "
        >
          <path
            d="M218 8C92 88 24 216 20 356c-2 78 18 143 58 196"
            stroke="currentColor"
            strokeWidth="2"
          />

          <path
            d="M238 30C116 112 55 236 54 366c0 68 17 126 51 174"
            stroke="currentColor"
            strokeWidth="1"
            opacity="0.55"
          />
        </svg>

        {/* <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,46%)_minmax(0,54%)] lg:gap-14 xl:gap-16"> */}
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-12 xl:gap-14">

          {/* Colonne gauche : contenu */}
          <motion.div
            ref={textRef}
            className="order-1 min-w-0"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            style={{ y: textY }}
          >
            {/* Badge */}
            <motion.div variants={itemVariants} className="mb-4">
              <span
                className="
                  inline-flex items-center rounded-full
                  border border-gray-200 bg-white
                  px-3 py-1.5
                  text-xs font-semibold uppercase tracking-[0.14em]
                  text-gray-700 backdrop-blur
                  dark:border-white/10 dark:bg-white/5 dark:text-white/80
                "
              >
                {badge}
              </span>
            </motion.div>

            {/* Titre */}
            <motion.h1
              variants={itemVariants}
              className="mb-6 max-w-[720px]  
              text-4xl font-black  
              leading-[1.04] tracking-[-0.04em]  
              text-gray-900 dark:text-white  
              sm:text-5xl  
              lg:text-[3rem] 
              xl:text-[3.4rem]
              2xl:text-[3.75rem]"
            >
              <span className="block [text-wrap:balance]">
                {titleLine1}
              </span>

              <span className="mt-3 block [text-wrap:balance]">
                {titleLine2}
              </span>

              <span className="block text-[#DA2E29] [text-wrap:balance]">
                {titleLine3}
              </span>
            </motion.h1>

            {/* Sous-titre */}
            <motion.p
              variants={itemVariants}
              className="mb-6 max-w-xl  text-base leading-7 text-gray-600 dark:text-slate-300 md:text-lg md:leading-8"
            >
              {subtitle}
            </motion.p>

            {/* Appels à l’action */}
            <motion.div
              variants={itemVariants}
              className="
                flex flex-col gap-3
                sm:flex-row sm:items-center
              "
            >
              {/* CTA principal */}
              <Link
                href={ctaUrl}
                className="
                  group inline-flex min-h-12 w-full
                  items-center justify-center gap-2
                  rounded-lg bg-[#DA2E29]
                  px-5 py-3
                  text-sm font-bold text-white
                  shadow-lg shadow-[#DA2E29]/25
                  transition-colors
                  hover:bg-[#c62823]
                  focus-visible:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-[#DA2E29]
                  focus-visible:ring-offset-2
                  dark:focus-visible:ring-offset-[#020817]
                  sm:w-auto
                "
              >
                <Calendar className="h-4 w-4 shrink-0" />

                <span>{ctaText}</span>

                <ArrowRight className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>

              {/* CTA secondaire */}
              <Link
                href={secondaryCtaUrl}
                className="
                  group inline-flex min-h-12 w-full
                  items-center justify-center gap-2
                  rounded-lg border border-[#DA2E29]/70
                  bg-white px-5 py-3
                  text-sm font-bold text-gray-900
                  transition-colors
                  hover:bg-[#DA2E29]/10
                  focus-visible:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-[#DA2E29]
                  dark:bg-slate-950/45 dark:text-white
                  sm:w-auto
                "
              >
                <span>{secondaryCtaText}</span>

                <ArrowRight className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
            </motion.div>

            {/* Éléments de réassurance */}
            {/* Éléments de réassurance */}
            <motion.div
              variants={containerVariants}
              className="
    mt-5 flex flex-wrap items-center
    gap-y-3 text-gray-700
    dark:text-slate-200
  "
            >
              {reassuranceItems.map((item, index) => {
                const Icon =
                  reassuranceIcons[index] ??
                  ShieldCheck;

                return (
                  <React.Fragment key={`${item.text}-${index}`}>
                    {index > 0 && (
                      <div
                        aria-hidden="true"
                        className="
              mx-5 hidden h-9 w-px
              bg-gray-300
              dark:bg-white/25
              sm:block
            "
                      />
                    )}

                    <motion.div
                      variants={itemVariants}
                      className="
            flex min-w-fit items-center gap-3
            text-sm font-medium
            sm:text-base
          "
                    >
                      <Icon
                        aria-hidden="true"
                        strokeWidth={1.8}
                        className="
              h-8 w-8 shrink-0
              text-[#DA2E29]
              sm:h-9 sm:w-9
            "
                      />

                      <span>{item.text}</span>
                    </motion.div>
                  </React.Fragment>
                );
              })}
            </motion.div>

            {/* Preuve sociale configurable */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.4,
                duration: 0.5,
              }}
              className="
                mt-5 flex flex-wrap items-center
                gap-x-3 gap-y-2
                border-t border-gray-200 pt-4
                dark:border-white/10"
            >
              {heroSocialProofText && (
                <span className="text-xs text-gray-600 dark:text-slate-400">
                  {heroSocialProofText}
                </span>
              )}
              <div className="flex items-center gap-3">

                <div className="flex text-sm tracking-[0.08em] text-yellow-400" aria-label="5 étoiles">★★★★★</div>

                {heroSocialRating && (
                  <span className="text-xs font-bold text-gray-900 dark:text-white">
                    {heroSocialRating}
                  </span>
                )}

                {heroSocialPlatform && (
                  <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-white/10 dark:text-slate-300">
                    {heroSocialPlatform}
                  </span>
                )}
              </div>

            </motion.div>
          </motion.div>

          {/* Colonne droite : image */}
          <motion.div
            ref={imageRef}
            className="order-2 min-w-0"
            initial="hidden"
            animate="visible"
            variants={imageVariants}
            style={{ y: imageY }}
          >
            {/* Halo rouge */}
            <div className="relative mx-auto w-full max-w-[900px]">
              {/* Conteneur de l’image */}
              <div
                className="
                  relative overflow-hidden
                  rounded-[1.75rem]
                  border border-white/10
                  bg-slate-950 shadow-2xl"
              >
                <div
                  className="
                    relative aspect-[4/5] w-full overflow-hidden
                    sm:aspect-[5/4]
                    md:h-[560px] md:aspect-auto
                    lg:h-[650px]
                    xl:h-[720px]
                    2xl:h-[760px]"
                >
                  <motion.img
                    key={`${currentIndex}-${images[currentIndex]}`}
                    src={imageErrors[currentIndex] ? defaultImages[0] : images[currentIndex]}
                    alt="Coaching et accompagnement"
                    className="
                      absolute inset-0
                      h-full w-full
                      object-cover object-[center_30%]
                    "
                    onError={() => handleImageError(currentIndex)}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.35 }}
                    loading={currentIndex === 0 ? 'eager' : 'lazy'}
                    fetchPriority={currentIndex === 0 ? 'high' : 'auto'}
                    decoding="async"
                    sizes="(min-width: 1536px) 850px, (min-width: 1024px) 50vw, 100vw"
                    width={1000}
                    height={1500}
                  />

                  {/* Superpositions */}
                  <div className="absolute inset-0 bg-slate-950/10" />

                  <div
                    className="
                      absolute inset-0
                      bg-gradient-to-r
                      from-[#020817]/55
                      via-[#020817]/10
                      to-transparent
                      md:from-[#020817]/40
                    "
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/5" />
                </div>
              </div>

              {/* Statistique flottante */}
              {showFloatingStat && (
                <motion.div
                  initial={{
                    opacity: 0,
                    x: 18,
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                  }}
                  transition={{
                    delay: 0.45,
                    duration: 0.5,
                  }}
                  className="
                    absolute bottom-5 right-4
                    flex h-24 w-24
                    flex-col items-center justify-center
                    rounded-full
                    border-2 border-[#DA2E29]/80
                    bg-[#020817]/90
                    px-3 text-center
                    shadow-2xl shadow-black/40
                    backdrop-blur-md
                    md:bottom-6 md:right-5
                    md:h-28 md:w-28
                    lg:h-32 lg:w-32
                  "
                >
                  <div className="text-3xl font-black tracking-tight text-white md:text-4xl">
                    {floatingStatValue}
                  </div>

                  <div className="mt-1 text-[11px] font-semibold leading-tight text-slate-200 md:text-xs">
                    {floatingStatLabel}
                  </div>
                </motion.div>
              )}

              {/* Navigation du carrousel */}
              {images.length > 1 && (
                <div
                  className="
                    absolute bottom-4 left-1/2
                    flex -translate-x-1/2
                    items-center gap-2
                    rounded-full
                    border border-white/10
                    bg-slate-950/65
                    px-3 py-2
                    backdrop-blur-md
                  "
                >
                  {images.map((_, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setCurrentIndex(index)}
                      className={`
                        h-2 rounded-full
                        transition-all duration-300
                        ${index === currentIndex
                          ? 'w-5 bg-white'
                          : 'w-2 bg-white/35 hover:bg-white/60'
                        }
                      `}
                      aria-label={`Afficher l’image ${index + 1}`}
                      aria-current={index === currentIndex ? 'true' : undefined}
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
