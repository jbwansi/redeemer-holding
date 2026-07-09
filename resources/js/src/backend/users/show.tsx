import { Head, Link, router, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ChevronLeft,
  User,
  Mail,
  Shield,
  Calendar,
  Clock,
  Edit,
  CheckCircle2,
  XCircle,
  GraduationCap,
} from 'lucide-react';
import { toast } from 'sonner';
import { route } from 'ziggy-js';

interface TrainingOption {
  id: number;
  title: string;
  slug: string;
  start_date: string;
  end_date: string;
  price: number;
}

interface AssignedTraining {
  id: number;
  training_id: number;
  training_title: string;
  training_slug: string;
  start_date: string;
  end_date: string;
  price: number;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'registered' | 'confirmed';
  assigned_at: string;
  reference: string;
  assigned_by_admin_id: number | null;
  assigned_by_admin_name: string | null;
  cancelled_at: string | null;
  cancelled_by_admin_id: number | null;
  cancelled_by_admin_name: string | null;
}

interface Props {
  user: {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'coach' | 'client';
    is_active: 0 | 1;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    last_login_at: string | null;
    last_login_ip: string | null;
  };
  availableTrainings: TrainingOption[];
  assignedTrainings: AssignedTraining[];
}

export default function Show({ user, availableTrainings, assignedTrainings }: Props) {
  const { data, setData, post, processing, errors, reset } = useForm({
    training_id: '',
  });

  const activeAssignedIds = new Set(
    assignedTrainings
      .filter((assignment) => assignment.status !== 'cancelled')
      .map((a) => a.training_id)
  );

  const assignableTrainings = availableTrainings.filter(
    (training) => !activeAssignedIds.has(training.id)
  );

  const getRoleBadge = (role: Props['user']['role']) => {
    const styles = {
      admin: 'bg-primary/10 text-primary hover:bg-primary/20',
      coach: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
      client: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    };

    const labels = {
      admin: 'Administrateur',
      coach: 'Éditeur',
      client: 'Utilisateur',
    };

    return <Badge className={styles[role]}>{labels[role]}</Badge>;
  };

  const getUserStatusBadge = (status: Props['user']['is_active']) => {
    return status === 1 ? (
      <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200">Actif</Badge>
    ) : (
      <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200">Inactif</Badge>
    );
  };

  const getTrainingStatusBadge = (status: AssignedTraining['status']) => {
    const styleByStatus = {
      completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      in_progress: 'bg-blue-100 text-blue-700 border-blue-200',
      pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      cancelled: 'bg-red-100 text-red-700 border-red-200',
      registered: 'bg-indigo-100 text-indigo-700 border-indigo-200',
      confirmed: 'bg-cyan-100 text-cyan-700 border-cyan-200',
    };

    const labelByStatus = {
      completed: 'Accès accordé',
      in_progress: 'En cours',
      pending: 'En attente',
      cancelled: 'Annulée',
      registered: 'Inscrit',
      confirmed: 'Confirmé',
    };

    return (
      <Badge variant="outline" className={styleByStatus[status]}>
        {labelByStatus[status]}
      </Badge>
    );
  };

  const handleAssignTraining = (e: { preventDefault: () => void }) => {
    e.preventDefault();

    if (!data.training_id) {
      toast.error('Veuillez sélectionner une formation.');
      return;
    }

    post(route('users.trainings.assign', user.id), {
      preserveScroll: true,
      onSuccess: () => {
        toast.success('Formation attribuée avec succès.');
        reset('training_id');
      },
      onError: () => {
        toast.error("L'attribution de la formation a échoué.");
      },
    });
  };

  const handleUnassignTraining = (assignment: AssignedTraining) => {
    router.post(
      route('users.trainings.unassign', {
        user: user.id,
        participant: assignment.id,
      }),
      {},
      {
        preserveScroll: true,
        onSuccess: () => {
          toast.success('Attribution révoquée avec succès.');
        },
        onError: () => {
          toast.error('La révocation de cette attribution a échoué.');
        },
      }
    );
  };

  return (
    <>
      <Head title={`Utilisateur - ${user.name}`} />

      <div className="flex flex-col min-h-screen bg-background">
        <div className="border-b bg-gradient-to-r from-slate-50 to-white">
          <div className="mx-auto px-4 py-8 sm:px-6 lg:px-8">
            <div className="flex flex-1 items-center justify-between">
              <div className="flex items-center">
                <Button variant="ghost" size="icon" className="mr-4" asChild>
                  <Link href={route('users.index')}>
                    <ChevronLeft className="h-6 w-6" />
                  </Link>
                </Button>
                <div>
                  <h1 className="text-2xl font-semibold flex items-center gap-3">
                    {user.name}
                    {getRoleBadge(user.role)}
                  </h1>
                  <p className="text-sm text-muted-foreground mt-1">
                    Membre depuis le{' '}
                    {new Date(user.created_at).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {getUserStatusBadge(user.is_active)}
                <Button asChild className="h-11">
                  <Link href={route('users.edit', user.id)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Modifier
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 py-8">
          <div className="mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 max-w-6xl mx-auto">
              {/* Intrainings générales */}
              <Card>
                <CardHeader>
                  <CardTitle>Intrainings personnelles</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="border-b pb-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Nom complet</p>
                          <p className="mt-1 flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            {user.name}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="border-b pb-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Adresse email</p>
                          <p className="mt-1 flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            {user.email}
                          </p>
                        </div>
                        <div>
                          {user.email_verified_at ? (
                            <Badge
                              variant="outline"
                              className="bg-emerald-50 text-emerald-700 border-emerald-200"
                            >
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Vérifié
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="bg-yellow-50 text-yellow-700 border-yellow-200"
                            >
                              <XCircle className="h-3 w-3 mr-1" />
                              Non vérifié
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="border-b pb-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">
                            Type de compte
                          </p>
                          <p className="mt-1 flex items-center gap-2">
                            <Shield className="h-4 w-4 text-muted-foreground" />
                            {user.role === 'admin'
                              ? 'Administrateur'
                              : user.role === 'coach'
                                ? 'Éditeur'
                                : 'Utilisateur'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Dates et historique */}
              <Card>
                <CardHeader>
                  <CardTitle>Historique du compte</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="border-b pb-4">
                      <p className="text-sm font-medium text-muted-foreground">
                        Création du compte
                      </p>
                      <p className="mt-1 flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {new Date(user.created_at).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>

                    {user.email_verified_at && (
                      <div className="border-b pb-4">
                        <p className="text-sm font-medium text-muted-foreground">
                          Vérification de l'email
                        </p>
                        <p className="mt-1 flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                          {new Date(user.email_verified_at).toLocaleDateString('fr-FR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    )}

                    <div className="border-b pb-4">
                      <p className="text-sm font-medium text-muted-foreground">
                        Dernière modification
                      </p>
                      <p className="mt-1 flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        {new Date(user.updated_at).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Dernière connexion
                      </p>
                      <p className="mt-1 text-sm">
                        {user.last_login_at
                          ? new Date(user.last_login_at).toLocaleDateString('fr-FR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : 'Aucune connexion enregistrée'}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        IP: {user.last_login_ip || 'Non disponible'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 max-w-6xl mx-auto mt-6">
              <Card id="assign-training">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    Attribuer une formation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAssignTraining} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="training_id">Formation</Label>
                      <Select
                        value={data.training_id}
                        onValueChange={(value) => setData('training_id', value)}
                      >
                        <SelectTrigger id="training_id">
                          <SelectValue placeholder="Sélectionnez une formation" />
                        </SelectTrigger>
                        <SelectContent>
                          {assignableTrainings.map((training) => (
                            <SelectItem key={training.id} value={String(training.id)}>
                              {training.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.training_id && (
                        <p className="text-sm text-red-600">{errors.training_id}</p>
                      )}
                    </div>

                    <Button type="submit" disabled={processing || assignableTrainings.length === 0}>
                      Attribuer la formation
                    </Button>

                    {assignableTrainings.length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        Toutes les formations publiées sont déjà attribuées à cet utilisateur.
                      </p>
                    )}
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Formations attribuées</CardTitle>
                </CardHeader>
                <CardContent>
                  {assignedTrainings.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Aucune formation attribuée pour le moment.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {assignedTrainings.map((assignment) => (
                        <div
                          key={assignment.id}
                          className="rounded-lg border border-slate-200 p-3 space-y-2"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <p className="font-medium leading-tight">{assignment.training_title}</p>
                            {getTrainingStatusBadge(assignment.status)}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Réf: {assignment.reference} • Attribuée le{' '}
                            {new Date(assignment.assigned_at).toLocaleDateString('fr-FR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Attribuée par: {assignment.assigned_by_admin_name || 'Système'}
                          </p>
                          {assignment.cancelled_at && (
                            <p className="text-xs text-muted-foreground">
                              Révoquée le{' '}
                              {new Date(assignment.cancelled_at).toLocaleDateString('fr-FR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}{' '}
                              par {assignment.cancelled_by_admin_name || 'Système'}
                            </p>
                          )}

                          {assignment.status !== 'cancelled' && (
                            <Button
                              type="button"
                              variant="outline"
                              className="h-8"
                              onClick={() => handleUnassignTraining(assignment)}
                            >
                              Révoquer l'accès
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
