import React, { useEffect, useState } from 'react';
import { Link, router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
    Wrench,
    Search,
    Eye,
    Edit,
    Trash2,
    Plus,
    CheckCircle2,
    XCircle,
    MousePointerClick,
    Home,
} from 'lucide-react';

import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';

import {
    arrayMove,
    SortableContext,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';

import { CSS } from '@dnd-kit/utilities';

import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';

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

    tagline?: string | null;
    featured_note?: string | null;

    cta_primary_label?: string | null;
    cta_primary_url?: string | null;
    cta_secondary_label?: string | null;
    cta_secondary_url?: string | null;

    position?: number | null;
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
        opacity: 1,
        y: 0,
        transition: {
            delay: i * 0.06,
            duration: 0.3,
        },
    }),
};

const SortableItem = ({
    service,
    onDelete,
    onStatusChange,
    onHomeToggle,
}: {
    service: Service;
    onDelete: (s: Service) => void;
    onStatusChange: (s: Service) => void;
    onHomeToggle: (s: Service) => void;
}) => {
    const { attributes, listeners, setNodeRef, transform, transition } =
        useSortable({ id: service.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style}>
            <div {...attributes} {...listeners} className="mb-2 cursor-grab text-xs text-muted-foreground">
                Glisser pour réordonner
            </div>

            <ServiceCard
                service={service}
                onDelete={onDelete}
                onStatusChange={onStatusChange}
                onHomeToggle={onHomeToggle}
            />
        </div>
    );
};



