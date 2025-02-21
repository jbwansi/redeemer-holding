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

const FormationCard: React.FC<{ formation: Formation; onEdit: (formation: Formation) => void; onView: (formation: Formation) => void; onDelete: (formation: Formation) => void }> = ({ formation, onEdit, onDelete, onView }) => {

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
        >
            <Card className="overflow-hidden bg-background hover:shadow-lg transition-shadow">
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

                <div className="p-2 flex flex-col gap-1">
                    <h3 className="text-sm font-semibold line-clamp-1">{formation.title}</h3>

                    <div className="space-y-1 text-xs text-muted-foreground flex-grow">
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

                    <div className="flex items-center justify-between pt-2 border-t mt-2">
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
                    </div>
                </div>
            </Card>
        </motion.div>
    );
};

export default function FormationsIndex({ formations }: Props) {
    console.log("formations", formations);

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

    const handleEdit = (formation: Formation) => {
        router.get(route('formations.edit', formation.id));
    };

    const handleView = (formation: Formation) => {
        router.get(route('formations.show', formation.slug));
    };

    return (
        <div className="p-6 space-y-6">
            <div className="rounded-lg border bg-background">
                {/* Header section with title and create button */}
                <div className="p-6 border-b">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Formations</h1>
                            <p className="text-muted-foreground">Gérer vos formations et votre catalogue</p>
                        </div>

                        <Link href={route('formations.create')}>
                            <Button size="lg" className="h-12 px-6">
                                <GraduationCap className="mr-2 h-5 w-5" />
                                Créer une formation
                            </Button>
                        </Link>
                    </div>

                    {/* Filters section */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                            <Input
                                placeholder="Rechercher une formation..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="pl-10 h-10"
                            />
                        </div>

                        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                            <SelectTrigger className="w-[200px] h-10">
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
                </div>

                {/* Formations grid with animation */}
                <div className="p-6">
                    <AnimatePresence>
                        <motion.div
                            layout
                            className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3"
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
                                />
                            ))}
                        </motion.div>
                    </AnimatePresence>

                    {filteredFormations.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center text-muted-foreground"
                        >
                            Aucune formation trouvée.
                        </motion.div>
                    )}
                </div>
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