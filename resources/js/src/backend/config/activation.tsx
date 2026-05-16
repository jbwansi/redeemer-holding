import React, { useEffect } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Home,
  BookOpen,
  MessagesSquare,
  Users,
  Calendar,
  Newspaper,
  Loader2,
  Settings2,
} from 'lucide-react';
import { toast } from 'sonner';
import { useSettings } from '@/hooks/use-settings';

const Activation = () => {
  const { settings, isLoading, isError } = useSettings();

  const { data, setData, post, processing } = useForm({
    enable_radio: settings?.enable_radio || true,
    enable_live_chat: settings?.enable_live_chat || true,
    enable_events: settings?.enable_events || true,
    enable_blog: settings?.enable_blog || true,
    enable_comments: settings?.enable_comments || true,
    enable_user_profiles: settings?.enable_user_profiles || true,
  });

  useEffect(() => {
    if (!settings) return;

    Object.keys(settings).forEach((key: any) => {
      if (key in data) {
        setData(key, settings[key] || data[key as keyof typeof data]);
      }
    });
  }, [settings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('settings.update'), {
      onSuccess: () => toast.success('Modules mis a jour avec succes'),
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-full flex-col items-center justify-center space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-base font-medium">Chargement des modules...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-full flex-col items-center justify-center space-y-4">
        <Settings2 className="h-10 w-10 text-red-500" />
        <p className="text-base font-medium">Impossible de charger les modules.</p>
      </div>
    );
  }

  const modules = [
    {
      title: 'Principal',
      description: 'Fonctionnalites essentielles de la plateforme.',
      icon: <Home className="h-5 w-5" />,
      features: [
        {
          name: 'Trainings',
          description: 'Module principal des trainings',
          enabled: data.enable_radio,
          key: 'enable_radio',
          icon: <BookOpen className="h-4 w-4" />,
        },
        {
          name: 'Services',
          description: 'Gestion des demandes de services',
          enabled: data.enable_live_chat,
          key: 'enable_live_chat',
          icon: <MessagesSquare className="h-4 w-4" />,
        },
      ],
    },
    {
      title: 'Communaute',
      description: 'Fonctions sociales et de contenu.',
      icon: <Users className="h-5 w-5" />,
      features: [
        {
          name: 'Evenements',
          description: 'Gestion des evenements',
          enabled: data.enable_events,
          key: 'enable_events',
          icon: <Calendar className="h-4 w-4" />,
        },
        {
          name: 'Blog',
          description: 'Articles et actualites',
          enabled: data.enable_blog,
          key: 'enable_blog',
          icon: <Newspaper className="h-4 w-4" />,
        },
        {
          name: 'Commentaires',
          description: 'Interaction avec les lecteurs',
          enabled: data.enable_comments,
          key: 'enable_comments',
          icon: <MessagesSquare className="h-4 w-4" />,
        },
        {
          name: 'Profils utilisateurs',
          description: 'Pages et intrainings de profil',
          enabled: data.enable_user_profiles,
          key: 'enable_user_profiles',
          icon: <Users className="h-4 w-4" />,
        },
      ],
    },
  ];

  return (
    <>
      <Head title="Activation des modules" />

      <div className="container mx-auto space-y-6 p-6">
        <div className="rounded-2xl border bg-gradient-to-r from-slate-50 to-white p-6">
          <h1 className="text-3xl font-semibold tracking-tight">Activation des modules</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Activez ou desactivez les sections du site selon votre strategie.
          </p>
        </div>

        <Alert>
          <Settings2 className="h-4 w-4" />
          <AlertTitle>Configuration globale</AlertTitle>
          <AlertDescription>
            Les changements sont appliques apres enregistrement et impactent immediatement le
            frontend.
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit} className="space-y-6">
          {modules.map((module) => (
            <Card key={module.title} className="shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-2">
                  {module.icon}
                  <CardTitle>{module.title}</CardTitle>
                </div>
                <CardDescription>{module.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {module.features.map((feature) => (
                  <div
                    key={feature.key}
                    className="flex items-center justify-between rounded-xl border p-4"
                  >
                    <div className="flex items-start gap-3">
                      {feature.icon}
                      <div>
                        <Label className="text-base font-semibold">{feature.name}</Label>
                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                      </div>
                    </div>
                    <Switch
                      checked={feature.enabled}
                      onCheckedChange={(checked) => setData(feature.key, checked)}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}

          <div className="flex justify-end gap-3">
            <Button type="submit" size="lg" disabled={processing}>
              {processing ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
};

export default Activation;
