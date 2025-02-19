import { Head } from '@inertiajs/react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    AlertCircle,
    Mail,
    ExternalLink,
    Clock,
    ShieldAlert,
    Info,
    ArrowLeft
} from 'lucide-react';
import { ThemeProvider } from "next-themes"

interface Props {
    email?: string;
    contactUrl?: string;
}

export default function Inactive({ email = 'support@example.com', contactUrl = '#' }: Props) {
    return (
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <Head title="Compte inactif" />

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
                            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-yellow-100/50 text-yellow-600">
                                <ShieldAlert className="h-10 w-10" />
                            </div>
                            <div className="space-y-2">
                                <h1 className="text-3xl font-semibold">Compte temporairement inactif</h1>
                                <p className="text-muted-foreground">
                                    Votre compte a été désactivé et nécessite une vérification
                                </p>
                            </div>
                        </div>

                        {/* Cartes d'information */}
                        <div className="grid gap-6 md:grid-cols-2">
                            {/* Raisons */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Info className="h-5 w-5" />
                                        Raisons possibles
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-3">
                                        {[
                                            "Longue période d'inactivité",
                                            'Demande de votre part',
                                            'Vérification en attente',
                                            'Mise à jour requise'
                                        ].map((reason, index) => (
                                            <li key={index} className="flex items-start gap-3">
                                                <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                                                <span className="text-sm">{reason}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>

                            {/* Actions */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Clock className="h-5 w-5" />
                                        Réactiver votre compte
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <p className="text-sm text-muted-foreground">
                                        Contactez notre équipe pour réactiver votre compte ou visitez notre centre d'aide.
                                    </p>
                                    <div className="grid gap-3">
                                        <Button className="w-full justify-start" onClick={() => window.location.href = `mailto:${email}`}>
                                            <Mail className="h-4 w-4 mr-2" />
                                            Contacter le support
                                        </Button>
                                        <Button variant="outline" className="w-full justify-start" onClick={() => window.open(contactUrl, '_blank')}>
                                            <ExternalLink className="h-4 w-4 mr-2" />
                                            Centre d'aide
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Note en bas de page */}
                        <div className="text-center space-y-2">
                            <div className="inline-flex items-center gap-2 text-muted-foreground">
                                <AlertCircle className="h-4 w-4" />
                                <span className="text-sm">Besoin d'aide supplémentaire ?</span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Contactez notre support à l'adresse{' '}
                                <a
                                    href={`mailto:${email}`}
                                    className="text-primary hover:underline font-medium"
                                >
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

Inactive.layout = (page: React.ReactNode) => page;
