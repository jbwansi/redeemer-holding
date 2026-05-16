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
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  Search,
  MoreVertical,
  Trash2,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Clock,
  Mail,
  Phone,
  Inbox,
  AlertCircle,
  Loader,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import debounce from 'lodash/debounce';
import { useState, useCallback } from 'react';

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

interface Stats {
  total: number;
  pending: number;
  in_progress: number;
  completed: number;
  cancelled: number;
}

interface Props {
  requests: {
    data: ServiceRequest[];
    meta: {
      current_page: number;
      from: number;
      last_page: number;
      links: Array<{ url: string | null; label: string; active: boolean }>;
      to: number;
      total: number;
      per_page: number;
    };
  };
  stats: Stats;
  filters: { search?: string; status?: string; date?: string };
}

const STATUS_STYLES = {
  pending: {
    label: 'En attente',
    cls: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: AlertCircle,
  },
  in_progress: { label: 'En cours', cls: 'bg-blue-50 text-blue-700 border-blue-200', icon: Loader },
  completed: {
    label: 'Terminé',
    cls: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: CheckCircle2,
  },
  cancelled: { label: 'Annulé', cls: 'bg-red-50 text-red-700 border-red-200', icon: XCircle },
};

const dateOptions = [
  { value: 'all', label: 'Toutes les dates' },
  { value: 'today', label: "Aujourd'hui" },
  { value: 'week', label: 'Cette semaine' },
  { value: 'month', label: 'Ce mois' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.3 } }),
};

export default function Index({ requests, stats, filters }: Props) {
  const [searchQuery, setSearchQuery] = useState(filters.search || '');
  const [selectedStatus, setSelectedStatus] = useState(filters.status || 'all');
  const [selectedDate, setSelectedDate] = useState(filters.date || 'all');
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const debouncedSearch = useCallback(
    debounce((value: string) => updateFilters({ search: value }), 300),
    []
  );

  const updateFilters = (newFilters: Record<string, string>) => {
    router.get(
      route('service-requests.index'),
      { ...filters, ...newFilters },
      {
        preserveState: true,
        preserveScroll: true,
        only: ['requests'],
      }
    );
  };

  const handleSort = (field: string) => {
    const newDir = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortDirection(newDir);
    updateFilters({ sort: field, direction: newDir });
  };

  const handleDelete = (request: ServiceRequest) => {
    toast.warning(`Supprimer la demande de ${request.first_name} ${request.last_name} ?`, {
      action: {
        label: 'Supprimer',
        onClick: () =>
          router.delete(route('service-requests.destroy', request.id), {
            onSuccess: () => toast.success('Demande supprimée avec succès'),
            onError: () => toast.error('Une erreur est survenue'),
          }),
      },
      cancel: { label: 'Annuler', onClick: () => {} },
    });
  };

  const kpis = [
    {
      label: 'Total',
      value: stats?.total ?? requests.meta.total,
      icon: Inbox,
      bg: 'bg-primary/10',
      color: 'text-primary',
    },
    {
      label: 'En attente',
      value: stats?.pending ?? 0,
      icon: AlertCircle,
      bg: 'bg-amber-50 dark:bg-amber-950/30',
      color: 'text-amber-600',
    },
    {
      label: 'En cours',
      value: stats?.in_progress ?? 0,
      icon: Loader,
      bg: 'bg-blue-50 dark:bg-blue-950/30',
      color: 'text-blue-600',
    },
    {
      label: 'Terminées',
      value: stats?.completed ?? 0,
      icon: CheckCircle2,
      bg: 'bg-emerald-50 dark:bg-emerald-950/30',
      color: 'text-emerald-600',
    },
  ];

  return (
    <>
      <Head title="Demandes de service" />

      <div className="p-6 space-y-6">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/10 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="h-8 w-8 rounded-lg bg-primary/15 flex items-center justify-center">
                  <Inbox className="h-4 w-4 text-primary" />
                </div>
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                  CRM
                </span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight">Demandes de service</h1>
              <p className="text-muted-foreground text-sm mt-1">
                Gérez et suivez toutes les demandes entrantes
              </p>
            </div>
          </div>

          {/* KPIs */}
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {kpis.map((kpi, i) => (
              <motion.div
                key={kpi.label}
                custom={i}
                initial="hidden"
                animate="visible"
                variants={fadeUp}
              >
                <div className="rounded-xl bg-white/80 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-700/50 p-4 flex items-center gap-3">
                  <div
                    className={`${kpi.bg} h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0`}
                  >
                    <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
                  </div>
                  <div>
                    <p className="text-xl font-bold leading-none">{kpi.value}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{kpi.label}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par nom, email…"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    debouncedSearch(e.target.value);
                  }}
                  className="pl-9"
                />
              </div>
              <div className="flex gap-3">
                <Select
                  value={selectedStatus}
                  onValueChange={(v) => {
                    setSelectedStatus(v);
                    updateFilters({ status: v });
                  }}
                >
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="pending">En attente</SelectItem>
                    <SelectItem value="in_progress">En cours</SelectItem>
                    <SelectItem value="completed">Terminé</SelectItem>
                    <SelectItem value="cancelled">Annulé</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={selectedDate}
                  onValueChange={(v) => {
                    setSelectedDate(v);
                    updateFilters({ date: v });
                  }}
                >
                  <SelectTrigger className="w-full md:w-[160px]">
                    <SelectValue placeholder="Date" />
                  </SelectTrigger>
                  <SelectContent>
                    {dateOptions.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="overflow-hidden">
          <div className="relative overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/60 dark:bg-slate-800/40">
                  <TableHead>
                    <button
                      onClick={() => handleSort('created_at')}
                      className="inline-flex items-center gap-1 hover:text-primary font-medium"
                    >
                      Date
                      <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                  </TableHead>
                  <TableHead className="font-medium">Client</TableHead>
                  <TableHead className="font-medium">Code</TableHead>
                  <TableHead className="font-medium">Service</TableHead>
                  <TableHead className="font-medium">Contact</TableHead>
                  <TableHead className="font-medium">Statut</TableHead>
                  <TableHead className="w-[56px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Inbox className="h-8 w-8" />
                        <span>Aucune demande trouvée</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  requests.data.map((request) => {
                    const st = STATUS_STYLES[request.status];
                    return (
                      <TableRow
                        key={request.id}
                        className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
                      >
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-3.5 w-3.5" />
                            {request.created_at}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium text-sm">
                            {request.first_name} {request.last_name}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Link
                            href={route('service-requests.show', request.id)}
                            className="text-primary hover:underline text-sm font-mono"
                          >
                            #{request.code}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {request.service.name}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Mail className="h-3.5 w-3.5" />
                              {request.email}
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Phone className="h-3.5 w-3.5" />
                              {request.phone}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium ${st.cls}`}
                          >
                            <st.icon className="h-3 w-3" />
                            {st.label}
                          </span>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem asChild>
                                <Link
                                  href={route('service-requests.show', request.id)}
                                  className="cursor-pointer"
                                >
                                  <Eye className="h-4 w-4 mr-2" /> Voir
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDelete(request)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" /> Supprimer
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {requests.meta.last_page > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t bg-slate-50/40 dark:bg-slate-800/20">
              <div className="text-sm text-muted-foreground">
                {requests.meta.from}–{requests.meta.to} sur {requests.meta.total} demandes
              </div>
              <div className="flex items-center gap-1.5">
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
                  disabled={!requests.meta.links[requests.meta.links.length - 1].url}
                  onClick={() =>
                    router.get(requests.meta.links[requests.meta.links.length - 1].url || '')
                  }
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </>
  );
}
