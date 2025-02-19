import React, { useEffect } from 'react'
import { useForm } from '@inertiajs/react'
import SettingWrapper from './setting-wrapper'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
    Terminal,
    Server,
    Mail,
    Shield,
    Loader
} from 'lucide-react'
import { toast } from 'sonner'
import { useSettings } from '@/hooks/use-settings'

const Smtp = () => {
    const { settings, isLoading, isError } = useSettings();
    console.log(settings);

    const { data, setData, post, processing } = useForm<any>({
        sender_name: settings?.sender_name || '',
        sender_email: settings?.sender_email || '',
        host: settings?.host || '',
        port: settings?.port || '',
        encryption: settings?.encryption || '',
        username: settings?.username || '',
        password: settings?.password || '',
        auth_enabled: settings?.smtp?.auth_enabled || false,
    })

    // Formulaire de test
    const testForm = useForm({
        test_email: '',
    })

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
        e.preventDefault()
        post(route('settings.update'), {
            onSuccess: () => {
                toast.success('Configuration SMTP mise à jour avec succès')
            },
        })
    }

    const handleTestEmail = (e: any) => {
        e.preventDefault()
        testForm.post(route('settings.smtp.test'), {
            onSuccess: () => {
                toast.success('Email de test envoyé avec succès')
                testForm.reset('test_email')
            },
            onError: () => {
                toast.error("Échec de l'envoi de l'email de test")
            }
        })
    }

    if (isLoading) {
        return <SettingWrapper>
            <div className="flex flex-col items-center justify-center h-full space-y-4">
                <Loader className="h-12 w-12 text-primary animate-spin dark:text-white" />
                <p className="text-lg font-semibold">Chargement de la configuration SMTP...</p>
            </div>
        </SettingWrapper>
    }

    if (isError) {
        return <SettingWrapper>
            <div className="flex flex-col items-center justify-center h-full space-y-4">
                <Shield className="h-12 w-12 text-red-500 dark:text-red-500" />
                <p className="text-lg font-semibold">Une erreur s'est produite lors du chargement de la configuration SMTP.</p>
            </div>
        </SettingWrapper>
    }

    return (
        <SettingWrapper>
            <div className="space-y-6">
                {/* Alerte Info SMTP */}
                <Alert>
                    <Terminal className="h-4 w-4" />
                    <AlertTitle className="text-lg font-semibold">
                        Configuration SMTP
                    </AlertTitle>
                    <AlertDescription>
                        Configurez les paramètres SMTP pour permettre l'envoi d'emails depuis votre application.
                    </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Configuration SMTP */}
                    <div className="bg-background rounded-lg shadow p-6">
                        <div className="flex items-center gap-2 mb-6">
                            <Server className="h-5 w-5" />
                            <h2 className="text-lg font-semibold">Configuration du serveur</h2>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-base font-semibold">Nom de l'expéditeur</Label>
                                    <Input
                                        value={data.sender_name}
                                        onChange={e => setData('sender_name', e.target.value)}
                                        placeholder="John Doe"
                                        className="mt-2 h-12 px-4 rounded-xl bg-white/50 dark:bg-slate-900"
                                    />
                                </div>

                                <div>
                                    <Label className="text-base font-semibold">Email de l'expéditeur</Label>
                                    <Input
                                        type="email"
                                        value={data.sender_email}
                                        onChange={e => setData('sender_email', e.target.value)}
                                        placeholder="john@example.com"
                                        className="mt-2 h-12 px-4 rounded-xl bg-white/50 dark:bg-slate-900"
                                    />
                                </div>
                            </div>

                            <div>
                                <Label className="text-base font-semibold">Serveur SMTP</Label>
                                <Input
                                    value={data.host}
                                    onChange={e => setData('host', e.target.value)}
                                    placeholder="smtp.gmail.com"
                                    className="mt-2 h-12 px-4 rounded-xl bg-white/50 dark:bg-slate-900"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-base font-semibold">Port</Label>
                                    <Select
                                        value={data.port}
                                        onValueChange={(value) => setData('port', value)}
                                    >
                                        <SelectTrigger className="mt-2 h-12 px-4 rounded-xl bg-white/50 dark:bg-slate-900">
                                            <SelectValue placeholder="Sélectionner un port" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="587">587 (TLS)</SelectItem>
                                            <SelectItem value="465">465 (SSL)</SelectItem>
                                            <SelectItem value="2525">2525 (Test Mailtrap)</SelectItem>
                                            <SelectItem value="25">25 (Non sécurisé)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label className="text-base font-semibold">Méthode de chiffrement</Label>
                                    <Select
                                        value={data.encryption}
                                        onValueChange={(value) => setData('encryption', value)}
                                    >
                                        <SelectTrigger className="mt-2 h-12 px-4 rounded-xl bg-white/50 dark:bg-slate-900">
                                            <SelectValue placeholder="Sélectionner" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="tls">TLS</SelectItem>
                                            <SelectItem value="ssl">SSL</SelectItem>
                                            <SelectItem value="none">Aucun</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div>
                                <Label className="text-base font-semibold">Nom d'utilisateur SMTP</Label>
                                <Input
                                    value={data.username}
                                    onChange={e => setData('username', e.target.value)}
                                    placeholder="john@example.com"
                                    className="mt-2 h-12 px-4 rounded-xl bg-white/50 dark:bg-slate-900"
                                />
                            </div>

                            <div>
                                <Label className="text-base font-semibold">Mot de passe SMTP</Label>
                                <Input
                                    type="password"
                                    value={data.password}
                                    onChange={e => setData('password', e.target.value)}
                                    placeholder="••••••••"
                                    className="mt-2 h-12 px-4 rounded-xl bg-white/50 dark:bg-slate-900"
                                />
                            </div>

                            <Button
                                type="submit"
                                size="lg"
                                className="w-full dark:text-white"
                                disabled={processing}
                            >
                                {processing ? 'Enregistrement...' : 'Enregistrer la configuration'}
                            </Button>
                        </form>
                    </div>

                    {/* Test Email */}
                    <div className="bg-background rounded-lg shadow p-6">
                        <div className="flex items-center gap-2 mb-6">
                            <Mail className="h-5 w-5" />
                            <h2 className="text-lg font-semibold">Test de la configuration</h2>
                        </div>

                        <Alert className="mb-6">
                            <AlertDescription>
                                Envoyez un email de test pour vérifier votre configuration SMTP
                            </AlertDescription>
                        </Alert>

                        <form onSubmit={handleTestEmail} className="space-y-6">
                            <div>
                                <Label className="text-base font-semibold">Email de test</Label>
                                <Input
                                    type="email"
                                    required
                                    value={testForm.data.test_email}
                                    onChange={e => testForm.setData('test_email', e.target.value)}
                                    placeholder="votre@email.com"
                                    className="mt-2 h-12 px-4 rounded-xl bg-white/50 dark:bg-slate-900"
                                />
                            </div>

                            <Button
                                type="submit"
                                size="lg"
                                className="w-full dark:text-white"
                                disabled={testForm.processing}
                            >
                                {testForm.processing ? 'Envoi en cours...' : 'Envoyer un email de test'}
                            </Button>
                        </form>

                        <div className="mt-6 pt-6 border-t">
                            <h3 className="text-sm font-medium mb-4">Dernier test</h3>
                            <div className="text-sm text-muted-foreground">
                                {settings?.smtp?.last_test_at
                                    ? `Dernier test effectué le ${new Date(settings.smtp.last_test_at).toLocaleString()}`
                                    : 'Aucun test effectué'
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </SettingWrapper>
    )
}

export default Smtp
