import React from "react";
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Post } from "@/types/post";
import { Link, router } from "@inertiajs/react";
import { Badge } from "@/components/ui/badge";
import { Pencil, MoreHorizontal, ChevronDown, Search, Loader2, Trash } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../ui/alert-dialog";

interface DataTableProps {
    data: Post[];
}

interface PostColumn {
    id: number;
    title: string;
    excerpt: string;
    published: boolean;
    published_at: string;
    categories: string;
}

const columns: ColumnDef<PostColumn>[] = [
    {
        accessorKey: "title",
        header: "Titre",
        cell: ({ row }) => {
            const title: string = row.getValue("title");
            return (
                <div className="flex flex-col">
                    <span className="font-medium">{title}</span>
                    <span className="text-xs text-muted-foreground">
                        {row.original.excerpt}
                    </span>
                </div>
            );
        },
    },
    {
        accessorKey: "published",
        header: "Statut",
        cell: ({ row }) => {
            const published: boolean = row.getValue("published");
            const publishedAt: string = row.original.published_at;

            // Si publié est false, c'est un brouillon
            if (!published) {
                return (
                    <Badge color="secondary">
                        Brouillon
                    </Badge>
                );
            }

            // Si publié est true mais pas de date, c'est un brouillon aussi
            if (!publishedAt) {
                return (
                    <Badge color="secondary">
                        Brouillon
                    </Badge>
                );
            }

            const publishDate = new Date(publishedAt);
            const now = new Date();

            // Si la date de publication est dans le futur
            if (publishDate > now) {
                return (
                    <Badge color="warning" className="bg-orange-100 text-orange-800 hover:bg-orange-100/80">
                        En cours de publication
                    </Badge>
                );
            }

            // Si publié et date passée
            return (
                <Badge color="success" className="bg-green-100 text-green-800 hover:bg-green-100/80">
                    Publié
                </Badge>
            );
        },
    },
    {
        accessorKey: "published_at",
        header: "Date de publication",
        cell: ({ row }) => {
            const date: string = row.getValue("published_at");
            return date ? format(new Date(date), "PPP", { locale: fr }) : "-";
        },
    },
    {
        accessorKey: "categories",
        header: "Catégories",
        cell: ({ row }) => {
            const categories: string = row.getValue("categories");
            return (
                <div className="flex gap-1 flex-wrap">
                    {categories?.split(",").map((category, index) => (
                        <Badge key={index} variant="outline">
                            {category}
                        </Badge>
                    ))}
                </div>
            );
        },
    },

{
    id: "actions",
    cell: ({ row }) => {
        const post = row.original;
        const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
        const [isDeleting, setIsDeleting] = React.useState(false);

        const handleDelete = () => {
            setIsDeleting(true);
            router.delete(route('posts.destroy', post.id), {
                onSuccess: () => {
                    setShowDeleteDialog(false);
                    toast.success('Article supprimé avec succès');
                },
                onError: () => {
                    setShowDeleteDialog(false);
                    toast.error('Une erreur est survenue lors de la suppression');
                },
                onFinish: () => setIsDeleting(false)
            });
        };

        return (
            <>
                <div className="flex justify-end">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <Link href={route("posts.edit", post.id)} className="w-full">
                                <Button variant="ghost" size="sm" className="w-full justify-start">
                                    <Pencil className="h-4 w-4 mr-2" />
                                    Modifier
                                </Button>
                            </Link>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="w-full justify-start text-red-600 hover:text-red-600 hover:bg-red-50"
                                onClick={() => setShowDeleteDialog(true)}
                            >
                                <Trash className="h-4 w-4 mr-2" />
                                Supprimer
                            </Button>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Cette action est irréversible. Cela supprimera définitivement l'article
                                <span className="font-semibold"> {post.title}</span>.
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
                                        <Trash className="mr-2 h-4 w-4" />
                                        Supprimer
                                    </>
                                )}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </>
        );
    },
}
];

export function DataTable({ data }: DataTableProps) {
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});

    const tableData = React.useMemo(() =>
        data.map(post => ({
            id: post.id,
            title: post.title,
            excerpt: post.excerpt || "",
            published: post.published,
            published_at: post.published_at,
            categories: post?.categories?.map(c => c.name).join(",")
        })), [data]
    );

    const table = useReactTable({
        data: tableData,
        columns,
        enableColumnFilters: tableData.length > 0,
        enableSorting: tableData.length > 0,
        enableHiding: tableData.length > 0,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        onSortingChange: setSorting,
        initialState: {
            pagination: {
                pageSize: 10,
            },
        },
        state: {
            sorting,
            columnFilters,
            columnVisibility,
        },
    });

    return (
        <div className="space-y-4">
            {tableData.length > 0 && (
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <Search className="h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Filtrer par titre..."
                            value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
                            onChange={(event) =>
                                table.getColumn("title")?.setFilterValue(event.target.value)
                            }
                            className="max-w-sm"
                        />
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                                Colonnes <ChevronDown className="ml-2 h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[150px]">
                            {table
                                .getAllColumns()
                                .filter(
                                    (column) =>
                                        typeof column.accessorFn !== "undefined" &&
                                        column.getCanHide()
                                )
                                .map((column) => {
                                    return (
                                        <DropdownMenuCheckboxItem
                                            key={column.id}
                                            className="capitalize"
                                            checked={column.getIsVisible()}
                                            onCheckedChange={(value) =>
                                                column.toggleVisibility(!!value)
                                            }
                                        >
                                            {column.id}
                                        </DropdownMenuCheckboxItem>
                                    );
                                })}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )}

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id}>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center text-muted-foreground"
                                >
                                    Aucun article trouvé.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {tableData.length > 0 && (
                <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        {table.getFilteredRowModel().rows.length} article(s)
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                        >
                            Précédent
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                        >
                            Suivant
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
