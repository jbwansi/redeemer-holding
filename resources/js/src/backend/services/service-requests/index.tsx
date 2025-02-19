import { Head, Link, router } from '@inertiajs/react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { toast } from 'sonner';
import {
    Search,
    MoreVertical,
    Pencil,
    Trash2,
    ArrowUpDown,
    ChevronLeft,
    ChevronRight,
    Eye,
    Download,
    ArrowDown,
    ArrowUp,
    X,
    Mail,
    Phone,
    Clock,
} from 'lucide-react';
import debounce from 'lodash/debounce';
import { useState, useCallback } from 'react';
import {
    Card,
    CardContent,
} from "@/components/ui/card";

interface Service {
    id: number;
    name: string;
}

interface ServiceRequest {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    message: string;
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    service: Service;
    created_at: string;
    code: string;
    date: string;
}

interface Props {
    requests: {
        data: ServiceRequest[];
        meta: {
            current_page: number;
            from: number;
            last_page: number;
            links: Array<{
                url: string | null;
                label: string;
                active: boolean;
            }>;
            to: number;
            total: number;
            per_page: number;
        };
    };
    filters: {
        search?: string;
        status?: string;
        date?: string;
    };
}

const statusOptions = [
    { id: 'all', name: 'Tous les statuts', value: 'all' },
    { id: 'pending', name: 'En attente', value: 'pending' },
    { id: 'in_progress', name: 'En cours', value: 'in_progress' },
    { id: 'completed', name: 'Terminé', value: 'completed' },
    { id: 'cancelled', name: 'Annulé', value: 'cancelled' },
];

const dateOptions = [
    { id: 'all', name: 'Toutes les dates', value: 'all' },
    { id: 'today', name: "Aujourd'hui", value: 'today' },
    { id: 'week', name: 'Cette semaine', value: 'week' },
    { id: 'month', name: 'Ce mois', value: 'month' },
];

