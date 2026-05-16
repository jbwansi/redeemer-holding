import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Database,
  AlertTriangle,
  Trash2,
  RefreshCw,
  Shield,
  HardDrive,
  Table as TableIcon,
  ClipboardList,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';

interface Table {
  name: string;
  rows: number;
  created_at: string;
  updated_at: string;
  collation: string;
  engine: string;
  size: string;
}

interface Props {
  tables: Table[];
  error?: string;
}

const DatabaseClean: React.FC<Props> = ({ tables, error }) => {
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState(false);
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

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* En-tête et statistiques */}
      <div className="space-y-6">
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertTitle className="text-base font-semibold">
            Nettoyage de la base de données
          </AlertTitle>
          <AlertDescription>
            Cette interface permet de gérer et optimiser les tables de la base de données. Manipulez
            ces outils avec précaution.
          </AlertDescription>
        </Alert>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tables</CardTitle>
              <TableIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tables?.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Enregistrements</CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {tables?.reduce((acc, table) => acc + table.rows, 0)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taille Totale</CardTitle>
              <HardDrive className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {tables?.reduce((acc, table) => acc + parseFloat(table.size), 0).toFixed(2)} MB
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Moteur Principal</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tables?.[0]?.engine || 'N/A'}</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recherche */}
      <div className="flex justify-between items-center">
        <div className="w-full max-w-sm">
          <Input
            placeholder="Rechercher une table..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-12"
          />
        </div>
      </div>

      {/* Liste des tables */}
      <Card>
        <CardHeader>
          <CardTitle>Tables de la base de données</CardTitle>
          <CardDescription>Liste complète des tables avec leurs statistiques</CardDescription>
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
                    <TableCell>{new Date(table.updated_at).toLocaleDateString()}</TableCell>
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
              <span className="font-semibold">{truncateConfirm.tableName}</span> ? Cette action est
              irréversible et supprimera toutes les données de la table.
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
  );
};

export default DatabaseClean;
