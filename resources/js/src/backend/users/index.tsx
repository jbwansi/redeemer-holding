import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import {
  Search,
  MoreVertical,
  Pencil,
  Trash2,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Upload,
  ArrowDown,
  ArrowUp,
  Mail,
  User as UserIcon,
  Shield,
  Calendar,
  GraduationCap,
} from 'lucide-react';
import debounce from 'lodash/debounce';
import { useState, useCallback, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { getRelativeTime } from '@/lib/utils';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'client' | 'coach';
  is_active: 1 | 0;
  email_verified_at: string | null;
  created_at: string;
}

interface TrainingOption {
  id: number;
  title: string;
  slug: string;
  start_date: string;
  end_date: string;
  price: number;
}

interface Props {
  users: {
    data: User[];
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
      per_page: number;
    };
    total: number;
  };
  filters: {
    search?: string;
    role?: string;
    is_active?: string;
    verified?: string;
  };
  availableTrainings: TrainingOption[];
}

const roleOptions = [
  { id: 'all', name: 'Tous les rôles', value: 'all' },
  { id: 'admin', name: 'Administrateur', value: 'admin' },
  { id: 'coach', name: 'Éditeur', value: 'coach' },
  { id: 'user', name: 'Utilisateur', value: 'user' },
];

const statusOptions = [
  { id: 'all', name: 'Tous les statuts', value: 'all' },
  { id: 1, name: 'Actif', value: 1 },
  { id: 0, name: 'Inactif', value: 0 },
];

const verifiedOptions = [
  { id: 'all', name: 'Tous', value: 'all' },
  { id: 'verified', name: 'Vérifié', value: 'verified' },
  { id: 'unverified', name: 'Non vérifié', value: 'unverified' },
];

