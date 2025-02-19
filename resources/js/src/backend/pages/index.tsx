
import { Head, router, useForm } from '@inertiajs/react';
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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from 'sonner';
import {
    Search,
    Plus,
    MoreVertical,
    Pencil,
    Trash2,
    Eye,
    X,
    Loader2,
} from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import debounce from 'lodash/debounce';
import { useState, useCallback } from 'react';
import {
    Card,
    CardContent,
} from "@/components/ui/card";

interface Props {
    pages: any;
    pageActives: any;
    businessSettings: any;
    filters: {
        search?: string;
        sort?: string;
        direction?: string;
        status?: string;
    };
}


// ... autres imports restent les mêmes

interface PageOption {
    id: number;
    title: string;
    slug: string;
}
interface BusinessProps {
    id: number;
    type: string;
    value: string;

}
const SettingsContent = ({ pages, businessSettings }: { pages: PageOption[], businessSettings: BusinessProps[] }) => {
    const { data, setData, processing, errors, post } = useForm({

        confidential_page: businessSettings?.find(page => page.type === "confidential_page")?.value ?? '',
        terms_pages: businessSettings?.find(page => page.type === "terms_pages")?.value ?? '',
        memtion_page: businessSettings?.find(page => page.type === "memtion_page")?.value ?? '',

    });


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Prépare les données sous forme de tableau pour le backend
        const payload = Object.entries(data).map(([key, value]) => ({
            type: key,
            value: value,
        }));


        post(route('settings.update'), {
            data: { types: payload },
            preserveScroll: true,
            onSuccess: () => {
                // alert('Configuration mise à jour avec succès.');
            },
            onError: () => {
                toast('Une erreur est survenue lors de la mise à jour.');
            },
        });
    };


    return (
        <CardContent className="p-6 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <h3 className="text-lg font-medium mb-4">Politique de confidentialité</h3>
                    <Select
                        name="confidential_page"
                        value={data.confidential_page}
                        onValueChange={(value) => setData('confidential_page', value)}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Sélectionnez une page..." />
                        </SelectTrigger>
                        <SelectContent>
                            {pages && pages?.map((page) => (
                                <SelectItem key={page.id} value={page.slug}>
                                    {page.title}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div>
                    <h3 className="text-lg font-medium mb-4">Conditions générales</h3>
                    <Select
                        name="terms_pages"
                        value={data.terms_pages}
                        onValueChange={(value) => setData('terms_pages', value)}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Sélectionnez une page..." />
                        </SelectTrigger>
                        <SelectContent>
                            {pages && pages.map((page) => (
                                <SelectItem key={page.id} value={page.slug}>
                                    {page.title}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div>
                    <h3 className="text-lg font-medium mb-4">Mentions légales</h3>
                    <Select

                        name="memtion_page"
                        value={data.memtion_page}
                        onValueChange={(value) => setData('memtion_page', value)}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Sélectionnez une page..." />
                        </SelectTrigger>
                        <SelectContent>
                            {pages && pages.map((page) => (
                                <SelectItem key={page.id} value={page.id.toString()}>
                                    {page.title}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex justify-end">
                    <Button type="submit" disabled={processing} className='text-white'>
                        {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Sauvegarder</Button>
                </div>
            </form>
        </CardContent>
    );
};
export default function Index({ pages, filters, pageActives, businessSettings }: Props) {
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || 'all');
    const [sortDirection, setSortDirection] = useState(filters.direction || 'desc');
    const [activeTab, setActiveTab] = useState("liste");

    console.log(businessSettings);

    const debouncedSearch = useCallback(
        debounce((value: string) => {
            updateFilters({ search: value });
        }, 300),
        []
    );

    const updateFilters = (newFilters: Partial<typeof filters>) => {
        router.get(route('pages.index'), { ...filters, ...newFilters }, {
            preserveState: true,
            preserveScroll: true,
            only: ['pages']
        });
    };

    const handleDelete = (page: any) => {
        const confirmDelete = () => {
            router.delete(route('pages.destroy', page.id), {
                onSuccess: () => {
                    toast.success('Page supprimée avec succès');
                },
                onError: () => {
                    toast.error('Une erreur est survenue lors de la suppression');
                }
            });
        };

        toast.warning(`Supprimer la page "${page.title}" ?`, {
            action: {
                label: 'Supprimer',
                onClick: confirmDelete
            },
            cancel: { label: 'Annuler', onClick: () => { } }
        });
    };

    return (
        <>
            <Head title="Pages" />

            <div className="flex flex-col min-h-screen bg-background">
                <div className="border-b">
                    <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
                        <h1 className="text-2xl font-semibold">Pages statiques</h1>
                        <Button asChild>
                            <a href={route('pages.create')}>
                                <Plus className="w-4 h-4 mr-2" />
                                Ajouter une nouvelle page
                            </a>
                        </Button>
                    </div>
                </div>

                <div className="flex-1 py-6">
                    <div className="mx-auto px-4 sm:px-6 lg:px-8">
                        <Tabs defaultValue="liste" className="w-full" value={activeTab} onValueChange={setActiveTab}>
                            <TabsList className="mb-4">
                                <TabsTrigger value="liste">Liste des pages disponibles</TabsTrigger>
                                <TabsTrigger value="parametres">Paramètres des pages</TabsTrigger>
                            </TabsList>

                            <TabsContent value="liste">
                                <Card>
                                    <CardContent className="p-6">
                                        <div className="flex flex-col md:flex-row md:items-center gap-4">
                                            <div className="relative flex-1">
                                                <Search className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
                                                <Input
                                                    placeholder="Rechercher..."
                                                    value={searchQuery}
                                                    onChange={e => {
                                                        setSearchQuery(e.target.value);
                                                        debouncedSearch(e.target.value);
                                                    }}
                                                    className="pl-10"
                                                />
                                            </div>

                                            <Button
                                                variant={selectedStatus === 'active' ? 'default' : 'ghost'}
                                                onClick={() => {
                                                    setSelectedStatus(selectedStatus === 'active' ? 'all' : 'active');
                                                    updateFilters({ status: selectedStatus === 'active' ? 'all' : 'active' });
                                                }}
                                            >
                                                {selectedStatus === 'active' ? 'Toutes' : 'Actives'}
                                            </Button>
                                        </div>

                                        {(searchQuery || selectedStatus !== 'all') && (
                                            <div className="flex flex-wrap gap-2 mt-4">
                                                {searchQuery && (
                                                    <Badge variant="outline" className="gap-1">
                                                        <span>Recherche : {searchQuery}</span>
                                                        <X className="w-3 h-3 cursor-pointer" onClick={() => {
                                                            setSearchQuery('');
                                                            updateFilters({ search: '' });
                                                        }} />
                                                    </Badge>
                                                )}
                                                {selectedStatus !== 'all' && (
                                                    <Badge variant="outline" className="gap-1">
                                                        <span>Statut : {selectedStatus === 'active' ? 'Actives' : 'Inactives'}</span>
                                                        <X className="w-3 h-3 cursor-pointer" onClick={() => {
                                                            setSelectedStatus('all');
                                                            updateFilters({ status: 'all' });
                                                        }} />
                                                    </Badge>
                                                )}
                                            </div>
                                        )}

                                        <div className="mt-4">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead className="w-[60px]">ID</TableHead>
                                                        <TableHead>Titre</TableHead>
                                                        <TableHead>Slug</TableHead>
                                                        <TableHead>Vue</TableHead>
                                                        <TableHead>Statut</TableHead>
                                                        <TableHead className="text-right">Actions</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {pages.data.map((page: any) => (
                                                        <TableRow key={page.id}>
                                                            <TableCell className="font-medium">{page.id}</TableCell>
                                                            <TableCell>{page.title}</TableCell>
                                                            <TableCell>{page.slug}</TableCell>
                                                            <TableCell><Badge variant="outline">{page.viewed}</Badge></TableCell>
                                                            <TableCell>
                                                                <Badge variant={page.status ? 'default' : 'outline'}>
                                                                    {page.status ? 'En ligne' : 'Hors ligne'}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                <DropdownMenu>
                                                                    <DropdownMenuTrigger asChild>
                                                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                                            <span className="sr-only">Actions</span>
                                                                            <MoreVertical className="w-4 h-4" />
                                                                        </Button>
                                                                    </DropdownMenuTrigger>
                                                                    <DropdownMenuContent align="end">
                                                                        <DropdownMenuItem asChild>
                                                                            <a href={route('pages.show', page.slug)}>
                                                                                <Eye className="w-4 h-4 mr-2" /> Voir
                                                                            </a>
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem asChild>
                                                                            <a href={route('pages.edit', page.id)}>
                                                                                <Pencil className="w-4 h-4 mr-2" /> Modifier
                                                                            </a>
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuSeparator />
                                                                        <DropdownMenuItem
                                                                            className="text-destructive focus:text-destructive"
                                                                            onSelect={() => handleDelete(page)}
                                                                        >
                                                                            <Trash2 className="w-4 h-4 mr-2" /> Supprimer
                                                                        </DropdownMenuItem>
                                                                    </DropdownMenuContent>
                                                                </DropdownMenu>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="parametres">

                                <Card>
                                    <SettingsContent pages={pageActives} businessSettings={businessSettings} />
                                </Card>

                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>
        </>
    );
}