const ServiceCard = ({
    service,
    onDelete,
    onStatusChange,
    onHomeToggle,
}: {
    service: Service;
    onDelete: (s: Service) => void;
    onStatusChange: (s: Service) => void;
    onHomeToggle: (s: Service) => void;
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
            <Card
                className={`relative overflow-hidden border-slate-200/80 bg-white shadow-sm transition-all hover:shadow-md dark:border-slate-700/60 dark:bg-slate-900/70 ${service.position ? 'ring-2 ring-[#da2e29]/40' : ''
                    }`}
            >
                {service.position && (
                    <div className="absolute right-3 top-3 z-10 rounded-full bg-[#da2e29] px-3 py-1 text-xs font-bold text-white shadow">
                        Accueil #{service.position}
                    </div>
                )}
                <div className="p-5">
                    <div className="flex items-start gap-4">
                        <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 ring-1 ring-primary/10">
                            <IconComponent
                                name={iconName || 'package'}
                                className="h-7 w-7 text-primary"
                            />
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-semibold text-base leading-tight truncate">
                                            {service.name}
                                        </h3>
                                    </div>

                                    <div className="mt-1 flex flex-wrap items-center gap-2">
                                        <Badge variant="secondary" className="text-[10px]">
                                            /{service.slug}
                                        </Badge>

                                        {service.status ? (
                                            <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300">
                                                Visible
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-slate-500">
                                                Masqué
                                            </Badge>
                                        )}
                                    </div>

                                    {service.tagline && (
                                        <p className="text-xs font-medium text-primary mt-2 line-clamp-1">
                                            {service.tagline}
                                        </p>
                                    )}

                                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                                        {service.excerpt || 'Aucune description courte.'}
                                    </p>

                                    <ul className="space-y-2 text-sm leading-6 text-slate-300">
                                        {(
                                            Array.isArray(service.ideal_for) && service.ideal_for.length > 0
                                                ? service.ideal_for
                                                : [
                                                    'Un accompagnement sur mesure',
                                                    'Des résultats concrets et durables',
                                                    'Avancer plus vite et plus sereinement',
                                                ]
                                        ).map((item: string, index: number) => (
                                            <li key={index} className="flex gap-2">
                                                <span className="text-[#ef2d2d]">✓</span>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>

                                    {service.featured_note && (
                                        <div className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">
                                            {service.featured_note}
                                        </div>
                                    )}
                                </div>


                            </div>

                            <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-800/40">
                                <div className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                                    <MousePointerClick className="h-3.5 w-3.5 text-primary" />
                                    CTA principal
                                </div>

                                <div className="mt-2 flex flex-wrap gap-2">
                                    <Badge variant="outline">
                                        {service.cta_primary_label || 'Réserver'}
                                    </Badge>

                                    {service.cta_secondary_label && (
                                        <Badge variant="outline">
                                            {service.cta_secondary_label}
                                        </Badge>
                                    )}
                                </div>

                                {(service.cta_primary_url || service.cta_secondary_url) && (
                                    <div className="mt-2 space-y-1 text-[11px] text-muted-foreground">
                                        {service.cta_primary_url && (
                                            <p className="truncate">
                                                Principal : {service.cta_primary_url}
                                            </p>
                                        )}

                                        {service.cta_secondary_url && (
                                            <p className="truncate">
                                                Secondaire : {service.cta_secondary_url}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">

                                <div className="flex items-center gap-1">

                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0 text-blue-700"
                                        asChild
                                    >
                                        <Link href={route('services.show', service.id)}>
                                            <Eye className="h-4 w-4" />
                                        </Link>
                                    </Button>

                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0"
                                        asChild
                                    >
                                        <Link href={route('services.edit', service.id)}>
                                            <Edit className="h-4 w-4" />
                                        </Link>
                                    </Button>

                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0 text-red-600"
                                        onClick={() => onDelete(service)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>

                                <Button
                                    variant={service.position ? "default" : "outline"}
                                    size="sm"
                                    className={`ml-2 gap-1 ${service.position
                                        ? "bg-[#da2e29] text-white hover:bg-[#c62823]"
                                        : ""
                                        }`}
                                    onClick={() => onHomeToggle(service)}
                                >
                                    <Home className="h-3.5 w-3.5" />
                                    {service.position ? `Accueil #${service.position}` : "Accueil"}
                                </Button>

                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <Eye className="h-3.5 w-3.5" />
                                    {service.views ?? 0} vues
                                </div>

                                <Switch
                                    checked={service.status}
                                    onCheckedChange={() => onStatusChange(service)}
                                    className="data-[state=checked]:bg-emerald-500"
                                />
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

    const filteredServices = services?.data?.filter((service) => {
        // ❌ on enlève les services déjà sur l’accueil
        if (service.position !== null) return false;

        const search = searchTerm.toLowerCase();

        const matchesSearch =
            service.name?.toLowerCase().includes(search) ||
            service.excerpt?.toLowerCase().includes(search) ||
            service.slug?.toLowerCase().includes(search) ||
            service.tagline?.toLowerCase().includes(search) ||
            service.featured_note?.toLowerCase().includes(search);

        const matchesStatus =
            selectedStatus === 'all' ||
            (selectedStatus === 'active' && service.status) ||
            (selectedStatus === 'inactive' && !service.status);

        return matchesSearch && matchesStatus;
    }) || [];

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
        router.put(
            route('services.update-status', service.id),
            { status: !service.status },
            {
                onSuccess: () => toast.success('Statut mis à jour avec succès'),
                onError: () => toast.error('Erreur lors de la mise à jour du statut'),
            }
        );
    };

    const homeServices = services.data
        .filter(s => s.position !== null)
        .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));

    const [items, setItems] = useState(homeServices);

    useEffect(() => {
        setItems(homeServices);
    }, [services.data]);

    const handleHomeToggle = (service: Service) => {
        router.patch(route('services.toggleHome', service.id), {}, {
            preserveScroll: true,
            onSuccess: () => {
                router.reload({ only: ['services'] }) // 🔥 LA CLÉ

                toast.success(
                    service.position
                        ? 'Retiré de la page d’accueil'
                        : 'Ajouté à la page d’accueil'
                )
            },
            onError: () => toast.error('Maximum 3 services sur la page d’accueil'),
        })
    }

    const sensors = useSensors(useSensor(PointerSensor));



    const handleDragEnd = (event: any) => {
        const { active, over } = event;

        if (!over || active.id === over.id) return;

        const oldIndex = items.findIndex(i => i.id === active.id);
        const newIndex = items.findIndex(i => i.id === over.id);

        const newItems = arrayMove(items, oldIndex, newIndex);

        setItems(newItems);

        router.post(route('services.reorderHome'), {
            services: newItems.map((item, index) => ({
                id: item.id,
                position: index + 1,
            })),
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
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/10 p-6">
                <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="h-8 w-8 rounded-lg bg-primary/15 flex items-center justify-center">
                                <Wrench className="h-4 w-4 text-primary" />
                            </div>

                            <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                                Gestion
                            </span>
                        </div>

                        <h1 className="text-2xl font-bold tracking-tight">
                            Services
                        </h1>

                        <p className="text-muted-foreground text-sm mt-1">
                            Gérez vos services, vos CTA et votre positionnement marketing.
                        </p>
                    </div>

                    <Link href={route('services.create')}>
                        <Button size="default" className="gap-2 shadow-sm">
                            <Plus className="h-4 w-4" />
                            Nouveau service
                        </Button>
                    </Link>
                </div>

                <div className="relative mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {kpis.map((kpi, i) => (
                        <motion.div
                            key={kpi.label}
                            custom={i}
                            initial="hidden"
                            animate="visible"
                            variants={fadeUp}
                        >
                            <div className="rounded-xl bg-white/80 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-700/50 p-4 flex items-center gap-3">
                                <div
                                    className={`${kpi.bg} h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0`}
                                >
                                    <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
                                </div>

                                <div>
                                    <p className="text-2xl font-bold leading-none">
                                        {kpi.value}
                                    </p>

                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        {kpi.label}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />

                    <Input
                        placeholder="Rechercher par nom, slug, accroche, note..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
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

            {items.length > 0 && (
                <div className="space-y-3 rounded-2xl border border-[#da2e29]/20 bg-[#da2e29]/5 p-4">
                    <div>
                        <h2 className="font-bold">Ordre des services sur l’accueil</h2>
                        <p className="text-sm text-muted-foreground">
                            Glissez les services pour modifier leur ordre.
                        </p>
                    </div>

                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext
                            items={items.map(i => i.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {items.map(service => (
                                    <SortableItem
                                        key={service.id}
                                        service={service}
                                        onDelete={(s) => {
                                            setSelectedService(s);
                                            setIsDeleteOpen(true);
                                        }}
                                        onStatusChange={handleStatusChange}
                                        onHomeToggle={handleHomeToggle}
                                    />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                </div>
            )}

            <AnimatePresence>
                {filteredServices.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {filteredServices.map((service) => (
                            <ServiceCard
                                key={service.id}
                                service={service}
                                onDelete={(s) => {
                                    setSelectedService(s);
                                    setIsDeleteOpen(true);
                                }}
                                onStatusChange={handleStatusChange}
                                onHomeToggle={handleHomeToggle}
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
                                    <Plus className="h-4 w-4" />
                                    Créer le premier service
                                </Button>
                            </Link>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

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
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            Supprimer
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}