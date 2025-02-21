import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Users, Calendar, BookOpen, Newspaper,
    BarChart2, TrendingUp, DollarSign, Star
} from 'lucide-react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie
} from 'recharts';

function Dashboard({ stats }: any) {
    const cards = [
        {
            title: "Événements actifs",
            value: stats.events.active,
            total: stats.events.total,
            icon: Calendar,
            trend: stats.events.trend,
            color: "text-blue-600"
        },
        {
            title: "Formations",
            value: stats.trainings.active,
            total: stats.trainings.total,
            icon: BookOpen,
            trend: stats.trainings.trend,
            color: "text-green-600"
        },
        {
            title: "Services",
            value: stats.services.active,
            total: stats.services.total,
            icon: Star,
            trend: stats.services.trend,
            color: "text-purple-600"
        },
        {
            title: "Articles",
            value: stats.posts.published,
            total: stats.posts.total,
            icon: Newspaper,
            trend: stats.posts.trend,
            color: "text-orange-600"
        },
        {
            title: "Utilisateurs",
            value: stats.users.total,
            total: stats.users.total_last_month,
            icon: Users,
            trend: stats.users.trend,
            color: "text-red-600"
        },
        {
            title: "Revenus",
            value: `${stats.revenue.current} CHF`,
            total: `${stats.revenue.last_month} CHF`,
            icon: DollarSign,
            trend: stats.revenue.trend,
            color: "text-emerald-600"
        }
    ];

    return (
        <>
            <Head title='Tableau de bord' />

            <div className="p-6 space-y-8">
                {/* En-tête */}
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold">Tableau de bord</h1>
                    <div className="text-sm text-muted-foreground">
                        Dernière mise à jour : {new Date().toLocaleString('fr-CH')}
                    </div>
                </div>

                {/* Cartes de statistiques */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {cards.map((card, index) => (
                        <Card key={index}>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {card.title}
                                </CardTitle>
                                <card.icon className={`h-4 w-4 ${card.color}`} />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{card.value}</div>
                                <div className="flex items-center pt-1">
                                    <TrendingUp
                                        className={`h-4 w-4 mr-1 ${
                                            card.trend >= 0 ? 'text-green-500' : 'text-red-500'
                                        }`}
                                    />
                                    <span className={`text-sm ${
                                        card.trend >= 0 ? 'text-green-500' : 'text-red-500'
                                    }`}>
                                        {card.trend}%
                                    </span>
                                    <span className="text-sm text-muted-foreground ml-2">
                                        vs mois dernier
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Graphiques */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Revenus mensuels */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Revenus mensuels</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={stats.monthly_revenue}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="month" />
                                        <YAxis />
                                        <Tooltip />
                                        <Line
                                            type="monotone"
                                            dataKey="amount"
                                            stroke="#dc2626"
                                            strokeWidth={2}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Distribution des revenus */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Distribution des revenus</CardTitle>
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
                                            fill="#dc2626"
                                        />
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Activité par type */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Activité par type</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={stats.activity_by_type}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Bar dataKey="value" fill="#dc2626" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Top contenus */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Contenus les plus populaires</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {stats.top_content.map((item, index) => (
                                    <div key={index} className="flex items-center">
                                        <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mr-3">
                                            {index + 1}
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-medium">{item.title}</div>
                                            <div className="text-sm text-muted-foreground">
                                                {item.type} • {item.views} vues
                                            </div>
                                        </div>
                                        <div className={`px-2 py-1 rounded text-sm ${
                                            item.trend >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                        }`}>
                                            {item.trend}%
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
