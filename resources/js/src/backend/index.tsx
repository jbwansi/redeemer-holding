import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Users, Calendar, BookOpen, Newspaper,
    TrendingUp, DollarSign, Star, ArrowUpRight, ArrowDownRight, Activity
} from 'lucide-react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';

function Dashboard({ stats }: any) {
    const pieColors = ['#DA2E29', '#F97316', '#2563EB', '#10B981', '#7C3AED'];
    const queueHealth = stats.queue_health;

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

    const queueStatus = queueStatusConfig[queueHealth?.status] ?? queueStatusConfig.unavailable;

    const formatTrend = (value: number) => {
        if (!Number.isFinite(value)) return '+0%';
        return `${value > 0 ? '+' : ''}${value}%`;
    };

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

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {cards.map((card, index) => (
                        <Card key={index} className="group relative overflow-hidden border-slate-200/70 bg-white/95 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-700/70 dark:bg-slate-900/70">
                            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#DA2E29] via-orange-500 to-amber-400 opacity-80" />
                            <CardHeader className="flex flex-row items-start justify-between pb-2">
                                <div>
                                    <CardTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                        {card.title}
                                    </CardTitle>
                                    <p className="text-[11px] text-muted-foreground mt-1">Total: {card.total}</p>
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
                                    <span className="text-xs text-muted-foreground">
                                        evolution mensuelle
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <Card className={`border ${queueStatus.border} bg-white/95 shadow-sm dark:bg-slate-900/70`}>
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <CardTitle className="text-base">Sante de la queue</CardTitle>
                                <p className="text-xs text-muted-foreground">Surveillance en temps reel du traitement asynchrone</p>
                            </div>
                            <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${queueStatus.badge}`}>
                                {queueStatus.label}
                            </span>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                            <div className="rounded-xl border border-slate-200/70 bg-slate-50/60 px-3 py-2.5 dark:border-slate-700/60 dark:bg-slate-800/30">
                                <p className="text-xs text-muted-foreground">Jobs en attente</p>
                                <p className="mt-1 text-xl font-semibold">{queueHealth?.pending_jobs ?? 0}</p>
                            </div>
                            <div className="rounded-xl border border-slate-200/70 bg-slate-50/60 px-3 py-2.5 dark:border-slate-700/60 dark:bg-slate-800/30">
                                <p className="text-xs text-muted-foreground">Jobs en echec</p>
                                <p className="mt-1 text-xl font-semibold">{queueHealth?.failed_jobs ?? 0}</p>
                            </div>
                            <div className="rounded-xl border border-slate-200/70 bg-slate-50/60 px-3 py-2.5 dark:border-slate-700/60 dark:bg-slate-800/30">
                                <p className="text-xs text-muted-foreground">Plus ancien (min)</p>
                                <p className="mt-1 text-xl font-semibold">{queueHealth?.oldest_pending_minutes ?? 0}</p>
                            </div>
                        </div>
                        <p className="mt-3 text-xs text-muted-foreground">
                            Driver: {queueHealth?.driver ?? 'n/a'} | Seuils: {queueHealth?.thresholds?.max_pending ?? 0} pending, {queueHealth?.thresholds?.max_failed ?? 0} failed, {queueHealth?.thresholds?.max_oldest_minutes ?? 0} min
                        </p>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="border-slate-200/70 dark:border-slate-700/70">
                        <CardHeader className="pb-1">
                            <CardTitle className="text-base">Revenus mensuels</CardTitle>
                            <p className="text-xs text-muted-foreground">Evolution sur 12 mois</p>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={stats.monthly_revenue}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.25)" />
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

                    <Card className="border-slate-200/70 dark:border-slate-700/70">
                        <CardHeader className="pb-1">
                            <CardTitle className="text-base">Distribution des revenus</CardTitle>
                            <p className="text-xs text-muted-foreground">Repartition par source</p>
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

                    <Card className="border-slate-200/70 dark:border-slate-700/70">
                        <CardHeader className="pb-1">
                            <CardTitle className="text-base">Activite par type</CardTitle>
                            <p className="text-xs text-muted-foreground">Volumes actifs</p>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={stats.activity_by_type}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.25)" />
                                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                                        <YAxis tick={{ fontSize: 11 }} />
                                        <Tooltip />
                                        <Bar dataKey="value" fill="#dc2626" radius={[8, 8, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200/70 dark:border-slate-700/70">
                        <CardHeader className="pb-1">
                            <CardTitle className="text-base">Contenus les plus populaires</CardTitle>
                            <p className="text-xs text-muted-foreground">Top 5 par vues</p>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {stats.top_content.map((item, index) => (
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
                </div>
            </div>
        </>
    );
}

export default Dashboard;
