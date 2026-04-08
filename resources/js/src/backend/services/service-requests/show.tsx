import React from 'react';
import { Link, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    ChevronLeft, Eye, Calendar, Clock, Trash2, Mail, Phone,
    User, Loader2, Building, AlertCircle, Loader, CheckCircle2, XCircle, MessageSquare,
} from 'lucide-react';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
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

const STATUS_CONFIG = {
    pending:     { label: 'En attente', cls: 'bg-amber-50 text-amber-700 border-amber-200',    icon: AlertCircle },
    in_progress: { label: 'En cours',   cls: 'bg-blue-50 text-blue-700 border-blue-200',       icon: Loader },
    completed:   { label: 'Terminé',    cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
    cancelled:   { label: 'Annulé',     cls: 'bg-red-50 text-red-700 border-red-200',          icon: XCircle },
};

export default function Show({ serviceRequest }: Props) {
    const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
    const [isDeleting, setIsDeleting] = React.useState(false);
    const [status, setStatus] = React.useState(serviceRequest.status);
    const [isUpdatingStatus, setIsUpdatingStatus] = React.useState(false);

    const handleDelete = () => {
        setIsDeleting(true);
        router.delete(route('service-requests.destroy', serviceRequest.id), {
            onSuccess: () => {
                toast.success('Demande supprimée avec succès');
                router.visit(route('service-requests.index'));
            },
            onError: () => {
                toast.error('Erreur lors de la suppression');
                setIsDeleting(false);
            },
        });
    };

    const handleStatusChange = (newStatus: string) => {
        setIsUpdatingStatus(true);
        router.put(route('service-requests.update-status', serviceRequest.id), { status: newStatus }, {
            onSuccess: () => {
                setStatus(newStatus as ServiceRequest['status']);
                toast.success('Statut mis à jour avec succès');
            },
            onError: () => toast.error('Erreur lors de la mise à jour du statut'),
            onFinish: () => setIsUpdatingStatus(false),
        });
    };

    const formatDate = (date: string) =>
        new Date(date).toLocaleDateString('fr-FR', {
            year: 'numeric', month: 'long', day: 'numeric',
            hour: '2-digit', minute: '2-digit',
        });

    const st = STATUS_CONFIG[status];
    const StatusIcon = st.icon;

    return (
        <div className="p-6 space-y-6">
            {/* Hero header */}
            <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/10 p-6"
            >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <Link
                            href={route('service-requests.index')}
                            className="inline-flex items-center text-xs text-muted-foreground hover:text-primary mb-2"
                        >
                            <ChevronLeft className="h-3.5 w-3.5 mr-0.5" />
                            Demandes de service
                        </Link>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Demande #{serviceRequest.code}
                        </h1>
                        <p className="text-muted-foreground text-sm mt-0.5">
                            {serviceRequest.service.name} · {serviceRequest.first_name} {serviceRequest.last_name}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className={`inline-flex items-center gap-1.5 text-sm px-3 py-1 rounded-full border font-medium ${st.cls}`}>
                            <StatusIcon className="h-3.5 w-3.5" />
                            {st.label}
                        </span>
                        <Button
                            variant="destructive"
                            size="sm"
                            className="gap-2"
                            onClick={() => setShowDeleteDialog(true)}
                        >
                            <Trash2 className="h-4 w-4" /> Supprimer
                        </Button>
                    </div>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Main content */}
                <div className="lg:col-span-3 space-y-4">
                    {/* Status change */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">Changer le statut</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-3">
                                <Select value={status} onValueChange={handleStatusChange} disabled={isUpdatingStatus}>
                                    <SelectTrigger className="w-[220px]">
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
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Loader2 className="h-4 w-4 animate-spin" /> Mise à jour…
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Message */}
                    {serviceRequest.message && (
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <MessageSquare className="h-4 w-4 text-primary" />
                                    Message du client
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="rounded-xl bg-slate-50 dark:bg-slate-800/40 p-4 text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                                    {serviceRequest.message}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-4">
                    {/* Contact */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm text-muted-foreground font-medium">Contact</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                <span className="font-medium">
                                    {serviceRequest.first_name} {serviceRequest.last_name}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                <a href={`mailto:${serviceRequest.email}`} className="text-primary hover:underline truncate">
                                    {serviceRequest.email}
                                </a>
                            </div>
                            {serviceRequest.phone && (
                                <div className="flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                    <a href={`tel:${serviceRequest.phone}`} className="text-primary hover:underline">
                                        {serviceRequest.phone}
                                    </a>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Meta */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm text-muted-foreground font-medium">Informations</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <div className="flex items-start gap-2">
                                <Building className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-muted-foreground text-xs">Service concerné</p>
                                    <Link
                                        href={route('services.show', serviceRequest.service.id)}
                                        className="text-primary hover:underline font-medium"
                                    >
                                        {serviceRequest.service.name}
                                    </Link>
                                </div>
                            </div>
                            <div className="flex items-start gap-2">
                                <Eye className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-muted-foreground text-xs">Vues</p>
                                    <p>{serviceRequest.views}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-muted-foreground text-xs">Reçue le</p>
                                    <p>{formatDate(serviceRequest.created_at)}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-muted-foreground text-xs">Mise à jour le</p>
                                    <p>{formatDate(serviceRequest.updated_at)}</p>
                                </div>
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
                            className="bg-red-600 hover:bg-red-700"
                            disabled={isDeleting}
                        >
                            {isDeleting ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Suppression...</>
                            ) : (
                                <><Trash2 className="mr-2 h-4 w-4" /> Supprimer</>
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
