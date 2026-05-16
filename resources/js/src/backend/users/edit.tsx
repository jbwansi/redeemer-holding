import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ChevronLeft, Loader2 } from 'lucide-react';

type UserStatus = '1' | '0';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  is_active: UserStatus;
}

interface Props {
  user: User;
}

const roleOptions = [
  { id: 'admin', name: 'Administrateur', value: 'admin' },
  { id: 'coach', name: 'Éditeur', value: 'coach' },
  { id: 'client', name: 'Utilisateur', value: 'client' },
];

const statusOptions = [
  { id: 'active', name: 'Actif', value: '1' as UserStatus },
  { id: 'inactive', name: 'Inactif', value: '0' as UserStatus },
] as const;

export default function Edit({ user }: Props) {
  const { data, setData, patch, processing, errors } = useForm({
    name: user.name,
    email: user.email,
    password: '',
    password_confirmation: '',
    role: user.role,
    is_active: String(user.is_active) as UserStatus,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    patch(route('users.update', user.id));
  };

  return (
    <>
      <Head title="Modifier l'utilisateur" />

      <div className="flex flex-col min-h-screen bg-background">
        <div className="border-b bg-gradient-to-r from-slate-50 to-white">
          <div className="mx-auto px-4 py-8 sm:px-6 lg:px-8">
            <div className="flex flex-1 items-center">
              <Button variant="ghost" size="icon" className="mr-4" asChild>
                <Link href={route('users.index')}>
                  <ChevronLeft className="h-6 w-6" />
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-semibold">Modifier l'utilisateur</h1>
                <p className="text-sm text-muted-foreground">
                  Modifier les intrainings de {user.name}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 py-8">
          <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Intrainings de l'utilisateur</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium mb-2">
                        Nom complet
                      </label>
                      <Input
                        id="name"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        placeholder="John Doe"
                        className={errors.name ? 'border-red-500' : ''}
                      />
                      {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium mb-2">
                        Adresse email
                      </label>
                      <Input
                        id="email"
                        type="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        placeholder="john@example.com"
                        className={errors.email ? 'border-red-500' : ''}
                      />
                      {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label htmlFor="password" className="block text-sm font-medium mb-2">
                          Nouveau mot de passe
                        </label>
                        <Input
                          id="password"
                          type="password"
                          value={data.password}
                          onChange={(e) => setData('password', e.target.value)}
                          className={errors.password ? 'border-red-500' : ''}
                        />
                        {errors.password && (
                          <p className="text-sm text-red-500 mt-1">{errors.password}</p>
                        )}
                      </div>

                      <div>
                        <label
                          htmlFor="password_confirmation"
                          className="block text-sm font-medium mb-2"
                        >
                          Confirmer le nouveau mot de passe
                        </label>
                        <Input
                          id="password_confirmation"
                          type="password"
                          value={data.password_confirmation}
                          onChange={(e) => setData('password_confirmation', e.target.value)}
                        />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      Laissez vide pour conserver le mot de passe actuel
                    </p>

                    <div className="grid gap-4 md:grid-cols-2 mt-3">
                      <div>
                        <label htmlFor="role" className="block text-sm font-medium mb-2">
                          Rôle
                        </label>
                        <Select value={data.role} onValueChange={(value) => setData('role', value)}>
                          <SelectTrigger className={errors.role ? 'border-red-500' : ''}>
                            <SelectValue placeholder="Sélectionnez un rôle" />
                          </SelectTrigger>
                          <SelectContent>
                            {roleOptions.map((option) => (
                              <SelectItem key={option.id} value={option.value}>
                                {option.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.role && <p className="text-sm text-red-500 mt-1">{errors.role}</p>}
                      </div>

                      <div>
                        <label htmlFor="status" className="block text-sm font-medium mb-2">
                          Statut
                        </label>
                        <Select
                          value={data.is_active}
                          onValueChange={(value: UserStatus) => setData('is_active', value)}
                        >
                          <SelectTrigger className={errors.is_active ? 'border-red-500' : ''}>
                            <SelectValue placeholder="Sélectionnez un statut" />
                          </SelectTrigger>
                          <SelectContent>
                            {statusOptions.map((option) => (
                              <SelectItem key={option.id} value={option.value}>
                                {option.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.is_active && (
                          <p className="text-sm text-red-500 mt-1">{errors.is_active}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-4">
                    <Button variant="outline" onClick={() => window.history.back()} type="button">
                      Annuler
                    </Button>
                    <Button type="submit" disabled={processing}>
                      {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Mettre à jour
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
