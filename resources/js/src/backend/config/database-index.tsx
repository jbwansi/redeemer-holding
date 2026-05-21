import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import {
  Database,
  HardDrive,
  Table as TableIcon,
  ClipboardList,
  Shield,
  Archive,
  FileText,
  ArrowRight,
} from 'lucide-react';
import { route } from 'ziggy-js';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AlertTriangle, Trash2, RefreshCw } from 'lucide-react';
import { useForm } from '@inertiajs/react';
import { toast } from 'sonner';

interface DbTable {
  name: string;
  rows: number;
  created_at: string | null;
  updated_at: string | null;
  collation: string;
  engine: string;
  size: string;
}

interface Props {
  database: string;
  driver: string;
  tables: DbTable[];
  totalTables: number;
  totalRows: number;
  totalSize: number;
  mainEngine: string;
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
  // Table management state
  const [searchQuery, setSearchQuery] = useState('');
  const [truncateConfirm, setTruncateConfirm] = useState({ show: false, tableName: '' });
  const { post, processing } = useForm();

  const handleTruncateTable = (tableName: string) => {
    setTruncateConfirm({ show: true, tableName });
  };

  const confirmTruncate = () => {
    post(route('database.truncate', { table: truncateConfirm.tableName }), {
      onSuccess: () => {
        toast.success(`Table ${truncateConfirm.tableName} vidée avec succès`);
        setTruncateConfirm({ show: false, tableName: '' });
      },
      onError: () => {
        toast.error('Une erreur est survenue lors du vidage de la table');
      },
    });
  };

  const handleOptimizeTable = (tableName: string) => {
    post(route('database.optimize', { table: tableName }), {
      onSuccess: () => {
        toast.success(`Table ${tableName} optimisée avec succès`);
      },
      onError: () => {
        toast.error("Une erreur est survenue lors de l'optimisation");
      },
    });
  };

  const filteredTables = tables?.filter((table) =>
    table.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            Consultez l’état général de votre base de données et accédez aux outils de maintenance
            et d’administration.
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
              <p className="text-xs text-muted-foreground mt-1">Driver: {driver}</p>
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
              <div className="text-2xl font-bold">{totalRows.toLocaleString()}</div>
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Archive className="h-5 w-5" />
                Sauvegarde
              </CardTitle>
              <CardDescription>Exporter la base avant migration ou maintenance.</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href={route('config.database.backup')}>
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
              <Link href={route('config.database.logs')}>
                <Button variant="outline" className="w-full">
                  Voir les journaux
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Recherche et gestion des tables */}
        <div className="flex justify-between items-center mt-8">
          <div className="w-full max-w-sm">
            <Input
              placeholder="Rechercher une table..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-12"
            />
          </div>
        </div>

        {/* Liste complète des tables avec actions */}
        <Card>
          <CardHeader>
            <CardTitle>Tables de la base de données</CardTitle>
            <CardDescription>
              Liste complète des tables avec leurs statistiques et actions de maintenance.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px] rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom de la table</TableHead>
                    <TableHead>Enregistrements</TableHead>
                    <TableHead>Taille</TableHead>
                    <TableHead>Moteur</TableHead>
                    <TableHead>Dernière mise à jour</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTables?.map((table) => (
                    <TableRow key={table.name}>
                      <TableCell className="font-medium">{table.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{table.rows.toLocaleString()}</Badge>
                      </TableCell>
                      <TableCell>{table.size}</TableCell>
                      <TableCell>{table.engine}</TableCell>
                      <TableCell>
                        {table.updated_at ? new Date(table.updated_at).toLocaleDateString() : 'N/A'}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOptimizeTable(table.name)}
                          disabled={processing}
                        >
                          <RefreshCw className="h-4 w-4 mr-1" />
                          Optimiser
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleTruncateTable(table.name)}
                          disabled={processing}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Vider
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Dialog de confirmation pour le vidage */}
        <Dialog
          open={truncateConfirm.show}
          onOpenChange={() => setTruncateConfirm({ show: false, tableName: '' })}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Confirmer le vidage
              </DialogTitle>
              <DialogDescription>
                Voulez-vous vraiment vider la table{' '}
                <span className="font-semibold">{truncateConfirm.tableName}</span> ? Cette action
                est irréversible et supprimera toutes les données de la table.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setTruncateConfirm({ show: false, tableName: '' })}
              >
                Annuler
              </Button>
              <Button variant="destructive" onClick={confirmTruncate} disabled={processing}>
                {processing ? 'Vidage...' : 'Confirmer le vidage'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default DatabaseIndex;
