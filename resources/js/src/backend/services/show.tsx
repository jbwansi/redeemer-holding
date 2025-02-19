import React from 'react';
import { Link, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    ChevronLeft,
    Eye,
    Calendar,
    Clock,
    Edit,
    MoreHorizontal,
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
    MonitorPlay,
    Speaker,
    Volume2,
    Disc,
    Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
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

interface Service {
    id: number;
    name: string;
    slug: string;
    excerpt: string;
    content: string;
    icon: string;
    views: number;
    status: boolean;
    created_at: string;
    updated_at: string;
}

interface Props {
    service: Service;
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

export default function Show({ service }: Props) {
    const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
    const [isDeleting, setIsDeleting] = React.useState(false);

    const getIconComponent = (iconName: string) => {
        return ICONS[iconName as IconType] || ICONS.Disc;
    };
    const IconComponent = getIconComponent(service.icon);

    const handleDelete = async () => {
        setIsDeleting(true);
        router.delete(route('services.destroy', service.id), {
            onSuccess: () => {
                toast.success('Service supprimé avec succès');
                router.visit(route('services.index'));
            },
            onError: () => {
                toast.error('Erreur lors de la suppression du service');
                setIsDeleting(false);
            }
        });
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <Link
                        href={route('services.index')}
                        className="inline-flex items-center text-sm text-muted-foreground hover:text-primary"
                    >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Retour aux services
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight">{service.name}</h1>
                </div>

                <div className="flex items-center gap-4">
                    <Badge variant={service.status ? 'default' : 'secondary'}>
                        {service.status ? 'Visible' : 'Masqué'}
                    </Badge>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
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
                                onClick={() => setShowDeleteDialog(true)}
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Supprimer
                            </Button>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>


            <div className="grid grid-cols-4 gap-6">
                {/* Sidebar - Déplacé à gauche */}


                {/* Main Content Area */}
                <div className="col-span-3 space-y-6">
                    {/* Excerpt Card */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle>Résumé</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="prose prose-sm max-w-none">
                                <div className="text-muted-foreground" dangerouslySetInnerHTML={{ __html: service.excerpt }} />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Description Card */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle>Description détaillée</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="prose prose-sm max-w-none">
                                <div dangerouslySetInnerHTML={{ __html: service.content }} />
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <div className="space-y-6">
                    {/* Icon Card */}
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-center">
                                <div className="h-24 w-24 bg-primary/10 rounded-xl flex items-center justify-center">
                                    <IconComponent className="h-12 w-12 text-primary" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Metadata Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Informations</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-2 text-sm">
                                <Eye className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">
                                    {service.views} vues
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">
                                    Créé le {formatDate(service.created_at)}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">
                                    Dernière modification le {formatDate(service.updated_at)}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Delete Dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Cette action est irréversible. Le service
                            <span className="font-semibold"> {service.name}</span> sera supprimé définitivement.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Annuler</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                            disabled={isDeleting}
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Suppression...
                                </>
                            ) : (
                                <>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Supprimer
                                </>
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
