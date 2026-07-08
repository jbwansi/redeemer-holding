import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';

type Testimonial = {
  id: number;
  name: string;
  role?: string | null;
  company?: string | null;
  photo?: string | null;
  message: string;
  rating?: number;
  position?: number | null;
};

const TestimonialsSection = ({ testimonials = [] }: { testimonials: Testimonial[] }) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });

  const items = [...testimonials].sort((a, b) => (a.position ?? 0) - (b.position ?? 0)).slice(0, 6);

  if (!items.length) return null;

  return (
    <section className="relative overflow-hidden bg-[#020817] py-20 text-white md:py-24">
      <div className="absolute inset-0 bg-gradient-to-b from-[#020817] via-[#07111f] to-[#020817]" />
      <div className="absolute -left-24 top-20 h-80 w-80 rounded-full bg-[#da2e29]/20 blur-3xl" />
      <div className="absolute -right-24 bottom-20 h-80 w-80 rounded-full bg-red-500/10 blur-3xl" />

      <div ref={ref} className="relative z-10 mx-auto max-w-[1320px] px-6 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
          transition={{ duration: 0.6 }}
          className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end"
        >
          <div className="max-w-3xl">
            <p className="text-sm font-black uppercase tracking-[0.25em] text-[#ff4a45]">
              Témoignages
            </p>

            <h2 className="mt-3 text-3xl font-black text-white md:text-5xl">
              Ils ont avancé avec clarté
            </h2>

            <p className="mt-4 text-slate-300">
              Des retours concrets de personnes accompagnées dans leur progression.
            </p>
          </div>

          <div className="flex gap-3">
            <button className="testimonial-prev inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition hover:bg-[#da2e29]">
              <ChevronLeft className="h-5 w-5" />
            </button>

            <button className="testimonial-next inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition hover:bg-[#da2e29]">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </motion.div>

        <Swiper
          modules={[Navigation, Autoplay]}
          spaceBetween={24}
          slidesPerView={1}
          navigation={{
            prevEl: '.testimonial-prev',
            nextEl: '.testimonial-next',
          }}
          autoplay={{
            delay: 4500,
            disableOnInteraction: false,
          }}
          breakpoints={{
            768: { slidesPerView: 2 },
            1280: { slidesPerView: 3 },
          }}
          className="!overflow-visible"
        >
          {items.map((testimonial, index) => (
            <SwiperSlide key={testimonial.id} className="h-auto">
              <motion.article
                initial={{ opacity: 0, y: 24 }}
                animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
                className="group relative h-full overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.05] p-7 shadow-xl shadow-black/20 backdrop-blur transition hover:-translate-y-1 hover:border-[#da2e29]/50 hover:bg-white/[0.07]"
              >
                <Quote className="absolute right-6 top-6 h-10 w-10 text-[#da2e29]/25" />

                <div className="mb-6 flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < (testimonial.rating || 5)
                          ? 'fill-[#ff4a45] text-[#ff4a45]'
                          : 'text-slate-600'
                      }`}
                    />
                  ))}
                </div>

                <p className="min-h-[150px] text-sm leading-8 text-slate-300">
                  “{testimonial.message}”
                </p>

                <div className="mt-8 flex items-center gap-4 border-t border-white/10 pt-5">
                  <img
                    src={
                      testimonial.photo
                        ? testimonial.photo.startsWith('/storage/')
                          ? testimonial.photo
                          : `/storage/${testimonial.photo}`
                        : '/assets/images/avatar.jpg'
                    }
                    alt={testimonial.name}
                    className="h-14 w-14 rounded-full border border-white/10 object-cover"
                  />

                  <div>
                    <p className="font-bold text-white">{testimonial.name}</p>

                    {(testimonial.role || testimonial.company) && (
                      <p className="mt-1 text-sm text-slate-400">
                        {[testimonial.role, testimonial.company].filter(Boolean).join(' · ')}
                      </p>
                    )}
                  </div>
                </div>
              </motion.article>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default TestimonialsSection;
