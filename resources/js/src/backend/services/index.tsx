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

const ICONS = {
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
    Disc
};

type IconType = keyof typeof ICONS;

const ServiceCard = ({
    service,
    onEdit,
    onDelete,
    onView,
    onStatusChange
}: {
    service: Service,
    onEdit: (service: Service) => void,
    onDelete: (service: Service) => void,
    onView: (service: Service) => void,
    onStatusChange: (service: Service) => void
}) => {
    const getIconComponent = (iconName: string) => {
        return ICONS[iconName as IconType] || ICONS.Disc;
    };
    const IconComponent = getIconComponent(service.icon);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            whileHover={{ scale: 1.005 }}
            transition={{ duration: 0.2 }}
        >
            <Card className="w-full mb-4 overflow-hidden bg-card hover:shadow-lg transition-shadow">
                <div className="p-4">
                    <div className="flex items-center gap-6">
                        {/* Icon and Basic Info */}
                        <div className="h-16 w-16 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                            <IconComponent className="h-8 w-8 text-primary" />
                        </div>

                        {/* Service Details */}
                        <div className="flex-grow">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-lg font-semibold">{service.name}</h3>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {service.excerpt}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-6 ml-4">
                            {/* Visibility Toggle */}
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">
                                    {service.status ? 'Visible' : 'Masqué'}
                                </span>
                                <Switch
                                    checked={service.status}
                                    onCheckedChange={() => onStatusChange(service)}
                                />
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                    <Link href={route('services.show', service.id)} className="w-full">
                                        <Button variant="ghost" size="sm" className="w-full justify-start">
                                            <Eye className="h-4 w-4 mr-2" />
                                            Voir
                                        </Button>
                                    </Link>
                                    <Link href={route('services.edit', service.id)} className="w-full">
                                        <Button variant="ghost" size="sm" className="w-full justify-start">
                                            <Edit className="h-4 w-4 mr-2" />
                                            Modifier
                                        </Button>
                                    </Link>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="w-full justify-start text-red-600 hover:text-red-600 hover:bg-red-50"
                                        onClick={() => onDelete(service)}
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Supprimer
                                    </Button>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            {/* Dropdown Menu */}

                        </div>
                    </div>
                </div>
            </Card>
        </motion.div>
    );
};
export default function ServicesIndex({ services }: Props) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedService, setSelectedService] = useState<Service | null>(null);

    const filteredServices = services?.data?.filter(service => {
        const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            service.excerpt.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = selectedStatus === 'all' ||
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
            onError: () => {
                toast.error('Erreur lors de la suppression du service');
            }
        });
    };

    const handleEdit = (service: Service) => {
        router.get(route('services.edit', service.id));
    };

    const handleView = (service: Service) => {
        router.get(route('services.show', service.slug));
    };
    const handleStatusChange = (service: Service) => {
        router.put(route('services.update-status', service.id), {
            status: !service.status
        }, {
            onSuccess: () => {
                toast.success('Statut mis à jour avec succès');
            },
            onError: () => {
                toast.error('Erreur lors de la mise à jour du statut');
            }
        });
    };
    return (
        <div className="p-6 space-y-6">
            <div className="rounded-lg border bg-background">
                <div className="p-6 border-b">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Services</h1>
                            <p className="text-muted-foreground">Gérer les services proposés</p>
                        </div>

                        <Link href={route('services.create')}>
                            <Button size="lg" className="h-12 px-6">
                                <Wrench className="mr-2 h-5 w-5" />
                                Créer un service
                            </Button>
                        </Link>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                            <Input
                                placeholder="Rechercher un service..."
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
                                <SelectItem value="active">Actif</SelectItem>
                                <SelectItem value="inactive">Inactif</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="p-6">
                    <AnimatePresence>
                        <motion.div layout className="flex flex-col gap-4">
                            {filteredServices.map(service => (
                                <ServiceCard
                                    key={service.id}
                                    service={service}
                                    onEdit={handleEdit}
                                    onView={handleView}
                                    onDelete={(service) => {
                                        setSelectedService(service);
                                        setIsDeleteOpen(true);
                                    }}
                                    onStatusChange={handleStatusChange}
                                />
                            ))}
                        </motion.div>
                    </AnimatePresence>

                    {filteredServices.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center text-muted-foreground py-12"
                        >
                            Aucun service trouvé.
                        </motion.div>
                    )}
                </div>
            </div>

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
