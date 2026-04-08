import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';

interface StatItem { value: string; label: string; prefix?: string; suffix?: string }

function parseNumber(val: string): { num: number; prefix: string; suffix: string } {
    const match = val.match(/^([^0-9]*)(\d+(?:\.\d+)?)([^0-9]*)$/);
    if (!match) return { num: 0, prefix: '', suffix: val };
    return { num: parseFloat(match[2]), prefix: match[1], suffix: match[3] };
}

function AnimatedCounter({ value }: { value: string }) {
    const { num, prefix, suffix } = parseNumber(value);
    const [display, setDisplay] = useState(0);
    const ref = useRef<HTMLSpanElement>(null);
    const inView = useInView(ref, { once: true });

    useEffect(() => {
        if (!inView) return;
        let start = 0;
        const end = num;
        const duration = 1800;
        const step = end / (duration / 16);
        const timer = setInterval(() => {
            start += step;
            if (start >= end) { setDisplay(end); clearInterval(timer); }
            else setDisplay(start);
        }, 16);
        return () => clearInterval(timer);
    }, [inView, num]);

    const formatted = Number.isInteger(num) ? Math.round(display).toString() : display.toFixed(1);

    return <span ref={ref}>{prefix}{formatted}{suffix}</span>;
}

export default function StatsBand({ stats }: { stats: StatItem[] }) {
    if (!stats?.length) return null;

    const gridColsClass = {
        1: 'md:grid-cols-1',
        2: 'md:grid-cols-2',
        3: 'md:grid-cols-3',
        4: 'md:grid-cols-4',
    }[Math.min(stats.length, 4)] ?? 'md:grid-cols-4';

    return (
        <section className="bg-[#DA2E29] py-14">
            <div className="max-w-[1400px] mx-auto px-6 md:px-8">
                <div className={`grid grid-cols-2 ${gridColsClass} gap-8 text-white text-center`}>
                    {stats.map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1, duration: 0.6 }}
                        >
                            <div className="text-4xl md:text-5xl font-bold mb-2">
                                <AnimatedCounter value={stat.value} />
                            </div>
                            <div className="text-white/80 text-sm md:text-base font-medium">{stat.label}</div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
