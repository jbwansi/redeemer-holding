import 'keen-slider/keen-slider.min.css'
import { useKeenSlider } from 'keen-slider/react'
import { useEffect } from 'react'
import { Quote } from 'lucide-react'

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
                    {testimonials.map((item: any, idx: number) => {
                        // Normalisation des champs
                        const displayName = item.name ?? item.author
                        const displayMessage = item.message ?? item.content
                        const displayRole = item.role ?? item.position
                        const displayPhoto = item.photo ?? item.image

                        return (
                            <div key={idx} className="keen-slider__slide">
                                <div className="rounded-2xl bg-white/5 border border-white/10 p-6 h-full flex flex-col">

                                    <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-[#da2e29] dark:bg-red-500/10">
                                        <Quote className="h-5 w-5" />
                                    </div>

                                    {displayMessage && (
                                        <p className="text-sm text-slate-300 italic mb-6 flex-1">
                                            "{displayMessage}"
                                        </p>
                                    )}

                                    {/* Étoiles si rating disponible */}
                                    {item.rating && (
                                        <div className="mt-4 flex">
                                            {[...Array(item.rating)].map((_, i) => (
                                                <span key={i} className="text-sm">⭐</span>
                                            ))}
                                        </div>
                                    )}

                                    <div className="mt-6 flex items-center gap-3 border-t border-gray-100 pt-4 dark:border-white/10">
                                        {displayPhoto ? (
                                            <img
                                                src={displayPhoto}
                                                alt={displayName}
                                                className="h-10 w-10 rounded-full object-cover shrink-0"
                                            />
                                        ) : (
                                            <div className="h-10 w-10 rounded-full bg-red-500/20 flex items-center justify-center shrink-0 text-sm font-semibold text-red-400">
                                                {displayName?.charAt(0)}
                                            </div>
                                        )}

                                        <div>
                                            <p className="font-semibold text-white">
                                                {displayName}
                                            </p>
                                            <p className="text-xs text-slate-400">
                                                {[displayRole, item.company].filter(Boolean).join(' · ')}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}