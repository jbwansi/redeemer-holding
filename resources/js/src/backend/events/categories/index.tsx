// types/event.ts
export interface EventCategory {
    id: number
    name: string
    slug: string
    description: string | null
    color: string
    events_count?: number
}

export interface CategoryForm {
    name: string
    color: string
    description?: string
}

// pages/Events/Categories/index.tsx
import React, { useState } from 'react'
import { router, useForm } from '@inertiajs/react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Search, Plus, Pencil, Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface PaginatedData<T> {
    data: T[]
    meta: {
        current_page: number
        from: number
        last_page: number
        per_page: number
        to: number
        total: number
    }
}

interface Props {
    categories: PaginatedData<EventCategory>
}

export default function CategoriesIndex({ categories }: Props) {
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [selected, setSelected] = useState<EventCategory | null>(null)

    const createForm = useForm<CategoryForm>({
        name: '',
        color: '#000000',
        description: ''
    })

    const editForm = useForm<CategoryForm>({
        name: '',
        color: '#000000',
        description: ''
    })

    const filteredCategories = categories.data.filter(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault()
        createForm.post(route('event-categories.store'), {
            onSuccess: () => {
                setIsCreateOpen(false)
                createForm.reset()
                toast.success('La catégorie a été créée avec succès')
            },
            onError: () => {
                toast.error(createForm.errors.name || 'Erreur lors de la création de la catégorie')
            }
        })
    }

    const handleEdit = (category: EventCategory) => {
        setSelected(category)
        editForm.setData({
            name: category.name,
            color: category.color,
            description: category.description || ''
        })
        setIsEditOpen(true)
    }

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault()
        if (!selected) return

        editForm.put(route('event-categories.update', selected.id), {
            onSuccess: () => {
                setIsEditOpen(false)
                editForm.reset()
                setSelected(null)
                toast.success('La catégorie a été mise à jour avec succès')
            },
            onError: () => {
                toast.error(editForm.errors.name || 'Erreur lors de la mise à jour de la catégorie')
            }
        })
    }

    const handleDelete = () => {
        if (!selected) return

        router.delete(route('event-categories.destroy', selected.id), {
            onSuccess: () => {
                setIsDeleteOpen(false)
                setSelected(null)
                toast.success('La catégorie a été supprimée avec succès')
            },
            onError: () => {
                toast.error('Erreur lors de la suppression de la catégorie')
            }
        })
    }

    return (
        <div className="p-6 space-y-6">
            <div className="rounded-lg border bg-background">
                <div className="p-6 border-b">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Catégories des évènements</h1>
                            <p className="text-muted-foreground">
                                Gérez les catégories des évènements
                            </p>
                        </div>

                        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                            <DialogTrigger asChild>
                                <Button size="lg" className="h-12 px-6 dark:text-white">
                                    <Plus className="mr-2 h-5 w-5" />
                                    Ajouter une catégorie
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle className="text-xl font-semibold">
                                        Créer une catégorie
                                    </DialogTitle>
                                </DialogHeader>

                                <form onSubmit={handleCreate} className="space-y-6">
                                    <div className="space-y-4">
                                        <div>
                                            <Label>Nom de la catégorie</Label>
                                            <Input
                                                value={createForm.data.name}
                                                onChange={e => createForm.setData('name', e.target.value)}
                                                className="h-12"
                                            />
                                            {createForm.errors.name && (
                                                <p className="mt-1 text-sm text-destructive">
                                                    {createForm.errors.name}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <Label>Description</Label>
                                            <Textarea
                                                value={createForm.data.description}
                                                onChange={e => createForm.setData('description', e.target.value)}
                                                className="h-24 resize-none"
                                            />
                                        </div>

                                        <div>
                                            <Label>Couleur de l'évènement</Label>
                                            <div className="flex gap-3">
                                                <Input
                                                    type="color"
                                                    value={createForm.data.color}
                                                    onChange={e => createForm.setData('color', e.target.value)}
                                                    className="w-24 h-12 p-1"
                                                />
                                                <Input
                                                    value={createForm.data.color}
                                                    onChange={e => createForm.setData('color', e.target.value)}
                                                    className="font-mono h-12"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <DialogFooter>
                                        <Button
                                            type="submit"
                                            size="lg"
                                            disabled={createForm.processing}
                                            className='dark:text-white'
                                        >
                                            {createForm.processing && (
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            )}
                                            Créer la catégorie
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            placeholder="Search categories..."
                            className="pl-10 max-w-sm h-12"
                        />
                    </div>
                </div>

                <div className="relative">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Catégorie</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Evènements</TableHead>
                                <TableHead className="w-[100px]">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredCategories.map(category => (
                                <TableRow key={category.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-4 h-4 rounded-full"
                                                style={{ backgroundColor: category.color }}
                                            />
                                            <span className="font-medium">{category.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {category.description || '-'}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary">
                                            {category.events_count || 0}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleEdit(category)}

                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-destructive"
                                                onClick={() => {
                                                    setSelected(category)
                                                    setIsDeleteOpen(true)
                                                }}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {filteredCategories.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={4}
                                        className="h-24 text-center text-muted-foreground"
                                    >
                                       Aucun résultat trouvé
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
                        <DialogTitle className="text-xl font-semibold">
                            Edit Category
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleUpdate} className="space-y-6">
                        <div className="space-y-4">
                            <div>
                                <Label>Name</Label>
                                <Input
                                    value={editForm.data.name}
                                    onChange={e => editForm.setData('name', e.target.value)}
                                    className="h-12"
                                />
                                {editForm.errors.name && (
                                    <p className="mt-1 text-sm text-destructive">
                                        {editForm.errors.name}
                                    </p>
                                )}
                            </div>

                            <div>
                                <Label>Description</Label>
                                <Textarea
                                    value={editForm.data.description}
                                    onChange={e => editForm.setData('description', e.target.value)}
                                    className="h-24 resize-none"
                                />
                            </div>

                            <div>
                                <Label>Color</Label>
                                <div className="flex gap-3">
                                    <Input
                                        type="color"
                                        value={editForm.data.color}
                                        onChange={e => editForm.setData('color', e.target.value)}
                                        className="w-24 h-12 p-1"
                                    />
                                    <Input
                                        value={editForm.data.color}
                                        onChange={e => editForm.setData('color', e.target.value)}
                                        className="font-mono"
                                    />
                                </div>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button
                                type="submit"
                                size="lg"
                                disabled={editForm.processing}
                            >
                                {editForm.processing && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Update Category
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirmation de suppression</AlertDialogTitle>
                        <AlertDialogDescription>
                            Voulez-vous vraiment supprimer la catégorie{' '}
                            <span className="font-semibold">{selected?.name}</span>.
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
    )
}
