import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

export default function FrequentEventsGallery({
  images = [],
  captions = [],
  title,
  subtitle,
}: {
  images?: string[];
  captions?: string[];
  title?: string;
  subtitle?: string;
}) {
  const galleryItems = images
    .map((src, index) => ({
      src: typeof src === 'string' ? src.trim() : '',
      caption: typeof captions[index] === 'string' ? captions[index].trim() : '',
    }))
    .filter((item) => item.src !== '');

  if (!galleryItems.length) return null;

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isPanning, setIsPanning] = useState(false);
  const pinchStartDistanceRef = useRef<number | null>(null);
  const panStartRef = useRef<{ x: number; y: number; originX: number; originY: number } | null>(
    null
  );

  const clampZoom = useCallback((value: number) => Math.min(4, Math.max(1, value)), []);
  const closeLightbox = useCallback(() => {
    setLightboxIndex(null);
    setZoom(1);
    setPanX(0);
    setPanY(0);
    setIsPanning(false);
    pinchStartDistanceRef.current = null;
    panStartRef.current = null;
  }, []);
  const showPrev = useCallback(
    () =>
      setLightboxIndex((i) =>
        i !== null ? (i - 1 + galleryItems.length) % galleryItems.length : null
      ),
    [galleryItems.length]
  );
  const showNext = useCallback(
    () => setLightboxIndex((i) => (i !== null ? (i + 1) % galleryItems.length : null)),
    [galleryItems.length]
  );

  useEffect(() => {
    if (lightboxIndex !== null) {
      setZoom(1);
      setPanX(0);
      setPanY(0);
      setIsPanning(false);
      pinchStartDistanceRef.current = null;
      panStartRef.current = null;
    }
  }, [lightboxIndex]);

  useEffect(() => {
    if (zoom <= 1) {
      setPanX(0);
      setPanY(0);
      setIsPanning(false);
      panStartRef.current = null;
    }
  }, [zoom]);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') showPrev();
      if (e.key === 'ArrowRight') showNext();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxIndex, closeLightbox, showPrev, showNext]);

  return (
    <section className="relative overflow-hidden bg-[#f8f7f3] py-20 dark:bg-slate-950">
      <div className="pointer-events-none absolute -top-24 -left-20 h-72 w-72 rounded-full bg-[#DA2E29]/10 blur-3xl" />
      <div className="pointer-events-none absolute right-0 bottom-0 h-80 w-80 rounded-full bg-[#0f766e]/10 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-[1400px] px-6 md:px-8">
        <motion.div
          className="mb-12 text-center"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-block rounded-full bg-[#DA2E29]/10 px-4 py-1 text-sm font-medium text-[#DA2E29]">
            Nos activités en images
          </span>
          <h2 className="mt-4 text-3xl font-bold text-slate-900 md:text-4xl dark:text-white">
            {title ?? 'Galerie photos'}
          </h2>
          {subtitle && (
            <p className="mt-3 mx-auto max-w-2xl text-slate-600 dark:text-slate-300">{subtitle}</p>
          )}
        </motion.div>

        <div className="columns-2 gap-4 md:columns-3 lg:columns-4">
          {galleryItems.map((item, index) => (
            <motion.div
              key={index}
              className="group mb-4 break-inside-avoid overflow-hidden rounded-2xl cursor-zoom-in"
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.45, delay: index * 0.05 }}
              onClick={() => setLightboxIndex(index)}
            >
              <img
                src={item.src}
                alt={`Activité ${index + 1}`}
                className="w-full object-cover transition-transform duration-700 group-hover:scale-110"
                loading="lazy"
                decoding="async"
                sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Lightbox ── */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/92 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeLightbox}
          >
            {/* Close */}
            <button
              className="absolute top-4 right-4 z-10 rounded-full bg-white/10 p-2 text-white backdrop-blur-sm transition hover:bg-white/25"
              onClick={closeLightbox}
              aria-label="Fermer"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Prev */}
            {galleryItems.length > 1 && (
              <button
                className="absolute left-4 z-10 rounded-full bg-white/10 p-3 text-white backdrop-blur-sm transition hover:bg-white/25"
                onClick={(e) => {
                  e.stopPropagation();
                  showPrev();
                }}
                aria-label="Photo précédente"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            )}

            {/* Image */}
            <motion.div
              className="flex max-h-[90vh] max-w-[90vw] items-center justify-center overflow-hidden"
              initial={{ opacity: 0, scale: 0.93 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.93 }}
              transition={{ duration: 0.22 }}
              onClick={(e) => e.stopPropagation()}
              onWheel={(e) => {
                e.preventDefault();
                const delta = e.deltaY < 0 ? 0.2 : -0.2;
                setZoom((z) => clampZoom(z + delta));
              }}
              onMouseDown={(e) => {
                if (zoom <= 1) return;
                e.preventDefault();
                setIsPanning(true);
                panStartRef.current = {
                  x: e.clientX,
                  y: e.clientY,
                  originX: panX,
                  originY: panY,
                };
              }}
              onMouseMove={(e) => {
                if (!isPanning || !panStartRef.current || zoom <= 1) return;
                const dx = e.clientX - panStartRef.current.x;
                const dy = e.clientY - panStartRef.current.y;
                setPanX(panStartRef.current.originX + dx);
                setPanY(panStartRef.current.originY + dy);
              }}
              onMouseUp={() => {
                setIsPanning(false);
                panStartRef.current = null;
              }}
              onMouseLeave={() => {
                setIsPanning(false);
                panStartRef.current = null;
              }}
              onTouchStart={(e) => {
                if (e.touches.length === 2) {
                  const [a, b] = e.touches;
                  pinchStartDistanceRef.current = Math.hypot(
                    a.clientX - b.clientX,
                    a.clientY - b.clientY
                  );
                  setIsPanning(false);
                  panStartRef.current = null;
                } else if (e.touches.length === 1 && zoom > 1) {
                  const touch = e.touches[0];
                  setIsPanning(true);
                  panStartRef.current = {
                    x: touch.clientX,
                    y: touch.clientY,
                    originX: panX,
                    originY: panY,
                  };
                }
              }}
              onTouchMove={(e) => {
                if (e.touches.length === 2 && pinchStartDistanceRef.current) {
                  const [a, b] = e.touches;
                  const distance = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
                  const ratio = distance / pinchStartDistanceRef.current;
                  setZoom((z) => clampZoom(z * ratio));
                  pinchStartDistanceRef.current = distance;
                } else if (e.touches.length === 1 && isPanning && panStartRef.current && zoom > 1) {
                  const touch = e.touches[0];
                  const dx = touch.clientX - panStartRef.current.x;
                  const dy = touch.clientY - panStartRef.current.y;
                  setPanX(panStartRef.current.originX + dx);
                  setPanY(panStartRef.current.originY + dy);
                }
              }}
              onTouchEnd={() => {
                pinchStartDistanceRef.current = null;
                setIsPanning(false);
                panStartRef.current = null;
              }}
            >
              <img
                key={lightboxIndex}
                src={galleryItems[lightboxIndex].src}
                alt={`Activité ${lightboxIndex + 1}`}
                className="max-h-[90vh] max-w-[90vw] rounded-xl object-contain shadow-2xl transition-transform duration-100"
                loading="eager"
                decoding="async"
                style={{
                  transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
                  cursor: zoom > 1 ? (isPanning ? 'grabbing' : 'grab') : 'zoom-in',
                }}
              />
            </motion.div>

            {galleryItems[lightboxIndex]?.caption && (
              <p className="absolute bottom-14 left-1/2 max-w-[90vw] -translate-x-1/2 rounded-lg bg-black/45 px-4 py-2 text-center text-sm text-white backdrop-blur-sm">
                {galleryItems[lightboxIndex].caption}
              </p>
            )}

            {/* Next */}
            {galleryItems.length > 1 && (
              <button
                className="absolute right-4 z-10 rounded-full bg-white/10 p-3 text-white backdrop-blur-sm transition hover:bg-white/25"
                onClick={(e) => {
                  e.stopPropagation();
                  showNext();
                }}
                aria-label="Photo suivante"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            )}

            {/* Counter */}
            <span className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-4 py-1 text-sm text-white backdrop-blur-sm">
              {lightboxIndex + 1} / {galleryItems.length} • Zoom x{zoom.toFixed(1)}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
