import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import { useCookieConsent } from '@/components/frontend/consent/cookie-consent-provider';

function resolveEmbedUrl(url: string): string | null {
  if (!url || url.trim() === '') return null;

  // YouTube: standard, short, embed, shorts
  const ytMatch = url.match(
    /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  if (ytMatch) {
    return `https://www.youtube.com/embed/${ytMatch[1]}?rel=0&modestbranding=1`;
  }

  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}?byline=0&portrait=0`;
  }

  // Already an embed URL — return as-is
  if (url.includes('/embed/') || url.includes('player.vimeo.com')) {
    return url;
  }

  return null;
}

export default function WelcomeVideo({
  videoUrl,
  title,
  subtitle,
  enabled = true,
}: {
  videoUrl?: string;
  title?: string;
  subtitle?: string;
  enabled?: boolean;
}) {
  const embedUrl = useMemo(() => resolveEmbedUrl(videoUrl ?? ''), [videoUrl]);
  const { consent, allowExternalMedia } = useCookieConsent();

  if (!enabled || !embedUrl) return null;

  return (
    <section className="relative overflow-hidden bg-white py-20 dark:bg-slate-900">
      {/* Background blobs */}
      <div className="pointer-events-none absolute top-0 right-0 h-64 w-64 rounded-full bg-[#DA2E29]/8 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-64 w-64 rounded-full bg-[#0f766e]/8 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-5xl px-6 md:px-8">
        {/* Header */}
        <motion.div
          className="mb-10 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-flex items-center gap-2 rounded-full bg-[#DA2E29]/10 px-4 py-1.5 text-sm font-medium text-[#DA2E29]">
            <Play className="h-3.5 w-3.5 fill-current" />
            Mot de bienvenue
          </span>
          {title && (
            <h2 className="mt-4 text-3xl font-bold text-slate-900 md:text-4xl dark:text-white">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="mt-3 mx-auto max-w-2xl text-slate-600 dark:text-slate-300">{subtitle}</p>
          )}
        </motion.div>

        {/* Video embed */}
        <motion.div
          className="overflow-hidden rounded-2xl shadow-2xl ring-1 ring-slate-200 dark:ring-slate-700"
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.1 }}
        >
          {consent?.externalMedia ? (
            <div className="relative w-full" style={{ paddingTop: '56.25%' /* 16/9 */ }}>
              <iframe
                className="absolute inset-0 h-full w-full"
                src={embedUrl}
                title={title ?? 'Vidéo de bienvenue'}
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          ) : (
            <div className="flex aspect-video flex-col items-center justify-center bg-slate-950 px-6 text-center text-white">
              <Play className="h-12 w-12 text-[#DA2E29]" aria-hidden="true" />
              <h3 className="mt-4 text-xl font-bold">Autoriser la vidéo externe</h3>
              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">
                Cette vidéo est hébergée par YouTube ou Vimeo. Elle ne sera chargée qu’après votre
                accord pour les médias externes.
              </p>
              <button type="button" onClick={allowExternalMedia} className="ux-btn-primary mt-5 min-h-11">
                Autoriser et charger la vidéo
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
