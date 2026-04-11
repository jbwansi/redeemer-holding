import React from 'react'
import { Head, Link } from '@inertiajs/react'
import {
    Database,
    HardDrive,
    Table as TableIcon,
    ClipboardList,
    Shield,
    Archive,
    FileText,
    ArrowRight,
} from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'

interface DbTable {
    name: string
    rows: number
    created_at: string | null
    updated_at: string | null
    collation: string
    engine: string
    size: string
}

interface Props {
    database: string
    driver: string
    tables: DbTable[]
    totalTables: number
    totalRows: number
    totalSize: number
    mainEngine: string
}

const DatabaseIndex: React.FC<Props> = ({
    database,
    driver,
    tables,
    totalTables,
    totalRows,
    totalSize,
    mainEngine,
}) => {
    const previewTables = tables?.slice(0, 8) ?? []

    return (
        <>
            <Head title="Configuration de la base de données" />

            <div className="container mx-auto p-6 space-y-6">
                <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertTitle className="text-base font-semibold">
                        Configuration de la base de données
                    </AlertTitle>
                    <AlertDescription>
                        Consultez l’état général de votre base de données et accédez aux outils
                        de maintenance et d’administration.
                    </AlertDescription>
                </Alert>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Base de données</CardTitle>
                            <Database className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{database}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Driver: {driver}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Tables</CardTitle>
                            <TableIcon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalTables}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Enregistrements</CardTitle>
                            <ClipboardList className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {totalRows.toLocaleString()}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Taille Totale</CardTitle>
                            <HardDrive className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalSize.toFixed(2)} MB</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Moteur principal: {mainEngine || 'N/A'}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="h-5 w-5" />
                                Nettoyage
                            </CardTitle>
                            <CardDescription>
                                Optimiser les tables et vider les données inutiles.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Link href={route('config.database_clean')}>
                                <Button className="w-full">
                                    Ouvrir l’outil de nettoyage
                                    <ArrowRight className="h-4 w-4 ml-2" />
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Archive className="h-5 w-5" />
                                Sauvegarde
                            </CardTitle>
                            <CardDescription>
                                Exporter la base avant migration ou maintenance.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Link href={route('database.backup')}>
                                <Button variant="outline" className="w-full">
                                    Accéder aux sauvegardes
                                    <ArrowRight className="h-4 w-4 ml-2" />
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Journaux
                            </CardTitle>
                            <CardDescription>
                                Voir les erreurs et opérations liées à la base de données.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Link href={route('database.logs')}>
                                <Button variant="outline" className="w-full">
                                    Voir les journaux
                                    <ArrowRight className="h-4 w-4 ml-2" />
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Aperçu des tables</CardTitle>
                        <CardDescription>
                            Quelques tables de la base avec leurs statistiques.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nom</TableHead>
                                    <TableHead>Enregistrements</TableHead>
                                    <TableHead>Taille</TableHead>
                                    <TableHead>Moteur</TableHead>
                                    <TableHead>Dernière mise à jour</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {previewTables.map((table) => (
                                    <TableRow key={table.name}>
                                        <TableCell className="font-medium">{table.name}</TableCell>
                                        <TableCell>{table.rows.toLocaleString()}</TableCell>
                                        <TableCell>{table.size}</TableCell>
                                        <TableCell>{table.engine}</TableCell>
                                        <TableCell>
                                            {table.updated_at
                                                ? new Date(table.updated_at).toLocaleDateString()
                                                : 'N/A'}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </>
    )
}

export default DatabaseIndex