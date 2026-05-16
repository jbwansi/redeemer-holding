import React from 'react';
import { router, useForm } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Trash2,
  RefreshCw,
  Database,
  Route,
  Package,
  Link as LinkIcon,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

interface Action {
  name: string;
  label: string;
  icon: React.ReactElement;
  command: string;
}

interface MaintenanceCard {
  title: string;
  description: string;
  actions: Action[];
}

const SystemConfig: React.FC = () => {
  const { post, processing, setData } = useForm({
    command: '',
  });

  const executeCommand = (commandName: string) => {
    let donnees = {
      command: commandName,
    };

    router.post(route('system.execute'), donnees, {
      onSuccess: () => {
        toast.success('Commande exécutée avec succès');
      },
      onError: () => {
        toast.error("Erreur lors de l'exécution de la commande");
      },
      preserveScroll: true,
    });
  };

  const maintenanceCards: MaintenanceCard[] = [
    {
      title: 'Cache',
      description: "Gestion du cache de l'application",
      actions: [
        {
          name: 'cache:clear',
          label: 'Vider le cache',
          icon: <Trash2 className="h-4 w-4" />,
          command: 'cache:clear',
        },
        {
          name: 'config:clear',
          label: 'Vider le cache de configuration',
          icon: <RefreshCw className="h-4 w-4" />,
          command: 'config:clear',
        },
        {
          name: 'view:clear',
          label: 'Vider le cache des vues',
          icon: <Trash2 className="h-4 w-4" />,
          command: 'view:clear',
        },
      ],
    },
    {
      title: 'Routes & Vues',
      description: 'Gestion des routes et des vues',
      actions: [
        {
          name: 'route:clear',
          label: 'Vider le cache des routes',
          icon: <Route className="h-4 w-4" />,
          command: 'route:clear',
        },
        {
          name: 'route:cache',
          label: 'Mettre en cache les routes',
          icon: <Route className="h-4 w-4" />,
          command: 'route:cache',
        },
        {
          name: 'view:cache',
          label: 'Compiler les vues Blade',
          icon: <RefreshCw className="h-4 w-4" />,
          command: 'view:cache',
        },
      ],
    },
    {
      title: 'Optimisation',
      description: 'Optimisation des performances',
      actions: [
        {
          name: 'optimize',
          label: "Optimiser l'application",
          icon: <Package className="h-4 w-4" />,
          command: 'optimize',
        },
        {
          name: 'optimize:clear',
          label: "Effacer l'optimisation",
          icon: <RefreshCw className="h-4 w-4" />,
          command: 'optimize:clear',
        },
        {
          name: 'clear-compiled',
          label: 'Compiler les classes',
          icon: <Package className="h-4 w-4" />,
          command: 'clear-compiled',
        },
      ],
    },
    {
      title: 'Base de données',
      description: 'Maintenance de la base de données',
      actions: [
        {
          name: 'migrate',
          label: 'Lancer les migrations',
          icon: <Database className="h-4 w-4" />,
          command: 'migrate',
        },
        {
          name: 'db:seed',
          label: 'Lancer les seeders',
          icon: <Database className="h-4 w-4" />,
          command: 'db:seed',
        },
      ],
    },
    {
      title: 'Storage & Liens',
      description: 'Gestion du stockage et des liens symboliques',
      actions: [
        {
          name: 'storage:link',
          label: 'Créer les liens symboliques',
          icon: <LinkIcon className="h-4 w-4" />,
          command: 'storage:link',
        },
      ],
    },
  ];

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Configuration système</h1>
        <p className="text-gray-500 mt-2">Outils de maintenance et d'optimisation de Pop Radio</p>
      </div>

      <Alert className="mb-6">
        <AlertDescription>
          Ces commandes peuvent affecter les performances de l'application pendant leur exécution.
          Il est recommandé de les exécuter pendant les périodes de faible activité.
        </AlertDescription>
      </Alert>

      <Alert className="mb-6 bg-yellow-100 border-yellow-400 text-yellow-700">
        <AlertDescription>
          Attention, vous devez être un administrateur pour exécuter ces commandes.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {maintenanceCards.map((card) => (
          <Card key={card.title}>
            <CardHeader>
              <CardTitle>{card.title}</CardTitle>
              <CardDescription>{card.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {card.actions.map((action) => (
                <div key={action.name} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    {action.icon}
                    <span className="text-sm">{action.label}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => executeCommand(action.command)}
                    disabled={processing}
                  >
                    {processing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Exécution...
                      </>
                    ) : (
                      'Exécuter'
                    )}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SystemConfig;
