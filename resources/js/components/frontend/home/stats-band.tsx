import React, { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'

interface StatItem {
    value: string
    label: string
    prefix?: string
    suffix?: string
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

function AnimatedCounter({ value }: { value: string }) {
    const { num, prefix, suffix } = parseNumber(value)
    const [display, setDisplay] = useState(0)
    const ref = useRef<HTMLSpanElement>(null)
    const inView = useInView(ref, { once: true })

    useEffect(() => {
        if (!inView) return

        let start = 0
        const end = num
        const duration = 1800
        const step = end / (duration / 16)

        const timer = setInterval(() => {
            start += step

            if (start >= end) {
                setDisplay(end)
                clearInterval(timer)
            } else {
                setDisplay(start)
            }
        }, 16)

        return () => clearInterval(timer)
    }, [inView, num])

    const formatted = Number.isInteger(num)
        ? Math.round(display).toString()
        : display.toFixed(1)

    return (
        <span ref={ref}>
            {prefix}
            {formatted}
            {suffix}
        </span>
    )
}

export default function StatsBand({ stats }: { stats: StatItem[] }) {
    if (!stats?.length) return null

    const gridColsClass =
        {
            1: 'md:grid-cols-1',
            2: 'md:grid-cols-2',
            3: 'md:grid-cols-3',
            4: 'md:grid-cols-4',
        }[Math.min(stats.length, 4)] ?? 'md:grid-cols-4'

    return (
        <section className="py-20 md:py-24 bg-white dark:bg-gray-950">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="overflow-hidden rounded-3xl bg-[#DA2E29] px-6 py-10 shadow-sm md:px-10 md:py-12">
                    <div className={`grid grid-cols-2 gap-8 text-center text-white ${gridColsClass}`}>
                        {stats.map((stat, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.4 }}
                                transition={{ delay: i * 0.1, duration: 0.6 }}
                                className="relative"
                            >
                                <div className="text-4xl font-bold tracking-tight md:text-5xl">
                                    <AnimatedCounter value={stat.value} />
                                </div>

                                <div className="mt-2 text-sm font-medium text-white/80 md:text-base">
                                    {stat.label}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}