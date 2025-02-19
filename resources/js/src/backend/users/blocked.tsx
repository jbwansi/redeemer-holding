import { Head, useForm } from '@inertiajs/react';
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Ban, CheckCircle2, Loader2, UserX } from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface User {
    id: number;
    name: string;
    email: string;
    status: string;
    user_type: string;
    created_at: string;
}

interface Props {
    blockedUsers: {
        data: User[];
        total: number;
    }
}

export default function BlockedUsers({ blockedUsers }: Props) {
    const getStatusColor = (status: string) => {
        return status === 'banned' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800';
    };

    const getStatusIcon = (status: string) => {
        return status === 'banned' ? <Ban className="w-4 h-4" /> : <UserX className="w-4 h-4" />;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    };
    const [userToReactivate, setUserToReactivate] = useState<User | null>(null);
    const { toast } = useToast();
    const { patch, processing } = useForm();

    const handleReactivation = () => {
        patch(route('users.reactivate', userToReactivate?.id), {
            data: { status: 'active' },
            onSuccess: () => {
                toast({
                    title: "Utilisateur réactivé",
                    description: `${userToReactivate?.name} a été réactivé avec succès.`,
                    duration: 5000,
                    children: (
                        <div className="flex items-center">
                            <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                            <span>La réactivation a été effectuée avec succès</span>
                        </div>
                    ),
                });
                setUserToReactivate(null);
            },
        });
    };

    return (
        <>
            <Head title="Utilisateurs bloqués" />

            <div className="flex flex-col min-h-screen bg-background">
                {/* Header */}
                <div className="border-b">
                    <div className="flex h-16 items-center mx-auto px-4 sm:px-6 lg:px-8">
                        <div>
                            <h1 className="text-2xl font-semibold">Utilisateurs bloqués</h1>
                            <p className="text-sm text-muted-foreground">
                                Liste des utilisateurs bannis ou inactifs
                            </p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 py-6">
                    <div className="mx-auto px-4 sm:px-6 lg:px-8">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>
                                        <div className="flex items-center space-x-2">
                                            <span>Utilisateurs bloqués</span>
                                            <Badge variant="secondary">
                                                {blockedUsers.total}
                                            </Badge>
                                        </div>
                                    </CardTitle>
                                    <Select defaultValue="all">
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder="Filtrer par statut" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Tous les statuts</SelectItem>
                                            <SelectItem value="banned">Bannis</SelectItem>
                                            <SelectItem value="inactive">Inactifs</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Utilisateur</TableHead>
                                                <TableHead>Rôle</TableHead>
                                                <TableHead>Statut</TableHead>
                                                <TableHead>Date de blocage</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {blockedUsers.data.map((user) => (
                                                <TableRow key={user.id}>
                                                    <TableCell>
                                                        <div>
                                                            <div className="font-medium">{user.name}</div>
                                                            <div className="text-sm text-muted-foreground">
                                                                {user.email}
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline">
                                                            {user.user_type}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center space-x-1">
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                                                                {getStatusIcon(user.status)}
                                                                <span className="ml-1">
                                                                    {user.status === 'banned' ? 'Banni' : 'Inactif'}
                                                                </span>
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        {formatDate(user.created_at)}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="inline-flex items-center text-green-600 hover:text-green-700 hover:bg-green-50"
                                                            onClick={() => setUserToReactivate(user)}
                                                        >
                                                            <CheckCircle2 className="mr-2 h-4 w-4" />
                                                            Réactiver
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            <AlertDialog
                open={!!userToReactivate}
                onOpenChange={() => setUserToReactivate(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Confirmation de réactivation
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Êtes-vous sûr de vouloir réactiver le compte de{' '}
                            <span className="font-medium text-foreground">
                                {userToReactivate?.name}
                            </span>
                            ? Cette action permettra à l'utilisateur de se reconnecter à son compte.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleReactivation}
                            disabled={processing}
                            className="bg-green-600 hover:bg-green-700 text-white"
                        >
                            {processing ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Réactivation...
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                    Confirmer la réactivation
                                </>
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
