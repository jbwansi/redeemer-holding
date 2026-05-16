import React, { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { toast } from 'sonner';
import { AlertTriangle, Loader, ShieldCheck, Users } from 'lucide-react';
import { route } from 'ziggy-js';

import SettingWrapper from './setting-wrapper';
import { useSettings } from '@/hooks/use-settings';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const TestUsersSettings = () => {
  const { settings, isLoading, isError } = useSettings();

  const { data, setData, post, processing } = useForm({
    test_allowed_emails: settings?.test_allowed_emails || '',
    test_users_password: settings?.test_users_password || '',
  });

  useEffect(() => {
    if (!settings) return;

    if (typeof settings.test_allowed_emails === 'string') {
      setData('test_allowed_emails', settings.test_allowed_emails);
    }

    if (typeof settings.test_users_password === 'string') {
      setData('test_users_password', settings.test_users_password);
    }
  }, [settings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    post(route('settings.update'), {
      onSuccess: () => {
        toast.success('Liste des testeurs mise à jour');
      },
    });
  };

  if (isLoading) {
    return (
      <SettingWrapper>
        <div className="flex flex-col items-center justify-center h-full space-y-4">
          <Loader className="h-12 w-12 text-primary animate-spin dark:text-white" />
          <p className="text-lg font-semibold">Chargement des paramètres...</p>
        </div>
      </SettingWrapper>
    );
  }

  if (isError) {
    return (
      <SettingWrapper>
        <div className="flex flex-col items-center justify-center h-full space-y-4">
          <AlertTriangle className="h-12 w-12 text-red-500" />
          <p className="text-lg font-semibold">Erreur lors du chargement des paramètres.</p>
        </div>
      </SettingWrapper>
    );
  }

  return (
    <SettingWrapper>
      <div className="space-y-6">
        <Alert>
          <ShieldCheck className="h-5 w-5" />
          <AlertTitle className="text-lg font-semibold">Accès environnement de test</AlertTitle>
          <AlertDescription>
            Ces emails seront autorisés à accéder à l'environnement <strong>staging/testing</strong>
            . Saisissez un email par ligne ou séparé par des virgules.
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-background rounded-lg shadow p-6">
            <div className="flex items-center gap-2 mb-4">
              <Users className="h-5 w-5" />
              <h2 className="text-lg font-semibold">Emails autorisés</h2>
            </div>

            <Label className="text-base font-semibold">TEST_ALLOWED_EMAILS</Label>
            <Textarea
              value={data.test_allowed_emails}
              onChange={(e) => setData('test_allowed_emails', e.target.value)}
              className="mt-2 min-h-40 rounded-xl bg-white/50 dark:bg-slate-900"
              placeholder={'testeur1@example.com\ntesteur2@example.com'}
            />
            <p className="mt-2 text-xs text-muted-foreground">
              Format accepté: un email par ligne, ou une liste séparée par virgules.
            </p>
          </div>

          <div className="bg-background rounded-lg shadow p-6">
            <Label className="text-base font-semibold">Mot de passe par défaut (optionnel)</Label>
            <Input
              type="text"
              value={data.test_users_password}
              onChange={(e) => setData('test_users_password', e.target.value)}
              className="mt-2 h-12 px-4 rounded-xl bg-white/50 dark:bg-slate-900"
              placeholder="Ex: Test1234!"
            />
            <p className="mt-2 text-xs text-muted-foreground">
              Utilisé par le seeder de testeurs si vous regénérez les comptes.
            </p>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={processing} className="px-6">
              {processing ? 'Sauvegarde...' : 'Sauvegarder'}
            </Button>
          </div>
        </form>
      </div>
    </SettingWrapper>
  );
};

export default TestUsersSettings;
