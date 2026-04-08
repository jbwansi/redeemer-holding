import React from 'react';
import DOMPurify from 'dompurify';
import { Link, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    ChevronLeft, Eye, Calendar, Clock, Edit, Trash2, Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import IconComponent from '@/components/ui/icon';
import { normalizeServiceIconName } from '@/lib/service-icon';
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

export default function Show({ service }: Props) {
    const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
    const [isDeleting, setIsDeleting] = React.useState(false);
    const safeExcerpt = React.useMemo(() => DOMPurify.sanitize(service.excerpt || ''), [service.excerpt]);
    const safeContent = React.useMemo(() => DOMPurify.sanitize(service.content || ''), [service.content]);

    const iconName = normalizeServiceIconName(service.icon);

    const handleDelete = () => {
        setIsDeleting(true);
        router.delete(route('services.destroy', service.id), {
            onSuccess: () => {
                toast.success('Service supprim� avec succ�s');
                router.visit(route('services.index'));
            },
            onError: () => {
                toast.error('Erreur lors de la suppression du service');
                setIsDeleting(false);
            },
        });
    };

    const formatDate = (date: string) =>
        new Date(date).toLocaleDateString('fr-FR', {
            year: 'numeric', month: 'long', day: 'numeric',
        });

    return (
        <div className="p-6 space-y-6">
            <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/10 p-6"
            >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-2xl bg-primary/15 ring-2 ring-primary/20 flex items-center justify-center flex-shrink-0">
                            <IconComponent name={iconName || 'package'} className="h-8 w-8 text-primary" />
                        </div>
                        <div>
                            <Link href={route('services.index')} className="inline-flex items-center text-xs text-muted-foreground hover:text-primary mb-1">
                                <ChevronLeft className="h-3.5 w-3.5 mr-0.5" /> Services
                            </Link>
                            <h1 className="text-2xl font-bold tracking-tight">{service.name}</h1>
                            <Badge variant={service.status ? 'default' : 'secondary'} className={service.status ? 'mt-1 bg-emerald-100 text-emerald-700 border-emerald-200' : 'mt-1'}>
                                {service.status ? 'Visible' : 'Masqu�'}
                            </Badge>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link href={route('services.edit', service.id)}>
                            <Button variant="outline" size="sm" className="gap-2"><Edit className="h-4 w-4" /> Modifier</Button>
                        </Link>
                        <Button variant="destructive" size="sm" className="gap-2" onClick={() => setShowDeleteDialog(true)}>
                            <Trash2 className="h-4 w-4" /> Supprimer
                        </Button>
                    </div>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3 space-y-4">
                    <Card>
                        <CardHeader className="pb-3"><CardTitle className="text-base">R�sum�</CardTitle></CardHeader>
                        <CardContent>
                            <div className="prose prose-sm max-w-none">
                                <div className="text-muted-foreground" dangerouslySetInnerHTML={{ __html: safeExcerpt }} />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-3"><CardTitle className="text-base">Description d�taill�e</CardTitle></CardHeader>
                        <CardContent>
                            <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: safeContent }} />
                        </CardContent>
                    </Card>
                </div>
                <div className="space-y-4">
                    <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground font-medium">Statistiques</CardTitle></CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2 text-muted-foreground"><Eye className="h-4 w-4" /> Vues</div>
                                <span className="font-semibold">{service.views}</span>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground font-medium">Informations</CardTitle></CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <div className="flex items-start gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                <div><p className="text-muted-foreground text-xs">Cr�� le</p><p>{formatDate(service.created_at)}</p></div>
                            </div>
                            <div className="flex items-start gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                <div><p className="text-muted-foreground text-xs">Modifi� le</p><p>{formatDate(service.updated_at)}</p></div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>�tes-vous s�r ?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Cette action est irr�versible. Le service <span className="font-semibold"> {service.name}</span> sera supprim� d�finitivement.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Annuler</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700" disabled={isDeleting}>
                            {isDeleting ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Suppression...</>) : (<><Trash2 className="mr-2 h-4 w-4" /> Supprimer</>)}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
