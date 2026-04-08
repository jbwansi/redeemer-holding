import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Wrench, Search, Eye, Edit, Trash2, Plus,
    CheckCircle2, XCircle, MoreHorizontal,
} from 'lucide-react';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import IconComponent from '@/components/ui/icon';
import { normalizeServiceIconName } from '@/lib/service-icon';

interface Service {
    id: number;
    name: string;
    slug: string;
    excerpt: string;
    content: string;
    icon: string;
    views: number;
    status: boolean;
    date: string;
}

interface Stats {
    total: number;
    active: number;
    inactive: number;
}

interface Props {
    services: {
        data: Service[];
        meta: {
            current_page: number;
            from: number;
            last_page: number;
            links: any[];
            path: string;
            per_page: number;
            to: number;
            total: number;
        };
    };
    stats: Stats;
}

const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    visible: (i: number) => ({
        opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.3 },
    }),
};

const ServiceCard = ({
    service,
    onDelete,
    onStatusChange,
}: {
    service: Service;
    onDelete: (s: Service) => void;
    onStatusChange: (s: Service) => void;
}) => {
    const iconName = normalizeServiceIconName(service.icon);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
        >
            <Card className="overflow-hidden border-slate-200/80 bg-white shadow-sm hover:shadow-md transition-all dark:border-slate-700/60 dark:bg-slate-900/70">
                <div className="p-5">
                    <div className="flex items-start gap-4">
                        {/* Icon */}
                        <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 ring-1 ring-primary/10">
                            <IconComponent name={iconName || 'package'} className="h-7 w-7 text-primary" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                    <h3 className="font-semibold text-base leading-tight truncate">{service.name}</h3>
                                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{service.excerpt}</p>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 flex-shrink-0">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-44">
                                        <DropdownMenuItem asChild>
                                            <Link href={route('services.show', service.id)} className="cursor-pointer">
                                                <Eye className="h-4 w-4 mr-2" /> Voir
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href={route('services.edit', service.id)} className="cursor-pointer">
                                                <Edit className="h-4 w-4 mr-2" /> Modifier
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                            onClick={() => onDelete(service)}
                                        >
                                            <Trash2 className="h-4 w-4 mr-2" /> Supprimer
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <Eye className="h-3.5 w-3.5" />
                                    {service.views} vues
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`text-xs font-medium ${service.status ? 'text-emerald-600' : 'text-slate-400'}`}>
                                        {service.status ? 'Visible' : 'Masqué'}
                                    </span>
                                    <Switch
                                        checked={service.status}
                                        onCheckedChange={() => onStatusChange(service)}
                                        className="data-[state=checked]:bg-emerald-500"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>
        </motion.div>
    );
};

export default function ServicesIndex({ services, stats }: Props) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedService, setSelectedService] = useState<Service | null>(null);

    const filteredServices = services?.data?.filter(service => {
        const matchesSearch =
            service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            service.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus =
            selectedStatus === 'all' ||
            (selectedStatus === 'active' && service.status) ||
            (selectedStatus === 'inactive' && !service.status);
        return matchesSearch && matchesStatus;
    });

    const handleDelete = () => {
        if (!selectedService) return;
        router.delete(route('services.destroy', selectedService.id), {
            onSuccess: () => {
                setIsDeleteOpen(false);
                setSelectedService(null);
                toast.success('Service supprimé avec succès');
            },
            onError: () => toast.error('Erreur lors de la suppression du service'),
        });
    };

    const handleStatusChange = (service: Service) => {
        router.put(route('services.update-status', service.id), { status: !service.status }, {
            onSuccess: () => toast.success('Statut mis à jour avec succès'),
            onError: () => toast.error('Erreur lors de la mise à jour du statut'),
        });
    };

    const kpis = [
        {
            label: 'Total services',
            value: stats?.total ?? services.meta.total,
            icon: Wrench,
            color: 'text-primary',
            bg: 'bg-primary/10',
        },
        {
            label: 'Actifs',
            value: stats?.active ?? 0,
            icon: CheckCircle2,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50 dark:bg-emerald-950/30',
        },
        {
            label: 'Masqués',
            value: stats?.inactive ?? 0,
            icon: XCircle,
            color: 'text-slate-400',
            bg: 'bg-slate-100 dark:bg-slate-800/40',
        },
    ];

    return (
        <div className="p-6 space-y-6">
            {/* Hero */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/10 p-6">
                <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="h-8 w-8 rounded-lg bg-primary/15 flex items-center justify-center">
                                <Wrench className="h-4 w-4 text-primary" />
                            </div>
                            <span className="text-xs font-semibold text-primary uppercase tracking-wider">Gestion</span>
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight">Services</h1>
                        <p className="text-muted-foreground text-sm mt-1">
                            Gérez les services proposés sur votre site
                        </p>
                    </div>
                    <Link href={route('services.create')}>
                        <Button size="default" className="gap-2 shadow-sm">
                            <Plus className="h-4 w-4" />
                            Nouveau service
                        </Button>
                    </Link>
                </div>

                {/* KPIs */}
                <div className="relative mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {kpis.map((kpi, i) => (
                        <motion.div key={kpi.label} custom={i} initial="hidden" animate="visible" variants={fadeUp}>
                            <div className="rounded-xl bg-white/80 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-700/50 p-4 flex items-center gap-3">
                                <div className={`${kpi.bg} h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0`}>
                                    <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold leading-none">{kpi.value}</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">{kpi.label}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                        placeholder="Rechercher un service..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="w-full sm:w-[200px]">
                        <SelectValue placeholder="Filtrer par statut" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tous les statuts</SelectItem>
                        <SelectItem value="active">Actifs</SelectItem>
                        <SelectItem value="inactive">Masqués</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Cards */}
            <AnimatePresence>
                {filteredServices.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {filteredServices.map(service => (
                            <ServiceCard
                                key={service.id}
                                service={service}
                                onDelete={s => { setSelectedService(s); setIsDeleteOpen(true); }}
                                onStatusChange={handleStatusChange}
                            />
                        ))}
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center justify-center py-24 text-center"
                    >
                        <div className="h-16 w-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                            <Wrench className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <p className="font-medium text-muted-foreground">
                            {searchTerm || selectedStatus !== 'all'
                                ? 'Aucun résultat pour ces filtres'
                                : 'Aucun service créé'}
                        </p>
                        {!searchTerm && selectedStatus === 'all' && (
                            <Link href={route('services.create')} className="mt-4">
                                <Button variant="outline" size="sm" className="gap-2">
                                    <Plus className="h-4 w-4" /> Créer le premier service
                                </Button>
                            </Link>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Delete Dialog */}
            <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Cette action est irréversible. Le service
                            <span className="font-semibold"> {selectedService?.name}</span> sera supprimé définitivement.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                            Supprimer
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
    Wrench,
    Search,
    Eye,
    Edit,
    Trash2,
    Music2,
    Radio,
    Mic2,
    Podcast,
    Video,
    Headphones,
    Music4,
    AudioLines,
    RadioTower,
    Speaker,
    MonitorPlay,
    Volume2,
    Disc,
    MoreVertical,
    MoreHorizontal
} from 'lucide-react';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface Service {
    id: number;
    name: string;
    slug: string;
    excerpt: string;
    content: string;
    icon: string;
    views: number;
    status: boolean;
    date: string
}

interface Props {
    services: {
        data: Service[];
        meta: {
            current_page: number;
            from: number;
            last_page: number;
            links: any[];
            path: string;
            per_page: number;
            to: number;
            total: number;
        };
    };
}