export default function Index({ requests, filters }: Props) {
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || 'all');
    const [selectedDate, setSelectedDate] = useState(filters.date || 'all');
    const [sortField, setSortField] = useState('created_at');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

    const debouncedSearch = useCallback(
        debounce((value: string) => {
            updateFilters({ search: value });
        }, 300),
        []
    );
    type FilterOptions = {
        search?: string;
        status?: string;
        date?: string;
        sort?: string;
        direction?: string;
    }

    const updateFilters = (newFilters: Partial<FilterOptions>) => {
        router.get(
            route('service-requests.index'),
            { ...filters, ...newFilters },
            {
                preserveState: true,
                preserveScroll: true,
                only: ['requests']
            }
        );
    };

    const handleSort = (field: string) => {
        const newDirection = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
        setSortField(field);
        setSortDirection(newDirection);
        updateFilters({ sort: field, direction: newDirection });
    };

    const handleDelete = (request: ServiceRequest) => {
        const message = `Êtes-vous sûr de vouloir supprimer cette demande de ${request.first_name} ${request.last_name} ?`;

        toast.warning(message, {
            action: {
                label: 'Supprimer',
                onClick: () => {
                    router.delete(route('service-requests.destroy', request.id), {
                        onSuccess: () => toast.success('Demande supprimée avec succès'),
                        onError: () => toast.error('Une erreur est survenue')
                    });
                }
            },
            cancel: {
                label: 'Annuler',
                onClick: () => { }
            }
        });
    };

    const getStatusBadge = (status: ServiceRequest['status']) => {
        const styles = {
            pending: 'bg-yellow-100 text-yellow-800',
            in_progress: 'bg-blue-100 text-blue-800',
            completed: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800',
        };

        const labels = {
            pending: 'En attente',
            in_progress: 'En cours',
            completed: 'Terminé',
            cancelled: 'Annulé',
        };

        return (
            <Badge className={styles[status]}>
                {labels[status]}
            </Badge>
        );
    };

    return (
        <>
            <Head title="Demandes de service" />

            <div className="flex flex-col min-h-screen bg-background">
                {/* Header */}
                <div className="border-b">
                    <div className="flex h-16 items-center mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-1 items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-semibold">Demandes de service</h1>
                                <p className="text-sm text-muted-foreground">
                                    {requests.meta.total} demandes au total
                                </p>
                            </div>

                            <Button variant="outline" size="icon" className="h-12 w-12 p-3">
                                <Download className="h-6 w-6" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 py-6">
                    <div className="mx-auto px-4 sm:px-6 lg:px-8">
                        <Card>
                            {/* Filtres */}
                            <CardContent className="p-6">
                                <div className="flex flex-col gap-4 md:flex-row md:items-center">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Rechercher une demande..."
                                            value={searchQuery}
                                            onChange={(e) => {
                                                setSearchQuery(e.target.value);
                                                debouncedSearch(e.target.value);
                                            }}
                                            className="pl-9"
                                        />
                                    </div>

                                    <div className="flex flex-col gap-4 md:flex-row">
                                        <Select
                                            value={selectedStatus}
                                            onValueChange={(value) => {
                                                setSelectedStatus(value);
                                                updateFilters({ status: value });
                                            }}
                                        >
                                            <SelectTrigger className="w-full md:w-[180px]">
                                                <SelectValue placeholder="Statut" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {statusOptions.map((option) => (
                                                    <SelectItem
                                                        key={option.id}
                                                        value={option.value}
                                                    >
                                                        {option.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>

                                        <Select
                                            value={selectedDate}
                                            onValueChange={(value) => {
                                                setSelectedDate(value);
                                                updateFilters({ date: value });
                                            }}
                                        >
                                            <SelectTrigger className="w-full md:w-[180px]">
                                                <SelectValue placeholder="Date" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {dateOptions.map((option) => (
                                                    <SelectItem
                                                        key={option.id}
                                                        value={option.value}
                                                    >
                                                        {option.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* Filtres actifs */}
                                {(searchQuery || selectedStatus !== 'all' || selectedDate !== 'all') && (
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {/* ... Badges des filtres actifs ... */}
                                    </div>
                                )}
                            </CardContent>

                            {/* Table */}
                            <div className="relative overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>
                                                <button
                                                    onClick={() => handleSort('created_at')}
                                                    className="inline-flex items-center gap-1 hover:text-primary"
                                                >
                                                    Date
                                                    {sortField === 'created_at' ? (
                                                        sortDirection === 'asc' ? (
                                                            <ArrowUp className="h-4 w-4" />
                                                        ) : (
                                                            <ArrowDown className="h-4 w-4" />
                                                        )
                                                    ) : (
                                                        <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                                                    )}
                                                </button>
                                            </TableHead>
                                            <TableHead>Client</TableHead>
                                            <TableHead>Code</TableHead>
                                            <TableHead>Service</TableHead>
                                            <TableHead>Contact</TableHead>
                                            <TableHead>Statut</TableHead>
                                            <TableHead className="w-[70px]" />
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {requests.data.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={6} className="h-24 text-center">
                                                    Aucune demande trouvée
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            requests.data.map((request) => (
                                                <TableRow key={request.id}>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <Clock className="h-4 w-4 text-muted-foreground" />
                                                            <span>
                                                                {request.created_at}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="font-medium">
                                                            {request.first_name} {request.last_name}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                            <Link href={route('service-requests.show', request.id)} className='hover:text-primary'>
                                                                #{request.code}
                                                            </Link>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline">
                                                            {request.service.name}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-2 text-sm">
                                                                <Mail className="h-4 w-4" />
                                                                {request.email}
                                                            </div>
                                                            <div className="flex items-center gap-2 text-sm">
                                                                <Phone className="h-4 w-4" />
                                                                {request.phone}
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        {getStatusBadge(request.status)}
                                                    </TableCell>
                                                    <TableCell>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="hover:bg-muted"
                                                                >
                                                                    <MoreVertical className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="w-[160px]">
                                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                                <DropdownMenuItem asChild>
                                                                    <Link href={route('service-requests.show', request.id)} className="cursor-pointer">
                                                                        <Eye className="h-4 w-4 mr-2" />
                                                                        Voir
                                                                    </Link>
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem
                                                                    onClick={() => handleDelete(request)}
                                                                    className="text-destructive focus:text-destructive"
                                                                >
                                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                                    Supprimer
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Pagination */}
                            {requests.meta.last_page > 1 && (
                                <div className="flex items-center justify-between px-6 py-4 border-t">
                                    <div className="text-sm text-muted-foreground">
                                        Affichage de {requests.meta.from} à {requests.meta.to} sur {requests.meta.total} demandes
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={!requests.meta.links[0].url}
                                            onClick={() => router.get(requests.meta.links[0].url || '')}
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                        </Button>
                                        {requests.meta.links.slice(1, -1).map((link, i) => (
                                            <Button
                                                key={i}
                                                variant={link.active ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => router.get(link.url || '')}
                                            >
                                                {link.label}
                                            </Button>
                                        ))}
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={!requests.meta.links[requests.meta.links.length - 1].url}
                                            onClick={() => router.get(requests.meta.links[requests.meta.links.length - 1].url || '')}
                                        >
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
}
