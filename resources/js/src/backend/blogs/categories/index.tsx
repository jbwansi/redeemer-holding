import React, { useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Plus, Pencil, Trash2, Search, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Category } from '@/types/category';

interface CategoryForm {
    name: string;
}

const CategoriesIndex: React.FC<any> = ({ categories }) => {
    const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
    const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');

    // Formulaire de création
    const createForm = useForm<any>({
        name: '',
    });

    // Formulaire d'édition
    const editForm = useForm<any>({
        name: '',
    });

    const filteredCategories = categories.filter((category: Category) =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.slug.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        createForm.post('/categories', {
            onSuccess: () => {
                setIsCreateOpen(false);
                createForm.reset();
                toast.success("Catégorie créée avec succès");
            },
            onError: () => {
                toast.error(createForm.errors.name || "Une erreur est survenue");
            }
        });
    };

    const handleEdit = (category: Category) => {
        setSelectedCategory(category);
        editForm.setData('name', category.name);
        setIsEditOpen(true);
    };

    const handleUpdate = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!selectedCategory) return;

        editForm.put(`/categories/${selectedCategory.id}`, {
            onSuccess: () => {
                setIsEditOpen(false);
                editForm.reset();
                setSelectedCategory(null);
                toast.success("Catégorie mise à jour avec succès");
            },
            onError: () => {
                toast.error(editForm.errors.name || "Une erreur est survenue");
            }
        });
    };

    const handleDelete = () => {
        if (!selectedCategory) return;

        router.delete(`/categories/${selectedCategory.id}`, {
            onSuccess: () => {
                setIsDeleteOpen(false);
                setSelectedCategory(null);
                toast.success("Catégorie supprimée avec succès");
            },
            onError: () => {
                toast.error("Une erreur est survenue lors de la suppression");
            }
        });
    };

    return (
        <div className="p-4 space-y-6">
            <div className="rounded-md border">
                <div className="border-b p-4 bg-background">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-semibold">Gestion des catégories</h2>
                            <p className="text-sm text-muted-foreground">
                                Gérez les catégories de votre blog
                            </p>
                        </div>

                        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                            <DialogTrigger asChild>
                                <Button className=" h-12 rounded-xl text-base font-medium hover:scale-105 transition-transform dark:bg-primary dark:text-white">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Nouvelle catégorie
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle className='text-xl'>Créer une nouvelle catégorie</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleCreate} className="space-y-4">
                                    <div className="space-y-2">
                                        <Input
                                            placeholder="Nom de la catégorie"
                                            value={createForm.data.name}
                                            onChange={e => createForm.setData('name', e.target.value)}
                                            disabled={createForm.processing}
                                            className={`h-12 px-4 rounded-xl bg-white/50 dark:bg-slate-800 ${createForm.errors.name ? 'border-red-500' : ''} `}
                                        />
                                        {createForm.errors.name && (
                                            <p className="text-sm text-red-500">{createForm.errors.name}</p>
                                        )}
                                    </div>
                                    <DialogFooter>
                                        <Button className=" h-12 rounded-xl text-base font-medium hover:scale-105 transition-transform dark:bg-primary dark:text-white"
                                            type="submit"
                                            disabled={createForm.processing}
                                        >
                                            {createForm.processing && (
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            )}
                                            Créer une catégorie
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <div className="mt-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                            <Input
                                placeholder="Rechercher une catégorie..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 max-w-sm h-10"
                            />
                        </div>
                    </div>
                </div>

                <div className="relative">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nom de la catégorie</TableHead>
                                <TableHead>Slug</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredCategories.map((category: Category) => (
                                <TableRow key={category.id}>
                                    <TableCell className="font-medium">
                                        {category.name}
                                    </TableCell>
                                    <TableCell>{category.slug}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleEdit(category)}
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => {
                                                    setSelectedCategory(category);
                                                    setIsDeleteOpen(true);
                                                }}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {filteredCategories.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={3}
                                        className="h-24 text-center text-muted-foreground"
                                    >
                                        Aucune catégorie trouvée
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Modifier la catégorie</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleUpdate} className="space-y-4">
                        <div className="space-y-2">
                            <Input
                                placeholder="Nom de la catégorie"
                                value={editForm.data.name}
                                onChange={e => editForm.setData('name', e.target.value)}
                                disabled={editForm.processing}
                                className={editForm.errors.name ? 'border-red-500' : ''}
                            />
                            {editForm.errors.name && (
                                <p className="text-sm text-red-500">{editForm.errors.name}</p>
                            )}
                        </div>
                        <DialogFooter>
                            <Button
                                type="submit"
                                disabled={editForm.processing}
                            >
                                {editForm.processing && (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                )}
                                Mettre à jour
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Cette action est irréversible. Cela supprimera définitivement la catégorie
                            <span className="font-semibold"> {selectedCategory?.name}</span>.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>
                            Annuler
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                        >
                            Supprimer
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default CategoriesIndex;
