import { Head, Link } from '@inertiajs/react';
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    ChevronLeft,
    User,
    Mail,
    Shield,
    Calendar,
    Clock,
    Edit,
    CheckCircle2,
    XCircle,
} from 'lucide-react';

interface Props {
    user: {
        id: number;
        name: string;
        email: string;
        user_type: 'admin' | 'editor' | 'user';
        status: 'active' | 'inactive' | 'banned';
        email_verified_at: string | null;
        created_at: string;
        updated_at: string;
    };
}

export default function Show({ user }: Props) {
    const getRoleBadge = (user_type: Props['user']['user_type']) => {
        const styles = {
            admin: 'bg-primary/10 text-primary hover:bg-primary/20',
            editor: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
            user: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
        };

        const labels = {
            admin: 'Administrateur',
            editor: 'Éditeur',
            user: 'Utilisateur',
        };

        return <Badge className={styles[user_type]}>{labels[user_type]}</Badge>;
    };

    const getStatusBadge = (status: Props['user']['status']) => {
        const styles = {
            active: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200',
            inactive: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200',
            banned: 'bg-red-100 text-red-700 hover:bg-red-200',
        };

        const labels = {
            active: 'Actif',
            inactive: 'Inactif',
            banned: 'Banni',
        };

        return <Badge className={styles[status]}>{labels[status]}</Badge>;
    };

    return (
        <>
            <Head title={`Utilisateur - ${user.name}`} />

            <div className="flex flex-col min-h-screen bg-background">
                <div className="border-b bg-gradient-to-r from-slate-50 to-white">
                    <div className="mx-auto px-4 py-8 sm:px-6 lg:px-8">
                        <div className="flex flex-1 items-center justify-between">
                            <div className="flex items-center">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="mr-4"
                                    asChild
                                >
                                    <Link href={route('users.index')}>
                                        <ChevronLeft className="h-6 w-6" />
                                    </Link>
                                </Button>
                                <div>
                                    <h1 className="text-2xl font-semibold flex items-center gap-3">
                                        {user.name}
                                        {getRoleBadge(user.user_type)}
                                    </h1>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Membre depuis le {new Date(user.created_at).toLocaleDateString('fr-FR', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                {getStatusBadge(user.status)}
                                <Button asChild className="h-11">
                                    <Link href={route('users.edit', user.id)}>
                                        <Edit className="h-4 w-4 mr-2" />
                                        Modifier
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 py-8">
                    <div className="mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 max-w-6xl mx-auto">
                            {/* Informations générales */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Informations personnelles</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-4">
                                        <div className="border-b pb-4">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="text-sm font-medium text-muted-foreground">Nom complet</p>
                                                    <p className="mt-1 flex items-center gap-2">
                                                        <User className="h-4 w-4 text-muted-foreground" />
                                                        {user.name}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="border-b pb-4">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="text-sm font-medium text-muted-foreground">Adresse email</p>
                                                    <p className="mt-1 flex items-center gap-2">
                                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                                        {user.email}
                                                    </p>
                                                </div>
                                                <div>
                                                    {user.email_verified_at ? (
                                                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                                                            <CheckCircle2 className="h-3 w-3 mr-1" />
                                                            Vérifié
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                                            <XCircle className="h-3 w-3 mr-1" />
                                                            Non vérifié
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="border-b pb-4">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="text-sm font-medium text-muted-foreground">Type de compte</p>
                                                    <p className="mt-1 flex items-center gap-2">
                                                        <Shield className="h-4 w-4 text-muted-foreground" />
                                                        {user.user_type === 'admin' ? 'Administrateur' :
                                                         user.user_type === 'editor' ? 'Éditeur' : 'Utilisateur'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Dates et historique */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Historique du compte</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-4">
                                        <div className="border-b pb-4">
                                            <p className="text-sm font-medium text-muted-foreground">Création du compte</p>
                                            <p className="mt-1 flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                                {new Date(user.created_at).toLocaleDateString('fr-FR', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        </div>

                                        {user.email_verified_at && (
                                            <div className="border-b pb-4">
                                                <p className="text-sm font-medium text-muted-foreground">Vérification de l'email</p>
                                                <p className="mt-1 flex items-center gap-2">
                                                    <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                                                    {new Date(user.email_verified_at).toLocaleDateString('fr-FR', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </p>
                                            </div>
                                        )}

                                        <div className="border-b pb-4">
                                            <p className="text-sm font-medium text-muted-foreground">Dernière modification</p>
                                            <p className="mt-1 flex items-center gap-2">
                                                <Clock className="h-4 w-4 text-muted-foreground" />
                                                {new Date(user.updated_at).toLocaleDateString('fr-FR', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
