import React from 'react';
import { Link, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    ChevronLeft,
    Eye,
    Calendar,
    Clock,
    MoreHorizontal,
    Trash2,
    Mail,
    Phone,
    User,
    MessageSquare,
    Loader2,
    Building
} from 'lucide-react';
import { toast } from 'sonner';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
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
}

interface ServiceRequest {
    id: number;
    service: Service;
    first_name: string;
    last_name: string;
    email: string;
    phone: string | null;
    message: string | null;
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    views: number;
    created_at: string;
    code: string;
    updated_at: string;
}

interface Props {
    serviceRequest: ServiceRequest;
}

const STATUS_BADGES = {
    pending: { label: 'En attente', className: 'bg-yellow-50 text-yellow-700 border-yellow-300' },
    in_progress: { label: 'En cours', className: 'bg-blue-50 text-blue-700 border-blue-300' },
    completed: { label: 'Terminé', className: 'bg-green-50 text-green-700 border-green-300' },
    cancelled: { label: 'Annulé', className: 'bg-red-50 text-red-700 border-red-300' },
};

export default function Show({ serviceRequest }: Props) {
    const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
    const [isDeleting, setIsDeleting] = React.useState(false);
    const [status, setStatus] = React.useState(serviceRequest.status);
    const [isUpdatingStatus, setIsUpdatingStatus] = React.useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        router.delete(route('service-requests.destroy', serviceRequest.id), {
            onSuccess: () => {
                toast.success('Demande supprimée avec succès');
                router.visit(route('service-requests.index'));
            },
            onError: () => {
                toast.error('Erreur lors de la suppression de la demande');
                setIsDeleting(false);
            }
        });
    };

    const handleStatusChange = (newStatus: string) => {
        setIsUpdatingStatus(true);
        router.put(route('service-requests.update-status', serviceRequest.id), {
            status: newStatus
        }, {
            onSuccess: () => {
                setStatus(newStatus as ServiceRequest['status']);
                toast.success('Statut mis à jour avec succès');
            },
            onError: () => {
                toast.error('Erreur lors de la mise à jour du statut');
            },
            onFinish: () => setIsUpdatingStatus(false)
        });
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className=" mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <Link
                        href={route('service-requests.index')}
                        className="inline-flex items-center text-sm text-muted-foreground hover:text-primary"
                    >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Retour aux demandes
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Demande de {serviceRequest.service.name} (#{serviceRequest.code})
                    </h1>
                </div>

                <div className="flex items-center gap-4">
                    <div className={`px-3 py-1 rounded-full border ${STATUS_BADGES[status].className}`}>
                        {STATUS_BADGES[status].label}
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
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


                {/* Main Content Area */}
                <div className="col-span-3 space-y-6">
                    {/* Status Management Card */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle>Statut de la demande</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-4">
                                <Select
                                    value={status}
                                    onValueChange={handleStatusChange}
                                    disabled={isUpdatingStatus}
                                >
                                    <SelectTrigger className="w-[200px]">
                                        <SelectValue placeholder="Changer le statut" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pending">En attente</SelectItem>
                                        <SelectItem value="in_progress">En cours</SelectItem>
                                        <SelectItem value="completed">Terminé</SelectItem>
                                        <SelectItem value="cancelled">Annulé</SelectItem>
                                    </SelectContent>
                                </Select>
                                {isUpdatingStatus && (
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Mise à jour...
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Message Card */}
                    {serviceRequest.message && (
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle>Message</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="prose prose-sm max-w-none">
                                    <div className="text-muted-foreground whitespace-pre-wrap">
                                        {serviceRequest.message}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
                {/* Sidebar - Contact Information */}
                <div className="space-y-6">
                    {/* Contact Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Contact</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    <span>
                                        {serviceRequest.first_name} {serviceRequest.last_name}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    <a href={`mailto:${serviceRequest.email}`} className="text-primary hover:underline">
                                        {serviceRequest.email}
                                    </a>
                                </div>
                                {serviceRequest.phone && (
                                    <div className="flex items-center gap-2">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                        <a href={`tel:${serviceRequest.phone}`} className="text-primary hover:underline">
                                            {serviceRequest.phone}
                                        </a>
                                    </div>
                                )}
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
                                <Building className="h-4 w-4 text-muted-foreground" />
                                <Link
                                    href={route('services.show', serviceRequest.service.slug)}
                                    className="text-primary hover:underline"
                                >
                                    {serviceRequest.service.name}
                                </Link>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <Eye className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">
                                    {serviceRequest.views} vues
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">
                                    Reçue le {formatDate(serviceRequest.created_at)}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">
                                    Mise à jour le {formatDate(serviceRequest.updated_at)}
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
                            Cette action est irréversible. La demande de
                            <span className="font-semibold"> {serviceRequest.first_name} {serviceRequest.last_name}</span> sera supprimée définitivement.
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
