import React, { useEffect } from 'react'
import { useForm } from '@inertiajs/react'
import SettingWrapper from './setting-wrapper'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
    Terminal,
    Building2,
    Mail,
    Globe,
    Shield,
    Database,
    Clock,
    Calendar,
    Loader
} from 'lucide-react'
import { toast } from 'sonner'
import { useSettings } from '@/hooks/use-settings'

const Settings = () => {
    const { settings, isLoading, isError, error } = useSettings();

    const { data, setData, post, processing, errors } = useForm<any>({
        app_name: settings?.app_name || '',
        app_description: settings?.app_description || '',
        company_name: settings?.company_name || '',
        company_address: settings?.company_address || '',
        company_phone: settings?.company_phone || '',
        contact_email: settings?.contact_email || '',
        support_email: settings?.support_email || '',
        default_timezone: settings?.default_timezone || '',
        default_language: settings?.default_language || '',
        maintenance_mode: settings?.maintenance_mode || false,
        maintenance_message: settings?.maintenance_message || '',
        maintenance_end_date: settings?.maintenance_end_date || '',
        enable_registration: settings?.enable_registration || true,
        enable_social_login: settings?.enable_social_login || false,
        enable_api: settings?.enable_api || false,
        session_lifetime: settings?.session_lifetime || '120',
        max_upload_size: settings?.max_upload_size || '10',
    })

    useEffect(() => {
        if (settings) {
            // Mise à jour des champs un par un pour éviter de perdre la réactivité
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
                toast.success('Paramètres mis à jour avec succès')
            },
        })
    }

    if (isLoading) {
        return <SettingWrapper>
            <div className="flex flex-col items-center justify-center h-full space-y-4 ">
                <Loader className='h-12 w-12 text-primary animate-spin dark:text-white' />
                <p className="text-lg font-semibold">Chargement des paramètres en cours...</p>
            </div>
        </SettingWrapper>
    }

    if (isError) {
        return <SettingWrapper>
            <div className="flex flex-col items-center justify-center h-full space-y-4 ">
                <Shield className='h-12 w-12 text-red-500 dark:text-red-500' />
                <p className="text-lg font-semibold">Une erreur s'est produite lors du chargement des paramètres.</p>
            </div>
        </SettingWrapper>
    }

    return (
        <SettingWrapper>
            <div className="space-y-6">
                {/* Mode Maintenance */}
                <Alert>
                    <Terminal className="h-4 w-4" />
                    <AlertTitle className="text-lg font-semibold flex items-center justify-between">
                        Mode maintenance
                        <Switch
                            checked={data.maintenance_mode}
                            onCheckedChange={(checked) => setData('maintenance_mode', checked)}
                        />
                    </AlertTitle>
                    <AlertDescription>
                        L'activation du mode maintenance désactive temporairement les systèmes sélectionnés à partir de la date et de l'heure que vous avez choisies.
                    </AlertDescription>
                </Alert>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Informations générales */}
                    <div className="bg-background rounded-lg shadow p-6">
                        <div className="flex items-center gap-2 mb-6">
                            <Building2 className="h-5 w-5" />
                            <h2 className="text-lg font-semibold">Informations générales</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div>
                                <Label className='text-base font-semibold'>Nom de l'application</Label>
                                <Input
                                    value={data.app_name}
                                    onChange={e => setData('app_name', e.target.value)}
                                    className="mt-2 h-12 px-4 rounded-xl bg-white/50 dark:bg-slate-900"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <Label className='text-base font-semibold'>Description de l'application</Label>
                                <Textarea
                                    value={data.app_description}
                                    onChange={e => setData('app_description', e.target.value)}
                                    className="mt-2 h-32 px-4 rounded-xl bg-white/50 dark:bg-slate-900"
                                />
                            </div>

                            <div>
                                <Label className='text-base font-semibold'>Nom de l'entreprise</Label>
                                <Input
                                    value={data.company_name}
                                    onChange={e => setData('company_name', e.target.value)}
                                    className="mt-2 h-12 px-4 rounded-xl bg-white/50 dark:bg-slate-900"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                                    <div>
                                        <Label className='text-base font-semibold'>Adresse de l'entreprise</Label>
                                        <Input
                                            value={data.company_address}
                                            onChange={e => setData('company_address', e.target.value)}
                                            className="mt-2 h-12 px-4 rounded-xl bg-white/50 dark:bg-slate-900"
                                        />
                                    </div>
                                    <div>
                                        <Label className='text-base font-semibold'>Téléphone de l'entreprise</Label>
                                        <Input
                                            value={data.company_phone}
                                            onChange={e => setData('company_phone', e.target.value)}
                                            className="mt-2 h-12 px-4 rounded-xl bg-white/50 dark:bg-slate-900"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Paramètres email */}
                    <div className="bg-background rounded-lg shadow p-6">
                        <div className="flex items-center gap-2 mb-6">
                            <Mail className="h-5 w-5" />
                            <h2 className="text-lg font-semibold">Paramètres email</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div>
                                <Label className='text-base font-semibold'>Email de contact</Label>
                                <Input
                                    type="email"
                                    value={data.contact_email}
                                    onChange={e => setData('contact_email', e.target.value)}
                                    className="mt-2 h-12 px-4 rounded-xl bg-white/50 dark:bg-slate-900"
                                />
                            </div>

                            <div>
                                <Label className='text-base font-semibold'>Email de support</Label>
                                <Input
                                    type="email"
                                    value={data.support_email}
                                    onChange={e => setData('support_email', e.target.value)}
                                    className="mt-2 h-12 px-4 rounded-xl bg-white/50 dark:bg-slate-900"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Paramètres régionaux */}
                    <div className="bg-background rounded-lg shadow p-6">
                        <div className="flex items-center gap-2 mb-6">
                            <Globe className="h-5 w-5" />
                            <h2 className="text-lg font-semibold">Paramètres régionaux</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div>
                                <Label className='text-base font-semibold'>Fuseau horaire par défaut</Label>
                                <Select
                                    value={data.default_timezone}
                                    onValueChange={(value) => setData('default_timezone', value)}
                                >
                                    <SelectTrigger className="mt-2 h-12 px-4 rounded-xl bg-white/50 dark:bg-slate-900">
                                        <SelectValue placeholder="Sélectionner un fuseau horaire" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Europe/Paris">Europe/Paris</SelectItem>
                                        <SelectItem value="UTC">UTC</SelectItem>
                                        <SelectItem value="Africa/Casablanca">Africa/Casablanca</SelectItem>
                                        <SelectItem value="Africa/Dakar">Africa/Dakar</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label className='text-base font-semibold'>Langue par défaut</Label>
                                <Select
                                    value={data.default_language}
                                    onValueChange={(value) => setData('default_language', value)}
                                >
                                    <SelectTrigger className="mt-2 h-12 px-4 rounded-xl bg-white/50 dark:bg-slate-900">
                                        <SelectValue placeholder="Sélectionner une langue" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="fr">Français</SelectItem>
                                        <SelectItem value="en">English</SelectItem>
                                        <SelectItem value="es">Español</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    {/* Paramètres système */}
                    <div className="bg-background rounded-lg shadow p-6">
                        <div className="flex items-center gap-2 mb-6">
                            <Database className="h-5 w-5" />
                            <h2 className="text-lg font-semibold">Paramètres système</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div>
                                <Label className='text-base font-semibold'>Durée de session (minutes)</Label>
                                <Input
                                    type="number"
                                    value={data.session_lifetime}
                                    onChange={e => setData('session_lifetime', e.target.value)}
                                    className="mt-2 h-12 px-4 rounded-xl bg-white/50 dark:bg-slate-900"
                                />
                            </div>

                            <div>
                                <Label className='text-base font-semibold'>Taille max. upload (MB)</Label>
                                <Input
                                    type="number"
                                    value={data.max_upload_size}
                                    onChange={e => setData('max_upload_size', e.target.value)}
                                    className="mt-2 h-12 px-4 rounded-xl bg-white/50 dark:bg-slate-900"
                                />
                            </div>
                        </div>

                        <div className="mt-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <Label className='text-base font-semibold'>Autoriser l'inscription</Label>
                                    <p className="text-sm text-muted-foreground">Permettre aux utilisateurs de créer un compte</p>
                                </div>
                                <Switch
                                    checked={data.enable_registration}
                                    onCheckedChange={(checked) => setData('enable_registration', checked)}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <Label className='text-base font-semibold'>Connexion sociale</Label>
                                    <p className="text-sm text-muted-foreground">Activer la connexion via réseaux sociaux</p>
                                </div>
                                <Switch
                                    checked={data.enable_social_login}
                                    onCheckedChange={(checked) => setData('enable_social_login', checked)}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <Label className='text-base font-semibold'>API</Label>
                                    <p className="text-sm text-muted-foreground">Activer l'accès à l'API</p>
                                </div>
                                <Switch
                                    checked={data.enable_api}
                                    onCheckedChange={(checked) => setData('enable_api', checked)}
                                />
                            </div>
                        </div>
                    </div>

                    {data.maintenance_mode && (
                        <div className="bg-background rounded-lg shadow p-6">
                            <div className="flex items-center gap-2 mb-6">
                                <Clock className="h-5 w-5" />
                                <h2 className="text-lg font-semibold">Configuration maintenance</h2>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <Label className='text-base font-semibold'>Message de maintenance</Label>
                                    <Textarea
                                        value={data.maintenance_message}
                                        onChange={e => setData('maintenance_message', e.target.value)}
                                        className="mt-2 h-12 px-4 rounded-xl bg-white/50 dark:bg-slate-900"
                                        placeholder="Ce site est actuellement en maintenance..."
                                    />
                                </div>

                                <div>
                                    <Label className='text-base font-semibold'>Date de fin prévue</Label>
                                    <Input
                                        type="datetime-local"
                                        value={data.maintenance_end_date}
                                        onChange={e => setData('maintenance_end_date', e.target.value)}
                                        className="mt-2 h-12 px-4 rounded-xl bg-white/50 dark:bg-slate-900"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end gap-4">
                        <Button
                            type="submit"
                            size="lg"
                            className='dark:text-white'
                            disabled={processing}
                        >
                            {processing ? 'Enregistrement...' : 'Enregistrer les modifications'}
                        </Button>
                    </div>
                </form>
            </div>
        </SettingWrapper>
    )
}

export default Settings
