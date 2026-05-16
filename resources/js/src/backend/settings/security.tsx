import React, { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import SettingWrapper from './setting-wrapper';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, KeyRound, Lock, UserCog, History, Fingerprint, Loader } from 'lucide-react';
import { toast } from 'sonner';
import { useSettings } from '@/hooks/use-settings';

const Security = () => {
  const { settings, isLoading, isError } = useSettings();

  const { data, setData, post, processing } = useForm({
    password_expiration_days: settings?.password_expiration_days || '90',
    min_password_length: settings?.min_password_length || '8',
    require_special_char: settings?.require_special_char || true,
    require_number: settings?.require_number || true,
    require_uppercase: settings?.require_uppercase || true,
    max_login_attempts: settings?.max_login_attempts || '5',
    lockout_duration: settings?.lockout_duration || '30',
    enable_2fa: settings?.enable_2fa || false,
    force_2fa_for_admin: settings?.force_2fa_for_admin || false,
    session_timeout: settings?.session_timeout || '30',
    remember_me_duration: settings?.remember_me_duration || '30',
    enable_ip_logging: settings?.enable_ip_logging || true,
    allowed_ips: settings?.allowed_ips || '',
    enable_audit_log: settings?.enable_audit_log || true,
    audit_log_retention_days: settings?.audit_log_retention_days || '90',
    password_history_count: settings?.password_history_count || '3',
  });

  useEffect(() => {
    if (settings) {
      Object.keys(settings).forEach((key: any) => {
        if (key in data) {
          setData(key, settings[key] || data[key]);
        }
      });
    }
  }, [settings]);

  const handleSubmit = (e: any) => {
    e.preventDefault();
    post(route('settings.update'), {
      onSuccess: () => {
        toast.success('Paramètres de sécurité mis à jour avec succès');
      },
    });
  };

  if (isLoading) {
    return (
      <SettingWrapper>
        <div className="flex flex-col items-center justify-center h-full space-y-4">
          <Loader className="h-12 w-12 text-primary animate-spin dark:text-white" />
          <p className="text-lg font-semibold">Chargement des paramètres de sécurité...</p>
        </div>
      </SettingWrapper>
    );
  }

  if (isError) {
    return (
      <SettingWrapper>
        <div className="flex flex-col items-center justify-center h-full space-y-4">
          <Shield className="h-12 w-12 text-red-500 dark:text-red-500" />
          <p className="text-lg font-semibold">
            Une erreur s'est produite lors du chargement des paramètres.
          </p>
        </div>
      </SettingWrapper>
    );
  }

  return (
    <SettingWrapper>
      <div className="space-y-6">
        <Alert>
          <Shield className="h-5 w-5" />
          <AlertTitle className="text-lg font-semibold">Sécurité</AlertTitle>
          <AlertDescription></AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit} className="space-y-8">
          <Tabs defaultValue="password" className="space-y-6">
            <TabsList className="w-full justify-start overflow-x-auto whitespace-nowrap h-auto p-1">
              <TabsTrigger value="password">Mots de passe</TabsTrigger>
              <TabsTrigger value="auth">Authentification</TabsTrigger>
              <TabsTrigger value="sessions">Sessions</TabsTrigger>
              <TabsTrigger value="logs">Journalisation</TabsTrigger>
            </TabsList>

            <TabsContent value="password" className="space-y-6">
              {/* Politique de mot de passe */}
              <div className="bg-background rounded-lg shadow p-6">
                <div className="flex items-center gap-2 mb-6">
                  <KeyRound className="h-5 w-5" />
                  <h2 className="text-lg font-semibold">Politique de mot de passe</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <Label className="text-base font-semibold">Longueur minimale</Label>
                    <Input
                      type="number"
                      value={data.min_password_length}
                      onChange={(e) => setData('min_password_length', e.target.value)}
                      className="mt-2 h-12 px-4 rounded-xl bg-white/50 dark:bg-slate-900"
                    />
                  </div>

                  <div>
                    <Label className="text-base font-semibold">Expiration (jours)</Label>
                    <Input
                      type="number"
                      value={data.password_expiration_days}
                      onChange={(e) => setData('password_expiration_days', e.target.value)}
                      className="mt-2 h-12 px-4 rounded-xl bg-white/50 dark:bg-slate-900"
                    />
                  </div>

                  <div>
                    <Label className="text-base font-semibold">Historique des mots de passe</Label>
                    <Input
                      type="number"
                      value={data.password_history_count}
                      onChange={(e) => setData('password_history_count', e.target.value)}
                      className="mt-2 h-12 px-4 rounded-xl bg-white/50 dark:bg-slate-900"
                    />
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-semibold">Caractère spécial requis</Label>
                      <p className="text-sm text-muted-foreground">
                        Exiger au moins un caractère spécial
                      </p>
                    </div>
                    <Switch
                      checked={data.require_special_char}
                      onCheckedChange={(checked) => setData('require_special_char', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-semibold">Chiffre requis</Label>
                      <p className="text-sm text-muted-foreground">Exiger au moins un chiffre</p>
                    </div>
                    <Switch
                      checked={data.require_number}
                      onCheckedChange={(checked) => setData('require_number', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-semibold">Majuscule requise</Label>
                      <p className="text-sm text-muted-foreground">
                        Exiger au moins une lettre majuscule
                      </p>
                    </div>
                    <Switch
                      checked={data.require_uppercase}
                      onCheckedChange={(checked) => setData('require_uppercase', checked)}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="auth" className="space-y-6">
              {/* Authentification */}
              <div className="bg-background rounded-lg shadow p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Fingerprint className="h-5 w-5" />
                  <h2 className="text-lg font-semibold">Authentification</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <Label className="text-base font-semibold">Tentatives de connexion max</Label>
                    <Input
                      type="number"
                      value={data.max_login_attempts}
                      onChange={(e) => setData('max_login_attempts', e.target.value)}
                      className="mt-2 h-12 px-4 rounded-xl bg-white/50 dark:bg-slate-900"
                    />
                  </div>

                  <div>
                    <Label className="text-base font-semibold">
                      Durée de verrouillage (minutes)
                    </Label>
                    <Input
                      type="number"
                      value={data.lockout_duration}
                      onChange={(e) => setData('lockout_duration', e.target.value)}
                      className="mt-2 h-12 px-4 rounded-xl bg-white/50 dark:bg-slate-900"
                    />
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-semibold">
                        Double authentification (2FA)
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Activer l'authentification à deux facteurs
                      </p>
                    </div>
                    <Switch
                      checked={data.enable_2fa}
                      onCheckedChange={(checked) => setData('enable_2fa', checked)}
                    />
                  </div>

                  {data.enable_2fa && (
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base font-semibold">
                          2FA obligatoire pour les admins
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Forcer la 2FA pour les comptes administrateurs
                        </p>
                      </div>
                      <Switch
                        checked={data.force_2fa_for_admin}
                        onCheckedChange={(checked) => setData('force_2fa_for_admin', checked)}
                      />
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="sessions" className="space-y-6">
              {/* Sessions */}
              <div className="bg-background rounded-lg shadow p-6">
                <div className="flex items-center gap-2 mb-6">
                  <History className="h-5 w-5" />
                  <h2 className="text-lg font-semibold">Sessions</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <Label className="text-base font-semibold">Timeout de session (minutes)</Label>
                    <Input
                      type="number"
                      value={data.session_timeout}
                      onChange={(e) => setData('session_timeout', e.target.value)}
                      className="mt-2 h-12 px-4 rounded-xl bg-white/50 dark:bg-slate-900"
                    />
                  </div>

                  <div>
                    <Label className="text-base font-semibold">
                      Durée "Se souvenir de moi" (jours)
                    </Label>
                    <Input
                      type="number"
                      value={data.remember_me_duration}
                      onChange={(e) => setData('remember_me_duration', e.target.value)}
                      className="mt-2 h-12 px-4 rounded-xl bg-white/50 dark:bg-slate-900"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="logs" className="space-y-6">
              {/* Journalisation */}
              <div className="bg-background rounded-lg shadow p-6">
                <div className="flex items-center gap-2 mb-6">
                  <UserCog className="h-5 w-5" />
                  <h2 className="text-lg font-semibold">Journalisation</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <Label className="text-base font-semibold">Rétention des logs (jours)</Label>
                    <Input
                      type="number"
                      value={data.audit_log_retention_days}
                      onChange={(e) => setData('audit_log_retention_days', e.target.value)}
                      className="mt-2 h-12 px-4 rounded-xl bg-white/50 dark:bg-slate-900"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label className="text-base font-semibold">
                      IPs autorisées (séparées par des virgules)
                    </Label>
                    <Input
                      value={data.allowed_ips}
                      onChange={(e) => setData('allowed_ips', e.target.value)}
                      placeholder="127.0.0.1, 192.168.1.1"
                      className="mt-2 h-12 px-4 rounded-xl bg-white/50 dark:bg-slate-900"
                    />
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-semibold">Journal d'audit</Label>
                      <p className="text-sm text-muted-foreground">
                        Enregistrer les actions importantes des utilisateurs
                      </p>
                    </div>
                    <Switch
                      checked={data.enable_audit_log}
                      onCheckedChange={(checked) => setData('enable_audit_log', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-semibold">Journalisation des IPs</Label>
                      <p className="text-sm text-muted-foreground">
                        Enregistrer les IPs des utilisateurs
                      </p>
                    </div>
                    <Switch
                      checked={data.enable_ip_logging}
                      onCheckedChange={(checked) => setData('enable_ip_logging', checked)}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-4">
            <Button type="submit" size="lg" className="dark:text-white" disabled={processing}>
              {processing ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </Button>
          </div>
        </form>
      </div>
    </SettingWrapper>
  );
};

export default Security;