export default function Index({ users, filters, availableTrainings }: Props) {
  const importInputRef = useRef<HTMLInputElement | null>(null);
  const [searchQuery, setSearchQuery] = useState(filters.search || '');
  const [selectedrole, setSelectedrole] = useState(filters.role || 'all');
  const [selectedStatus, setSelectedStatus] = useState(filters.is_active || 'all');
  const [selectedVerified, setSelectedVerified] = useState(filters.verified || 'all');
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [bulkTrainingId, setBulkTrainingId] = useState('');

  const activeCount = users?.data?.filter((u) => u.is_active === 1).length ?? 0;
  const verifiedCount = users?.data?.filter((u) => !!u.email_verified_at).length ?? 0;
  const allCurrentPageSelected =
    users.data.length > 0 && users.data.every((user) => selectedUserIds.includes(user.id));

  const debouncedSearch = useCallback(
    debounce((value: string) => {
      updateFilters({ search: value });
    }, 300),
    []
  );

  const updateFilters = (
    newFilters: Partial<typeof filters & { sort?: string; direction?: string }>
  ) => {
    router.get(
      route('users.index'),
      { ...filters, ...newFilters },
      {
        preserveState: true,
        preserveScroll: true,
        only: ['users'],
      }
    );
  };

  const handleSort = (field: string) => {
    const newDirection = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortDirection(newDirection);
    updateFilters({ sort: field, direction: newDirection });
  };

  const handleDelete = (user: User) => {
    const message = `Êtes-vous sûr de vouloir supprimer l'utilisateur ${user.name} ?`;

    toast.warning(message, {
      action: {
        label: 'Supprimer',
        onClick: () => {
          router.delete(route('users.destroy', user.id), {
            onSuccess: () => toast.success('Utilisateur supprimé avec succès'),
            onError: () => toast.error('Une erreur est survenue'),
          });
        },
      },
      cancel: {
        label: 'Annuler',
        onClick: () => {},
      },
    });
  };

  const getroleBadge = (role: User['role']) => {
    const styles = {
      admin: 'bg-purple-100 text-purple-800',
      coach: 'bg-blue-100 text-blue-800',
      client: 'bg-gray-100 text-gray-800',
    };

    const labels = {
      admin: 'Administrateur',
      coach: 'Éditeur',
      client: 'Utilisateur',
    };

    return <Badge className={styles[role]}>{labels[role]}</Badge>;
  };

  const getStatusBadge = (status: User['is_active']) => {
    return status === 1 ? (
      <Badge className="bg-green-100 text-green-800">Actif</Badge>
    ) : (
      <Badge className="bg-yellow-100 text-yellow-800">Inactif</Badge>
    );
  };

  const handleExport = () => {
    const exportUrl = route('users.export', {
      search: searchQuery || undefined,
      role: selectedrole,
      is_active: selectedStatus,
      verified: selectedVerified,
      sort: sortField,
      direction: sortDirection,
    });

    window.location.href = exportUrl;
  };

  const handleImportUsersToNewsletter = () => {
    router.post(
      route('newsletters.import-users'),
      {},
      {
        preserveScroll: true,
        onSuccess: () => toast.success('Contacts utilisateurs importes vers la newsletter.'),
        onError: () => toast.error('Echec de l import des contacts utilisateurs.'),
      }
    );
  };

  const handleImportUsers = () => {
    importInputRef.current?.click();
  };

  const handleImportFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    router.post(
      route('users.import'),
      { file },
      {
        forceFormData: true,
        preserveScroll: true,
        onSuccess: () => {
          toast.success('Import des utilisateurs terminé');
          if (importInputRef.current) {
            importInputRef.current.value = '';
          }
        },
        onError: () => {
          toast.error('Echec de l import des utilisateurs');
        },
      }
    );
  };

  const toggleUserSelection = (userId: number) => {
    setSelectedUserIds((previous) => {
      if (previous.includes(userId)) {
        return previous.filter((id) => id !== userId);
      }

      return [...previous, userId];
    });
  };

  const toggleCurrentPageSelection = () => {
    if (allCurrentPageSelected) {
      const currentPageIds = new Set(users.data.map((user) => user.id));
      setSelectedUserIds((previous) => previous.filter((id) => !currentPageIds.has(id)));
      return;
    }

    const merged = new Set(selectedUserIds);
    users.data.forEach((user) => merged.add(user.id));
    setSelectedUserIds(Array.from(merged));
  };

  const handleBulkAssignTraining = () => {
    if (!bulkTrainingId) {
      toast.error('Veuillez sélectionner une formation à attribuer.');
      return;
    }

    if (selectedUserIds.length === 0) {
      toast.error('Veuillez sélectionner au moins un utilisateur.');
      return;
    }

    router.post(
      route('users.trainings.bulk-assign'),
      {
        training_id: Number(bulkTrainingId),
        user_ids: selectedUserIds,
      },
      {
        preserveScroll: true,
        onSuccess: () => {
          toast.success('Attribution en lot réalisée avec succès.');
          setSelectedUserIds([]);
          setBulkTrainingId('');
        },
        onError: () => {
          toast.error("L'attribution en lot a échoué.");
        },
      }
    );
  };

  return (
    <>
      <Head title="Utilisateurs" />
      <input
        ref={importInputRef}
        type="file"
        aria-label="Importer des utilisateurs"
        accept=".csv,text/csv,.txt"
        className="hidden"
        onChange={handleImportFileChange}
      />

      <div className="flex flex-col min-h-screen bg-background">
        <div className="border-b bg-gradient-to-r from-slate-50 to-white">
          <div className="mx-auto px-4 py-8 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h1 className="text-3xl font-semibold tracking-tight">Utilisateurs</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  Gérez les comptes, rôles et statuts de votre plateforme.
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="h-11" onClick={handleImportUsersToNewsletter}>
                  <Upload className="mr-2 h-4 w-4" />
                  Import newsletter
                </Button>
                <Button variant="outline" className="h-11" onClick={handleImportUsers}>
                  <Upload className="mr-2 h-4 w-4" />
                  Import utilisateurs
                </Button>
                <Button variant="outline" className="h-11" onClick={handleExport}>
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>
                <Button asChild className="h-11">
                  <Link href={route('users.create')}>Nouvel utilisateur</Link>
                </Button>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <Card>
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground">Total</p>
                  <p className="mt-1 text-2xl font-semibold">{users?.total || 0}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground">Actifs (page)</p>
                  <p className="mt-1 text-2xl font-semibold text-emerald-600">{activeCount}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground">Vérifiés (page)</p>
                  <p className="mt-1 text-2xl font-semibold text-blue-600">{verifiedCount}</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 py-6">
          <div className="mx-auto px-4 sm:px-6 lg:px-8">
            <Card>
              {/* Filters */}
              <CardContent className="p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher un utilisateur..."
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
                      value={selectedrole}
                      onValueChange={(value) => {
                        setSelectedrole(value);
                        updateFilters({ role: value });
                      }}
                    >
                      <SelectTrigger className="w-full md:w-[180px]">
                        <SelectValue placeholder="Rôle" />
                      </SelectTrigger>
                      <SelectContent>
                        {roleOptions.map((option) => (
                          <SelectItem key={option.id} value={option.value}>
                            {option.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select
                      value={selectedStatus}
                      onValueChange={(value) => {
                        setSelectedStatus(value);
                        updateFilters({ is_active: value });
                      }}
                    >
                      <SelectTrigger className="w-full md:w-[180px]">
                        <SelectValue placeholder="Statut" />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((option) => (
                          <SelectItem key={option.id} value={option.value}>
                            {option.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select
                      value={selectedVerified}
                      onValueChange={(value) => {
                        setSelectedVerified(value);
                        updateFilters({ verified: value });
                      }}
                    >
                      <SelectTrigger className="w-full md:w-[180px]">
                        <SelectValue placeholder="Vérification" />
                      </SelectTrigger>
                      <SelectContent>
                        {verifiedOptions.map((option) => (
                          <SelectItem key={option.id} value={option.value}>
                            {option.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <p className="text-sm font-medium">Attribution en lot</p>
                      <p className="text-xs text-muted-foreground">
                        {selectedUserIds.length} utilisateur(s) sélectionné(s)
                      </p>
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      <Select value={bulkTrainingId} onValueChange={setBulkTrainingId}>
                        <SelectTrigger className="w-full sm:w-[280px] bg-white">
                          <SelectValue placeholder="Choisir une formation" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableTrainings.map((training) => (
                            <SelectItem key={training.id} value={String(training.id)}>
                              {training.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button onClick={handleBulkAssignTraining} className="h-10">
                        <GraduationCap className="mr-2 h-4 w-4" />
                        Attribuer aux sélectionnés
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>

              {/* Table */}
              <div className="relative overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[45px]">
                        <input
                          type="checkbox"
                          aria-label="Sélectionner tous les utilisateurs de la page"
                          checked={allCurrentPageSelected}
                          onChange={toggleCurrentPageSelection}
                        />
                      </TableHead>
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
                      <TableHead>Utilisateur</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Rôle</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Vérifié</TableHead>
                      <TableHead className="w-[70px]" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.data.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="h-24 text-center">
                          Aucun utilisateur trouvé
                        </TableCell>
                      </TableRow>
                    ) : (
                      users.data.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <input
                              type="checkbox"
                              aria-label={`Sélectionner ${user.name}`}
                              checked={selectedUserIds.includes(user.id)}
                              onChange={() => toggleUserSelection(user.id)}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span>{getRelativeTime(new Date(user.created_at))}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <UserIcon className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{user.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              <span>{user.email}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Shield className="h-4 w-4 text-muted-foreground" />
                              {getroleBadge(user.role)}
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(user.is_active)}</TableCell>
                          <TableCell>
                            {user.email_verified_at ? (
                              <Badge className="bg-green-100 text-green-800">Vérifié</Badge>
                            ) : (
                              <Badge className="bg-yellow-100 text-yellow-800">Non vérifié</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="hover:bg-muted">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-[160px]">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem asChild>
                                  <Link
                                    href={`${route('users.show', user.id)}#assign-training`}
                                    className="cursor-pointer"
                                  >
                                    <GraduationCap className="h-4 w-4 mr-2" />
                                    Attribuer formation
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <Link
                                    href={route('users.show', user.id)}
                                    className="cursor-pointer"
                                  >
                                    <UserIcon className="h-4 w-4 mr-2" />
                                    Profil
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <Link
                                    href={route('users.edit', user.id)}
                                    className="cursor-pointer"
                                  >
                                    <Pencil className="h-4 w-4 mr-2" />
                                    Modifier
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {user.role != 'admin' && (
                                  <DropdownMenuItem
                                    onClick={() => handleDelete(user)}
                                    className="text-destructive focus:text-destructive cursor-pointer"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Supprimer
                                  </DropdownMenuItem>
                                )}
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
              {users?.data?.length > 0 && users?.meta?.last_page > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    Affichage de {users.meta.from} à {users.meta.to} sur {users?.total} utilisateurs
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!users.meta.links[0].url}
                      onClick={() => router.get(users.meta.links[0].url || '')}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    {users.meta.links.slice(1, -1).map((link, i) => (
                      <Button
                        key={i}
                        variant={link.active ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => router.get(link.url || '')}
                      >
                        {link.label}
                      </Button>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!users.meta.links[users.meta.links.length - 1].url}
                      onClick={() =>
                        router.get(users.meta.links[users.meta.links.length - 1].url || '')
                      }
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
