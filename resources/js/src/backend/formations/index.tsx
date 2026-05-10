import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
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
    GraduationCap,
    Search,
    MapPin,
    Users,
    Eye,
    Edit,
    Trash2,
} from 'lucide-react';
import { format } from 'date-fns';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';
import { route } from 'ziggy-js';

interface Formation {
    id: number;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    location: string;
    start_date: string;
    end_date: string;
    max_participants: number;
    price: number;
    featured_image: {
        banner: string;
        original: string;
        thumbnail: string;
        medium: string;
        large: string;
    };
    is_published: boolean;
    is_featured: boolean;
    views: number;
}

interface Props {
    formations: {
        data: Formation[];
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

const FormationCard: React.FC<{
    formation: Formation;
    onEdit: (formation: Formation) => void;
    onView: (formation: Formation) => void;
    onDelete: (formation: Formation) => void;
    onTogglePublish: (formation: Formation) => void;
}> = ({ formation, onEdit, onDelete, onView, onTogglePublish }) => {

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
        >
            <Card className="overflow-hidden border-slate-200/80 bg-white/95 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-700/60 dark:bg-slate-900/70">
                <div className="relative">
                    <img
                        src={formation.featured_image?.medium || '/placeholder.jpg'}
                        alt={formation.title}
                        className="h-36 w-full object-cover"
                    />
                    <div className="absolute top-2 right-2 flex gap-1">
                        <Badge
                            variant={formation.is_published ? 'default' : 'secondary'}
                            className="text-xs"
                        >
                            {formation.is_published ? 'Publié' : 'Brouillon'}
                        </Badge>
                        {new Date(formation.end_date) < new Date() && (
                            <Badge variant="destructive" className="text-xs">Terminé</Badge>
                        )}
                    </div>
                    {formation.is_featured && (
                        <div className="absolute top-2 left-2">
                            <Badge variant="default" className="text-xs text-red-500 bg-white">
                                Vedette
                            </Badge>
                        </div>
                    )}
                </div>

                <div className="p-3 flex flex-col gap-1.5">
                    <h3 className="text-sm font-semibold line-clamp-1 text-slate-900 dark:text-slate-100">{formation.title}</h3>

                    <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400 flex-grow">
                        <div className="flex items-center gap-1.5">
                            <GraduationCap className="h-3 w-3" />
                            <span>{format(new Date(formation.start_date), 'PPP')}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <MapPin className="h-3 w-3" />
                            <span className="line-clamp-1">{formation.location}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Users className="h-3 w-3" />
                            <span>{formation.max_participants} participants</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Eye className="h-3 w-3" />
                            <span>{formation.views} Vues</span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/80 mt-2 dark:border-slate-700/60">
                        <div className="flex items-center gap-1">
                            <motion.div whileHover={{ scale: 1.1 }}>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-blue-700"
                                    onClick={() => onView(formation)}
                                >
                                    <Eye className="h-3 w-3" />
                                </Button>
                            </motion.div>
                            <motion.div whileHover={{ scale: 1.1 }}>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    onClick={() => onEdit(formation)}
                                >
                                    <Edit className="h-3 w-3" />
                                </Button>
                            </motion.div>
                            <motion.div whileHover={{ scale: 1.1 }}>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-destructive"
                                    onClick={() => onDelete(formation)}
                                >
                                    <Trash2 className="h-3 w-3" />
                                </Button>
                            </motion.div>
                        </div>
                        <button
                            type="button"
                            onClick={() => onTogglePublish(formation)}
                            className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${formation.is_published ? 'bg-green-600' : 'bg-slate-300'
                                }`}
                            title={formation.is_published ? 'Dépublier' : 'Publier'}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formation.is_published ? 'translate-x-5' : 'translate-x-1'
                                    }`}
                            />
                        </button>
                    </div>
                </div>
            </Card>
        </motion.div>
    );
};

