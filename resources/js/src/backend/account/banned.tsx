import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Ban,
  Mail,
  ExternalLink,
  AlertOctagon,
  ShieldOff,
  Info,
  ArrowLeft,
  AlertTriangle,
} from 'lucide-react';
import { ThemeProvider } from 'next-themes';

interface Props {
  email?: string;
  contactUrl?: string;
}

export default function Banned({ email = 'support@example.com', contactUrl = '#' }: Props) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <Head title="Compte banni" />

      <div className="min-h-screen bg-background">
        {/* Header avec bouton retour */}
        <div className="h-16 border-b flex items-center px-4">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Retour à l'accueil
          </Button>
        </div>

        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto space-y-8">
            {/* Icône et titre */}
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100/50 text-red-600">
                <Ban className="h-10 w-10" />
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-semibold">Compte suspendu</h1>
                <p className="text-muted-foreground">
                  Votre compte a été suspendu pour non-respect des conditions d'utilisation
                </p>
              </div>
            </div>

            {/* Cartes d'information */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Intrainings */}
              <Card className="border-red-200">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2 text-red-600">
                    <AlertOctagon className="h-5 w-5" />
                    Raisons possibles
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <div className="h-2 w-2 rounded-full bg-red-500 mt-2" />
                      <span className="text-sm">Non-respect des conditions d'utilisation</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="h-2 w-2 rounded-full bg-red-500 mt-2" />
                      <span className="text-sm">Comportement inapproprié ou abusif</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="h-2 w-2 rounded-full bg-red-500 mt-2" />
                      <span className="text-sm">Violation des règles de la communauté</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="h-2 w-2 rounded-full bg-red-500 mt-2" />
                      <span className="text-sm">Activités suspectes ou frauduleuses</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Info className="h-5 w-5" />
                      Procédure d'appel
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Si vous pensez que cette décision est une erreur, vous pouvez faire appel en
                      contactant notre équipe.
                    </p>
                    <div className="grid gap-3">
                      <Button
                        className="w-full justify-start"
                        onClick={() => (window.location.href = `mailto:${email}`)}
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Contacter le support
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => window.open(contactUrl, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Centre d'aide
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Message d'avertissement */}
                <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-red-900">Important</p>
                      <p className="text-sm text-red-800">
                        La création d'un nouveau compte pour contourner cette suspension est
                        strictement interdite et pourra entraîner une suspension permanente.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Note en bas de page */}
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-2 text-muted-foreground">
                <ShieldOff className="h-4 w-4" />
                <span className="text-sm">Besoin d'informations supplémentaires ?</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Notre équipe est disponible à l'adresse{' '}
                <a href={`mailto:${email}`} className="text-primary hover:underline font-medium">
                  {email}
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}

Banned.layout = (page: React.ReactNode) => page;
