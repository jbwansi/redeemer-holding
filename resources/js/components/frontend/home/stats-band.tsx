import React, { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import * as LucideIcons from 'lucide-react'
import { LucideIcon } from 'lucide-react'

interface StatItem {
    value: string
    label: string
    prefix?: string
    suffix?: string
    icon?: string
}

const ICON_MAP: Record<string, LucideIcon> = {
    Users: LucideIcons.Users,
    Star: LucideIcons.Star,
    BookOpen: LucideIcons.BookOpen,
    Award: LucideIcons.Award,
    TrendingUp: LucideIcons.TrendingUp,
    Clock: LucideIcons.Clock,
    Target: LucideIcons.Target,
    Zap: LucideIcons.Zap,
}

function parseNumber(val: string): { num: number; prefix: string; suffix: string } {
    const match = val.match(/^([^0-9]*)(\d+(?:\.\d+)?)([^0-9]*)$/)
    if (!match) return { num: 0, prefix: '', suffix: val }
    return {
        num: parseFloat(match[2]),
        prefix: match[1],
        suffix: match[3],
    }
}

// Ease-out cubique pour un rendu plus naturel
function easeOut(t: number): number {
    return 1 - Math.pow(1 - t, 3)
}

function AnimatedCounter({ value }: { value: string }) {
    const { num, prefix, suffix } = parseNumber(value)
    const [display, setDisplay] = useState(0)
    const ref = useRef<HTMLSpanElement>(null)
    const inView = useInView(ref, { once: true })

    useEffect(() => {
        if (!inView) return

        const duration = 1800
        const startTime = performance.now()

        const tick = (now: number) => {
            const elapsed = now - startTime
            const progress = Math.min(elapsed / duration, 1)
            const easedProgress = easeOut(progress)

            setDisplay(easedProgress * num)

            if (progress < 1) {
                requestAnimationFrame(tick)
            }
        }

        const raf = requestAnimationFrame(tick)
        return () => cancelAnimationFrame(raf)
    }, [inView, num])

    const formatted = Number.isInteger(num)
        ? Math.round(display).toString()
        : display.toFixed(1)

    return (
        <span ref={ref}>
            {prefix}{formatted}{suffix}
        </span>
    )
}

export default function StatsBand({ stats }: { stats: StatItem[] }) {
    if (!stats?.length) return null

    const count = Math.min(stats.length, 4)
    const gridColsClass = {
        1: 'md:grid-cols-1',
        2: 'md:grid-cols-2',
        3: 'md:grid-cols-3',
        4: 'md:grid-cols-4',
    }[count] ?? 'md:grid-cols-4'

    return (
        <section className="py-20 md:py-24 bg-white dark:bg-gray-950">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="overflow-hidden rounded-3xl bg-[#DA2E29] px-6 py-10 shadow-sm md:px-10 md:py-12">
                    <div className={`grid grid-cols-2 gap-y-10 text-center text-white ${gridColsClass}`}>
                        {stats.map((stat, i) => {
                            const Icon = stat.icon ? (ICON_MAP[stat.icon] ?? null) : null
                            const isLastInRow = (i + 1) % count === 0
                            const isLastItem = i === stats.length - 1

                            return (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, amount: 0.4 }}
                                    transition={{ delay: i * 0.1, duration: 0.6 }}
                                    className={`relative flex flex-col items-center px-4 ${
                                        !isLastInRow && !isLastItem
                                            ? 'md:border-r md:border-white/20'
                                            : ''
                                    }`}
                                >
                                    {/* Icône optionnelle */}
                                    {Icon && (
                                        <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/15">
                                            <Icon className="h-4 w-4 text-white" />
                                        </div>
                                    )}

                                    {/* Valeur animée */}
                                    <div className="text-4xl font-bold tracking-tight md:text-5xl">
                                        <AnimatedCounter value={stat.value} />
                                    </div>

                                    {/* Label */}
                                    <div className="mt-2 text-sm font-medium text-white/80 md:text-base">
                                        {stat.label}
                                    </div>
                                </motion.div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </section>
    )
}