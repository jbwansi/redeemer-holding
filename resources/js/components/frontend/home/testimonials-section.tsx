import 'keen-slider/keen-slider.min.css'
import { useKeenSlider } from 'keen-slider/react'
import { useEffect } from 'react'

export default function TestimonialsSection({ testimonials }: any) {
    const [sliderRef, instanceRef] = useKeenSlider({
        loop: true,
        slides: {
            perView: 1.2,
            spacing: 16,
        },
        breakpoints: {
            "(min-width: 768px)": {
                slides: { perView: 2, spacing: 20 },
            },
            "(min-width: 1280px)": {
                slides: { perView: 3, spacing: 24 },
            },
        },
    })

    // autoplay
    useEffect(() => {
        const interval = setInterval(() => {
            instanceRef.current?.next()
        }, 3500)

        return () => clearInterval(interval)
    }, [instanceRef])

    if (!testimonials?.length) return null

    return (
        <section className="py-20 bg-[#020817] text-white">
            <div className="max-w-7xl mx-auto px-6">

                <h2 className="text-3xl font-bold mb-10 text-center">
                    Ce que disent mes clients
                </h2>

                <div ref={sliderRef} className="keen-slider">
                    {testimonials.map((t: any) => (
                        <div key={t.id} className="keen-slider__slide">
                            <div className="rounded-2xl bg-white/5 border border-white/10 p-6 h-full flex flex-col">

                                <p className="text-sm text-slate-300 italic mb-6">
                                    “{t.message}”
                                </p>

                                <div className="mt-auto flex items-center gap-3">
                                    {t.photo ? (
                                        <img
                                            src={t.photo}
                                            className="h-10 w-10 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="h-10 w-10 rounded-full bg-red-500/20 flex items-center justify-center">
                                            {t.name?.charAt(0)}
                                        </div>
                                    )}

                                    <div>
                                        <p className="font-semibold">{t.name}</p>
                                        <p className="text-xs text-slate-400">
                                            {[t.role, t.company].filter(Boolean).join(' · ')}
                                        </p>
                                    </div>

                                    <div className="ml-auto flex">
                                        {[...Array(t.rating || 5)].map((_, i) => (
                                            <span key={i}>⭐</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}