export default function FormationsIndex({ formations }: Props) {

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedFormation, setSelectedFormation] = useState<Formation | null>(null);

    const filteredFormations = formations.data.filter(formation => {
        const matchesSearch = formation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            formation.excerpt.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = selectedStatus === 'all' ||
            (selectedStatus === 'published' && formation.is_published) ||
            (selectedStatus === 'draft' && !formation.is_published) ||
            (selectedStatus === 'past' && new Date(formation.end_date) < new Date()) ||
            (selectedStatus === 'upcoming' && new Date(formation.end_date) >= new Date());

        return matchesSearch && matchesStatus;
    });

    const handleDelete = () => {
        if (!selectedFormation) return;

        router.delete(route('formations.destroy', selectedFormation.id), {
            onSuccess: () => {
                setIsDeleteOpen(false);
                setSelectedFormation(null);
                toast.success('Formation supprimée avec succès');
            },
            onError: () => {
                toast.error('Erreur lors de la suppression de la formation');
            }
        });
    };

    const handleTogglePublish = (formation: Formation) => {
        router.patch(
            route('formations.toggle-publish', formation.id),
            {
                is_published: !formation.is_published,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(
                        !formation.is_published
                            ? 'Formation publiée avec succès'
                            : 'Formation dépubliée avec succès'
                    );
                },
                onError: () => {
                    toast.error('Erreur lors du changement de statut');
                },
            }
        );
    };

    const handleEdit = (formation: Formation) => {
        router.get(route('formations.edit', formation.id));
    };

    const handleView = (formation: Formation) => {
        router.get(route('formations.show', formation.slug));
    };

    return (
        <div className="p-6 space-y-6">
            <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-slate-950 via-slate-900 to-[#7f1d1d] px-6 py-7 text-white shadow-xl">
                <div className="absolute -top-10 -right-10 h-36 w-36 rounded-full bg-white/10 blur-2xl" />
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Formations</h1>
                        <p className="mt-2 text-white/80">Gérer vos formations et votre catalogue</p>
                    </div>
                    <Link href={route('formations.create')}>
                        <Button size="lg" className="h-11 px-5 rounded-xl bg-white text-slate-900 hover:bg-slate-100">
                            <GraduationCap className="mr-2 h-5 w-5" />
                            Créer une formation
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white/95 p-4 shadow-sm dark:border-slate-700/60 dark:bg-slate-900/70">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                            placeholder="Rechercher une formation..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="pl-10 h-10 rounded-xl"
                        />
                    </div>

                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                        <SelectTrigger className="w-[220px] h-10 rounded-xl">
                            <SelectValue placeholder="Filtrer par statut" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tous les statuts</SelectItem>
                            <SelectItem value="published">Publié</SelectItem>
                            <SelectItem value="draft">Brouillon</SelectItem>
                            <SelectItem value="past">Formations terminées</SelectItem>
                            <SelectItem value="upcoming">Formations à venir</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="mt-3 text-sm text-slate-600 dark:text-slate-400">
                    {filteredFormations.length} résultat{filteredFormations.length > 1 ? 's' : ''}
                </div>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white/95 p-6 shadow-sm dark:border-slate-700/60 dark:bg-slate-900/70">
                <AnimatePresence>
                    <motion.div
                        layout
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                    >
                        {filteredFormations.map(formation => (
                            <FormationCard
                                key={formation.id}
                                formation={formation}
                                onEdit={handleEdit}
                                onView={handleView}
                                onDelete={(formation) => {
                                    setSelectedFormation(formation);
                                    setIsDeleteOpen(true);
                                }}
                                onTogglePublish={handleTogglePublish}
                            />
                        ))}
                    </motion.div>
                </AnimatePresence>

                {filteredFormations.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="rounded-xl border border-dashed border-slate-300/80 bg-slate-50/70 py-12 text-center text-slate-600 dark:border-slate-700 dark:bg-slate-900/30 dark:text-slate-400"
                    >
                        Aucune formation trouvée.
                    </motion.div>
                )}
            </div>

            {/* Delete confirmation dialog */}
            <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Cette action est irréversible. Cela supprimera définitivement la formation
                            <span className="font-semibold"> {selectedFormation?.title}</span>.
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
