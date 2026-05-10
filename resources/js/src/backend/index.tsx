import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Users, Calendar, BookOpen, Newspaper,
    DollarSign, Star, ArrowUpRight, ArrowDownRight, Activity
} from 'lucide-react';
import { useMemo, useState } from 'react';

import {
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';

function Dashboard({
    stats,
    visitorsByCountry = [],
    visitorsByDay = [],
    topPages = [],
    trafficSources = [],
    gaError = null
}: any) {
    const pieColors = ['#DA2E29', '#F97316', '#2563EB', '#10B981', '#7C3AED'];
    const queueHealth = stats?.queue_health;

    const queueStatusConfig: Record<string, { label: string; badge: string; border: string }> = {
        healthy: {
            label: 'Sain',
            badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
            border: 'border-emerald-200/70 dark:border-emerald-500/30'
        },
        alert: {
            label: 'Alerte',
            badge: 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300',
            border: 'border-rose-200/70 dark:border-rose-500/30'
        },
        unavailable: {
            label: 'Indisponible',
            badge: 'bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-slate-300',
            border: 'border-slate-200/70 dark:border-slate-600/40'
        }
    };

    const formatGaDate = (date: string) => {
        if (!date || date.length !== 8) return date;
        return `${date.slice(6, 8)}.${date.slice(4, 6)}`;
    };

    const sortedVisitorsByDay = useMemo(() => {
        return [...visitorsByDay].sort((a, b) =>
            a.name.localeCompare(b.name)
        );
    }, [visitorsByDay]);

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('fr-FR', {
            weekday: 'short',
            day: '2-digit',
            month: 'short',
        });
    };

    const queueStatus = queueStatusConfig[queueHealth?.status] ?? queueStatusConfig.unavailable;

    const formatTrend = (value: number) => {
        if (!Number.isFinite(value)) return '+0%';
        return `${value > 0 ? '+' : ''}${value}%`;
    };

    const [funnelType, setFunnelType] = useState<'current' | 'upcoming'>('current');

    const funnelData =
        funnelType === 'current'
            ? (stats.event_funnel_current ?? [])
            : (stats.event_funnel_upcoming ?? []);

    const postHeatmapData = stats?.post_views_heatmap ?? [];

    const maxPostHeatmapValue = Math.max(
        ...postHeatmapData.map((item: any) => Number(item.value)),
        1
    );

    const getPostHeatmapIntensity = (value: number) => {
        const ratio = value / maxPostHeatmapValue;

        if (ratio >= 0.75) return 'bg-blue-700 text-white';
        if (ratio >= 0.5) return 'bg-blue-500 text-white';
        if (ratio >= 0.25) return 'bg-blue-300 text-slate-900';
        if (value > 0) return 'bg-blue-100 text-slate-900';
        return 'bg-slate-100 text-slate-400 dark:bg-slate-800';
    };

    const heatmapData = stats?.event_registration_heatmap ?? [];

    const maxHeatmapValue = Math.max(
        ...heatmapData.map((item: any) => Number(item.value)),
        1
    );

    const getHeatmapIntensity = (value: number) => {
        const ratio = value / maxHeatmapValue;

        if (ratio >= 0.75) return 'bg-red-700';
        if (ratio >= 0.5) return 'bg-red-500';
        if (ratio >= 0.25) return 'bg-red-300';
        if (value > 0) return 'bg-red-100';
        return 'bg-slate-100 dark:bg-slate-800';
    };

    const cardClass =
        "border-slate-200/70 bg-white/95 shadow-sm dark:border-slate-700/70 dark:bg-slate-900/70";

    const cardHeaderClass = "pb-1";

    const cardTitleClass = "text-base font-semibold";

    const cardSubtitleClass = "text-xs text-muted-foreground";

    const chartGridStroke = "rgba(148, 163, 184, 0.25)";

    const EmptyState = ({ message = "Aucune donnée disponible" }: { message?: string }) => (
        <div className="flex h-[220px] items-center justify-center rounded-xl border border-dashed border-slate-200 text-sm text-muted-foreground dark:border-slate-700">
            {message}
        </div>
    );

    const cards = [
        {
            title: "Événements actifs",
            value: stats.events.active,
            total: stats.events.total,
            icon: Calendar,
            trend: stats.events.trend,
            iconBg: "bg-blue-500/15",
            iconColor: "text-blue-600"
        },
        {
            title: "Formations",
            value: stats.trainings.active,
            total: stats.trainings.total,
            icon: BookOpen,
            trend: stats.trainings.trend,
            iconBg: "bg-emerald-500/15",
            iconColor: "text-emerald-600"
        },
        {
            title: "Services",
            value: stats.services.active,
            total: stats.services.total,
            icon: Star,
            trend: stats.services.trend,
            iconBg: "bg-amber-500/15",
            iconColor: "text-amber-600"
        },
        {
            title: "Articles",
            value: stats.posts.published,
            total: stats.posts.total,
            icon: Newspaper,
            trend: stats.posts.trend,
            iconBg: "bg-orange-500/15",
            iconColor: "text-orange-600"
        },
        {
            title: "Utilisateurs",
            value: stats.users.total,
            total: stats.users.total_last_month,
            icon: Users,
            trend: stats.users.trend,
            iconBg: "bg-rose-500/15",
            iconColor: "text-rose-600"
        },
        {
            title: "Revenus",
            value: `${stats.revenue.current} CHF`,
            total: `${stats.revenue.last_month} CHF`,
            icon: DollarSign,
            trend: stats.revenue.trend,
            iconBg: "bg-teal-500/15",
            iconColor: "text-teal-600"
        }
    ];

    return (
        <>
            <Head title='Tableau de bord' />

            <div className="p-4 md:p-6 space-y-8">
                <section className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-slate-950 via-slate-900 to-[#7f1d1d] text-white shadow-xl">
                    <div className="absolute -right-14 -top-14 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
                    <div className="absolute -left-10 bottom-0 h-28 w-28 rounded-full bg-[#DA2E29]/30 blur-xl" />
                    <div className="relative px-6 py-7 md:px-8 md:py-8">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div>
                                <p className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs uppercase tracking-wide text-white/85">
                                    <Activity className="mr-1.5 h-3.5 w-3.5" /> Pilotage en direct
                                </p>
                                <h1 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight">Tableau de bord</h1>
                                <p className="mt-2 text-sm md:text-base text-white/80 max-w-2xl">
                                    Vision claire de votre activite: contenus, performances commerciales et tendances en un seul ecran.
                                </p>
                            </div>

                            <div className="rounded-xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur-sm">
                                <p className="text-[11px] uppercase tracking-wide text-white/75">Derniere mise a jour</p>
                                <p className="text-sm font-semibold">{new Date().toLocaleString('fr-CH')}</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {cards.map((card, index) => (
                        <Card key={index} className={cardClass}>
                            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#DA2E29] via-orange-500 to-amber-400 opacity-80" />
                            <CardHeader className={cardHeaderClass}>
                                <div>
                                    <CardTitle className={cardTitleClass}>
                                        {card.title}
                                    </CardTitle>
                                    <p className={cardSubtitleClass}>
                                        Total: {card.total}
                                    </p>
                                </div>
                                <div className={`rounded-xl p-2.5 ${card.iconBg}`}>
                                    <card.icon className={`h-4 w-4 ${card.iconColor}`} />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{card.value}</div>
                                <div className="mt-3 flex items-center gap-2">
                                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${card.trend >= 0 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300' : 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300'}`}>
                                        {card.trend >= 0 ? <ArrowUpRight className="mr-1 h-3.5 w-3.5" /> : <ArrowDownRight className="mr-1 h-3.5 w-3.5" />}
                                        {formatTrend(card.trend)}
                                    </span>
                                    <span className={cardSubtitleClass}>
                                        evolution mensuelle
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <Card className={`border ${queueStatus.border} {cardClass}`}>

                    <CardHeader className={cardHeaderClass}>
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <CardTitle className={cardTitleClass}>Sante de la queue</CardTitle>
                                <p className={cardSubtitleClass}>Surveillance en temps reel du traitement asynchrone</p>
                            </div>
                            <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${queueStatus.badge}`}>
                                {queueStatus.label}
                            </span>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                            <div className="rounded-xl border border-slate-200/70 bg-slate-50/60 px-3 py-2.5 dark:border-slate-700/60 dark:bg-slate-800/30">
                                <p className={cardSubtitleClass}>Jobs en attente</p>
                                <p className="mt-1 text-xl font-semibold">{queueHealth?.pending_jobs ?? 0}</p>
                            </div>
                            <div className="rounded-xl border border-slate-200/70 bg-slate-50/60 px-3 py-2.5 dark:border-slate-700/60 dark:bg-slate-800/30">
                                <p className={cardSubtitleClass}>Jobs en echec</p>
                                <p className="mt-1 text-xl font-semibold">{queueHealth?.failed_jobs ?? 0}</p>
                            </div>
                            <div className="rounded-xl border border-slate-200/70 bg-slate-50/60 px-3 py-2.5 dark:border-slate-700/60 dark:bg-slate-800/30">
                                <p className={cardSubtitleClass}>Plus ancien (min)</p>
                                <p className="mt-1 text-xl font-semibold">{queueHealth?.oldest_pending_minutes ?? 0}</p>
                            </div>
                        </div>
                        <p className={cardSubtitleClass}>
                            Driver: {queueHealth?.driver ?? 'n/a'} | Seuils: {queueHealth?.thresholds?.max_pending ?? 0} pending, {queueHealth?.thresholds?.max_failed ?? 0} failed, {queueHealth?.thresholds?.max_oldest_minutes ?? 0} min
                        </p>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className={cardClass}>
                        <CardHeader className={cardHeaderClass}>
                            <CardTitle className={cardTitleClass}>Revenus mensuels</CardTitle>
                            <p className={cardSubtitleClass}>Evolution sur 12 mois</p>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={stats.monthly_revenue}>
                                        <CartesianGrid strokeDasharray="3 3" stroke={chartGridStroke} />
                                        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                                        <YAxis tick={{ fontSize: 11 }} />
                                        <Tooltip />
                                        <Line
                                            type="monotone"
                                            dataKey="amount"
                                            stroke="#dc2626"
                                            strokeWidth={2.5}
                                            dot={false}
                                            activeDot={{ r: 5 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className={cardClass}>
                        <CardHeader className={cardHeaderClass}>
                            <CardTitle className={cardTitleClass}>Distribution des revenus</CardTitle>
                            <p className={cardSubtitleClass}>Repartition par source</p>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={stats.revenue_distribution}
                                            dataKey="value"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={100}
                                            innerRadius={55}
                                        >
                                            {stats.revenue_distribution.map((_: any, index: number) => (
                                                <Cell key={`slice-${index}`} fill={pieColors[index % pieColors.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className={cardClass}>
                        <CardHeader className={cardHeaderClass}>
                            <CardTitle className={cardTitleClass}>Activite par type</CardTitle>
                            <p className={cardSubtitleClass}>Volumes actifs</p>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={stats.activity_by_type}>
                                        <CartesianGrid strokeDasharray="3 3" stroke={chartGridStroke} />
                                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                                        <YAxis tick={{ fontSize: 11 }} />
                                        <Tooltip />
                                        <Bar dataKey="value" fill="#dc2626" radius={[8, 8, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className={cardClass}>
                        <CardHeader className={cardHeaderClass}>
                            <CardTitle className={cardTitleClass}>Contenus les plus populaires</CardTitle>
                            <p className={cardSubtitleClass}>Top 5 par vues</p>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {(stats.top_content ?? []).map((item: any, index: number) => (
                                    <div key={index} className="flex items-center rounded-xl border border-slate-200/70 bg-slate-50/60 px-3 py-2.5 dark:border-slate-700/60 dark:bg-slate-800/30">
                                        <div className="w-8 h-8 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center mr-3 text-sm font-semibold">
                                            {index + 1}
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-medium line-clamp-1">{item.title}</div>
                                            <div className="text-xs text-muted-foreground">
                                                {item.type} • {item.views} vues
                                            </div>
                                        </div>
                                        <div className="px-2 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300">
                                            {Number(item.share_percent ?? 0).toFixed(1)}%
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className={cardClass}>
                        <CardHeader className={cardHeaderClass}>
                            <CardTitle className={cardTitleClass}>Visiteurs par pays</CardTitle>
                        </CardHeader>

                        <CardContent>
                            {gaError ? (
                                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                                    <strong>Erreur Google Analytics :</strong> {gaError}
                                </div>
                            ) : visitorsByCountry.length === 0 ? (
                                <EmptyState message="Aucune donnée visiteurs par pays disponible" />
                            ) : (
                                <div className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={visitorsByCountry}>
                                            <CartesianGrid strokeDasharray="3 3" stroke={chartGridStroke} />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip />
                                            <Bar dataKey="value" fill="#dc2626" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                    <Card className={cardClass}>
                        <CardHeader className={cardHeaderClass}>
                            <CardTitle className={cardTitleClass}>Visiteurs par jour</CardTitle>
                            <p className={cardSubtitleClass}>
                                Utilisateurs actifs sur les 30 derniers jours
                            </p>
                        </CardHeader>

                        <CardContent>
                            {visitorsByDay.length === 0 ? (
                                <EmptyState message="Aucune donnée visiteurs par jour disponible" />
                            ) : (
                                <div className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={sortedVisitorsByDay}>
                                            <CartesianGrid
                                                strokeDasharray="3 3"
                                                stroke={chartGridStroke}
                                            />

                                            <XAxis
                                                dataKey="name"
                                                tick={{ fontSize: 11 }}
                                                tickFormatter={(value) => formatGaDate(String(value))}
                                            />

                                            <YAxis tick={{ fontSize: 11 }} />

                                            <Tooltip
                                                labelFormatter={(value) => `Date : ${formatGaDate(String(value))}`}
                                                formatter={(value) => [`${value} visiteurs`, 'Utilisateurs']}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="value"
                                                stroke="#dc2626"
                                                strokeWidth={2.5}
                                                dot={true}
                                                activeDot={{ r: 5 }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                    <Card className={cardClass}>
                        <CardHeader className={cardHeaderClass}>
                            <CardTitle className={cardTitleClass}>Sources de trafic</CardTitle>
                            <p className={cardSubtitleClass}>Repartition par source</p>
                        </CardHeader>

                        <CardContent>
                            {trafficSources.length === 0 ? (
                                <EmptyState message="Aucune donnée sur les sources de trafic" />
                            ) : (
                                <div className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={trafficSources}
                                                dataKey="value"
                                                nameKey="name"
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={100}
                                            >
                                                {trafficSources.map((_: any, i: number) => (
                                                    <Cell key={i} fill={pieColors[i % pieColors.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                    <Card className={cardClass}>
                        <CardHeader className={cardHeaderClass}>
                            <CardTitle className={cardTitleClass}>Top pages</CardTitle>
                        </CardHeader>

                        <CardContent>
                            {topPages.length === 0 ? (
                                <EmptyState message="Aucune donnée sur les pages les plus visitées" />
                            ) : (
                                <div className="space-y-2">
                                    {topPages.map((page: any, index: number) => (
                                        <div key={index} className="flex justify-between text-sm">
                                            <span className="truncate">{page.name}</span>
                                            <span className="font-semibold">{page.value}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className={cardClass}>
                        <CardHeader className={cardHeaderClass}>
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <CardTitle className={cardTitleClass}>
                                        Funnel événements {funnelType === 'current' ? '(en cours)' : '(à venir)'}
                                    </CardTitle>
                                    <p className={cardSubtitleClass}>
                                        Conversion des vues vers les inscriptions et paiements
                                    </p>
                                </div>

                                <div className="flex w-fit rounded-lg border bg-slate-100 p-1 dark:bg-slate-800">
                                    {[
                                        { key: 'current', label: 'En cours' },
                                        { key: 'upcoming', label: 'À venir' },
                                    ].map((item) => (
                                        <button
                                            key={item.key}
                                            type="button"
                                            onClick={() => setFunnelType(item.key as 'current' | 'upcoming')}
                                            className={`rounded-md px-3 py-1 text-xs font-semibold transition ${funnelType === item.key
                                                ? 'bg-white text-red-600 shadow-sm dark:bg-slate-900'
                                                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
                                                }`}
                                        >
                                            {item.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent>
                            {funnelData.length === 0 ? (
                                <EmptyState message="Aucune donnée funnel" />
                            ) : (
                                <div className="space-y-4">
                                    {funnelData.map((step: any, index: number) => {
                                        const firstValue = funnelData[0]?.value || 1;
                                        const percent = Math.round((Number(step.value) / firstValue) * 100);
                                        const safePercent = Math.min(Math.max(percent, 0), 100);

                                        return (
                                            <div key={`${step.name}-${index}`}>
                                                <div className="mb-1 flex justify-between gap-3 text-sm">
                                                    <span className="truncate">{step.name}</span>
                                                    <span className="shrink-0 font-semibold">
                                                        {step.value} ({safePercent}%)
                                                    </span>
                                                </div>

                                                <div className="h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                                                    <div
                                                        className="h-full rounded-full bg-red-600 transition-all duration-500"
                                                        style={{ width: `${safePercent}%` }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className={cardClass}>
                        <CardHeader className={cardHeaderClass}>
                            <CardTitle className={cardTitleClass}>Funnels par événement</CardTitle>
                            <p className={cardSubtitleClass}>
                                Conversion par événement actif ou à venir
                            </p>
                        </CardHeader>

                        <CardContent>
                            {(stats.event_funnels_by_event ?? []).length === 0 ? (
                                <EmptyState message="Aucune donnée funnel par événement" />
                            ) : (
                                <div className="space-y-5">
                                    {(stats.event_funnels_by_event ?? []).map((event: any) => (
                                        <div
                                            key={event.id}
                                            className="rounded-xl border border-slate-200 p-4 dark:border-slate-700"
                                        >
                                            <div className="mb-3 flex items-start justify-between gap-3">
                                                <div>
                                                    <div className="font-semibold line-clamp-1">
                                                        {event.title}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {event.start_date ?? 'Date inconnue'}
                                                    </div>
                                                </div>

                                                <span
                                                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${event.conversion_rate > 30
                                                        ? 'bg-emerald-100 text-emerald-700'
                                                        : event.conversion_rate > 10
                                                            ? 'bg-amber-100 text-amber-700'
                                                            : 'bg-red-100 text-red-700'
                                                        }`}
                                                >
                                                    {event.conversion_rate}% conversion
                                                </span>
                                            </div>

                                            <div className="space-y-3">
                                                {(event.funnel ?? []).map((step: any, index: number) => {
                                                    const firstValue = event.funnel?.[0]?.value || 1;
                                                    const percent = Math.round((Number(step.value) / firstValue) * 100);
                                                    const safePercent = Math.min(Math.max(percent, 0), 100);

                                                    return (
                                                        <div key={`${event.id}-${step.name}-${index}`}>
                                                            <div className="mb-1 flex justify-between gap-3 text-sm">
                                                                <span className="truncate">{step.name}</span>
                                                                <span className="shrink-0 font-semibold">
                                                                    {step.value} ({safePercent}%)
                                                                </span>
                                                            </div>

                                                            <div className="h-2.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                                                                <div
                                                                    className="h-full rounded-full bg-red-600 transition-all duration-500"
                                                                    style={{ width: `${safePercent}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className={cardClass}>
                        <CardHeader className={cardHeaderClass}>
                            <CardTitle className={cardTitleClass}>Heatmap inscriptions</CardTitle>
                            <p className={cardSubtitleClass}>
                                Activité des inscriptions événements sur les 30 derniers jours
                            </p>
                        </CardHeader>

                        <CardContent>
                            {heatmapData.length === 0 ? (
                                <EmptyState message="Aucune donnée sur les inscriptions" />
                            ) : (
                                <div className="grid grid-cols-7 gap-2">
                                    {heatmapData.map((day: any) => (
                                        <div
                                            key={day.date}
                                            title={`${day.date} : ${day.value} inscription(s)`}
                                            className={`flex h-12 items-center justify-center rounded-lg text-xs font-semibold ${getHeatmapIntensity(Number(day.value))}`}
                                        >
                                            {day.value}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className={cardClass}>
                        <CardHeader className={cardHeaderClass}>
                            <CardTitle className={cardTitleClass}>Impact campagnes</CardTitle>
                            <p className={cardSubtitleClass}>
                                Pics de trafic sur 30 jours
                            </p>
                        </CardHeader>

                        <CardContent>
                            {postHeatmapData.length === 0 ? (
                                <EmptyState message="Aucune donnée sur les impact campagnes" />
                            ) : (
                                <div className="space-y-2">
                                    {postHeatmapData
                                        .filter((d: any) => d.value > 0)
                                        .map((day: any) => (
                                            <div
                                                key={day.date}
                                                className="flex items-center justify-between rounded-lg border px-3 py-2"
                                            >
                                                <span className="text-sm">
                                                    {formatDate(day.date)}
                                                </span>

                                                <span className="font-semibold">
                                                    {day.value} vues
                                                    {day.is_spike && ' 🔥'}
                                                </span>
                                            </div>
                                        ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className={cardClass}>
                        <CardHeader className={cardHeaderClass}>
                            <CardTitle className={cardTitleClass}>Insights automatiques</CardTitle>
                            <p className={cardSubtitleClass}>
                                Analyse des performances
                            </p>
                        </CardHeader>

                        <CardContent>
                            {(stats.insights ?? []).length === 0 ? (
                                <EmptyState message="Aucun insight pour le moment" />
                            ) : (
                                <div className="space-y-3">
                                    {(stats.insights ?? []).map((insight: any, index: number) => (
                                        <div
                                            key={index}
                                            className={`rounded-xl border p-3 text-sm ${insight.type === 'positive'
                                                ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                                                : 'border-amber-200 bg-amber-50 text-amber-800'
                                                }`}
                                        >
                                            <div className="font-semibold">{insight.title}</div>
                                            <div>{insight.message}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

export default Dashboard;
