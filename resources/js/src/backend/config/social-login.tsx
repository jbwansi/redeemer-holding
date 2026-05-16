import React, { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Github, Facebook, Twitter, Linkedin, Apple, Globe, Loader } from 'lucide-react';
import { toast } from 'sonner';
import { route } from 'ziggy-js';
import { useSettings } from '@/hooks/use-settings';

const SocialLoginConfig = () => {
  const { settings, isLoading, isError } = useSettings();

  const { data, setData, post, processing } = useForm({
    // Google
    google_enabled: settings?.google_enabled || false,
    google_client_id: settings?.google_client_id || '',
    google_client_secret: settings?.google_client_secret || '',
    google_redirect_url: settings?.google_redirect_url || '',

    // GitHub
    github_enabled: settings?.github_enabled || false,
    github_client_id: settings?.github_client_id || '',
    github_client_secret: settings?.github_client_secret || '',
    github_redirect_url: settings?.github_redirect_url || '',

    // Facebook
    facebook_enabled: settings?.facebook_enabled || false,
    facebook_client_id: settings?.facebook_client_id || '',
    facebook_client_secret: settings?.facebook_client_secret || '',
    facebook_redirect_url: settings?.facebook_redirect_url || '',

    // Twitter
    twitter_enabled: settings?.twitter_enabled || false,
    twitter_client_id: settings?.twitter_client_id || '',
    twitter_client_secret: settings?.twitter_client_secret || '',
    twitter_redirect_url: settings?.twitter_redirect_url || '',

    // LinkedIn
    linkedin_enabled: settings?.linkedin_enabled || false,
    linkedin_client_id: settings?.linkedin_client_id || '',
    linkedin_client_secret: settings?.linkedin_client_secret || '',
    linkedin_redirect_url: settings?.linkedin_redirect_url || '',

    // Apple
    apple_enabled: settings?.apple_enabled || false,
    apple_client_id: settings?.apple_client_id || '',
    apple_client_secret: settings?.apple_client_secret || '',
    apple_redirect_url: settings?.apple_redirect_url || '',
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
        toast.success('Paramètres de connexion sociale mis à jour avec succès');
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <Loader className="h-12 w-12 text-primary animate-spin dark:text-white" />
        <p className="text-lg font-semibold">Chargement des paramètres de connexion sociale...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <Globe className="h-12 w-12 text-red-500 dark:text-red-500" />
        <p className="text-lg font-semibold">
          Une erreur s'est produite lors du chargement des paramètres.
        </p>
      </div>
    );
  }

  const providers = [
    {
      name: 'Google',
      icon: <Mail className="h-5 w-5" />,
      enabled: data.google_enabled,
      clientId: data.google_client_id,
      clientSecret: data.google_client_secret,
      redirectUrl: data.google_redirect_url,
      prefix: 'google',
    },
    {
      name: 'GitHub',
      icon: <Github className="h-5 w-5" />,
      enabled: data.github_enabled,
      clientId: data.github_client_id,
      clientSecret: data.github_client_secret,
      redirectUrl: data.github_redirect_url,
      prefix: 'github',
    },
    {
      name: 'Facebook',
      icon: <Facebook className="h-5 w-5" />,
      enabled: data.facebook_enabled,
      clientId: data.facebook_client_id,
      clientSecret: data.facebook_client_secret,
      redirectUrl: data.facebook_redirect_url,
      prefix: 'facebook',
    },
    {
      name: 'Twitter',
      icon: <Twitter className="h-5 w-5" />,
      enabled: data.twitter_enabled,
      clientId: data.twitter_client_id,
      clientSecret: data.twitter_client_secret,
      redirectUrl: data.twitter_redirect_url,
      prefix: 'twitter',
    },
    {
      name: 'LinkedIn',
      icon: <Linkedin className="h-5 w-5" />,
      enabled: data.linkedin_enabled,
      clientId: data.linkedin_client_id,
      clientSecret: data.linkedin_client_secret,
      redirectUrl: data.linkedin_redirect_url,
      prefix: 'linkedin',
    },
    {
      name: 'Apple',
      icon: <Apple className="h-5 w-5" />,
      enabled: data.apple_enabled,
      clientId: data.apple_client_id,
      clientSecret: data.apple_client_secret,
      redirectUrl: data.apple_redirect_url,
      prefix: 'apple',
    },
  ];

  return (
    <div className="container mx-auto p-6">
      <div className="space-y-6">
        <Alert>
          <Globe className="h-4 w-4" />
          <AlertTitle className="text-lg font-semibold">
            Configuration des connexions sociales
          </AlertTitle>
          <AlertDescription>
            Configurez les différents fournisseurs d'authentification sociale pour permettre aux
            utilisateurs de se connecter avec leurs comptes existants.
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit} className="space-y-8">
          <Tabs defaultValue="google" className="space-y-4">
            <TabsList className="grid grid-cols-3 lg:grid-cols-6 h-auto gap-4">
              {providers.map((provider) => (
                <TabsTrigger
                  key={provider.prefix}
                  value={provider.prefix}
                  className="flex gap-2 items-center"
                >
                  {provider.icon}
                  <span>{provider.name}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {providers.map((provider) => (
              <TabsContent key={provider.prefix} value={provider.prefix}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {provider.icon}
                      <span>{provider.name}</span>
                    </CardTitle>
                    <CardDescription>Configuration du fournisseur {provider.name}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base font-semibold">Activer {provider.name}</Label>
                        <p className="text-sm text-muted-foreground">
                          Permettre aux utilisateurs de se connecter avec {provider.name}
                        </p>
                      </div>
                      <Switch
                        checked={provider.enabled}
                        onCheckedChange={(checked) =>
                          setData(`${provider.prefix}_enabled`, checked)
                        }
                      />
                    </div>

                    {provider.enabled && (
                      <div className="grid grid-cols-1 gap-6">
                        <div>
                          <Label className="text-base font-semibold">Client ID</Label>
                          <Input
                            value={provider.clientId}
                            onChange={(e) =>
                              setData(`${provider.prefix}_client_id`, e.target.value)
                            }
                            className="mt-2 h-12 px-4 rounded-xl bg-white/50 dark:bg-slate-900"
                          />
                        </div>

                        <div>
                          <Label className="text-base font-semibold">Client Secret</Label>
                          <Input
                            type="password"
                            value={provider.clientSecret}
                            onChange={(e) =>
                              setData(`${provider.prefix}_client_secret`, e.target.value)
                            }
                            className="mt-2 h-12 px-4 rounded-xl bg-white/50 dark:bg-slate-900"
                          />
                        </div>

                        <div>
                          <Label className="text-base font-semibold">URL de redirection</Label>
                          <div className="flex gap-2">
                            <Input
                              value={provider.redirectUrl}
                              onChange={(e) =>
                                setData(`${provider.prefix}_redirect_url`, e.target.value)
                              }
                              className="mt-2 h-12 px-4 rounded-xl bg-white/50 dark:bg-slate-900"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="mt-2"
                              onClick={() => {
                                navigator.clipboard.writeText(provider.redirectUrl);
                                toast.success('URL copiée');
                              }}
                            >
                              <Globe className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>

          <div className="flex justify-end gap-4">
            <Button type="submit" size="lg" disabled={processing}>
              {processing ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SocialLoginConfig;
