import React, { useEffect } from 'react'
import { useForm } from '@inertiajs/react'
import SettingWrapper from './setting-wrapper'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
    Radio,
    KeyRound,
    Wifi,
    Settings2,
    Loader
} from 'lucide-react'
import { toast } from 'sonner'
import { useSettings } from '@/hooks/use-settings'

const Pusher = () => {
    const { settings, isLoading, isError } = useSettings()

    const { data, setData, post, processing } = useForm({
        pusher_app_id: settings?.pusher_app_id || '',
        pusher_app_key: settings?.pusher_app_key || '',
        pusher_app_secret: settings?.pusher_app_secret || '',
        pusher_app_cluster: settings?.pusher_app_cluster || 'eu',
        pusher_app_host: settings?.pusher_app_host || '',
        pusher_app_port: settings?.pusher_app_port || '443',
        pusher_scheme: settings?.pusher_scheme || 'https',
        pusher_enabled: settings?.pusher_enabled || false,
        force_tls: settings?.force_tls || true,
        debug_mode: settings?.debug_mode || false,
        encrypted: settings?.encrypted || true,
    })

    useEffect(() => {
        if (settings) {
            Object.keys(settings).forEach((key: any) => {
                if (key in data) {
                    setData(key, settings[key] || data[key])
                }
            })
        }
    }, [settings])

    const handleSubmit = (e: any) => {
        e.preventDefault()
        post(route('settings.update'), {
            onSuccess: () => {
                toast.success('Paramètres Pusher mis à jour avec succès')
            },
        })
    }

    if (isLoading) {
        return <SettingWrapper>
            <div className="flex flex-col items-center justify-center h-full space-y-4">
                <Loader className="h-12 w-12 text-primary animate-spin dark:text-white" />
                <p className="text-lg font-semibold">Chargement des paramètres Pusher...</p>
            </div>
        </SettingWrapper>
    }

    if (isError) {
        return <SettingWrapper>
            <div className="flex flex-col items-center justify-center h-full space-y-4">
                <Radio className="h-12 w-12 text-red-500 dark:text-red-500" />
                <p className="text-lg font-semibold">Une erreur s'est produite lors du chargement des paramètres.</p>
            </div>
        </SettingWrapper>
    }

    return (
        <SettingWrapper>
            <div className="space-y-6">
                <Alert>
                    <Radio className="h-4 w-4" />
                    <AlertTitle className="text-lg font-semibold">Configuration Pusher</AlertTitle>
                    <AlertDescription>
                        Configurez les paramètres de votre application Pusher pour activer les fonctionnalités temps réel.
                    </AlertDescription>
                </Alert>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Configuration générale */}
                    <div className="bg-background rounded-lg shadow p-6">
                        <div className="flex items-center gap-2 mb-6">
                            <Settings2 className="h-5 w-5" />
                            <h2 className="text-lg font-semibold">Configuration générale</h2>
                        </div>

                        <div className="mt-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <Label className="text-base font-semibold">Activer Pusher</Label>
                                    <p className="text-sm text-muted-foreground">Activer/désactiver l'intégration Pusher</p>
                                </div>
                                <Switch
                                    checked={data.pusher_enabled}
                                    onCheckedChange={(checked) => setData('pusher_enabled', checked)}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <Label className="text-base font-semibold">Mode debug</Label>
                                    <p className="text-sm text-muted-foreground">Activer le mode debug pour le développement</p>
                                </div>
                                <Switch
                                    checked={data.debug_mode}
                                    onCheckedChange={(checked) => setData('debug_mode', checked)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Identifiants Pusher */}
                    <div className="bg-background rounded-lg shadow p-6">
                        <div className="flex items-center gap-2 mb-6">
                            <KeyRound className="h-5 w-5" />
                            <h2 className="text-lg font-semibold">Identifiants Pusher</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div>
                                <Label className="text-base font-semibold">App ID</Label>
                                <Input
                                    value={data.pusher_app_id}
                                    onChange={e => setData('pusher_app_id', e.target.value)}
                                    className="mt-2 h-12 px-4 rounded-xl bg-white/50 dark:bg-slate-900"
                                />
                            </div>

                            <div>
                                <Label className="text-base font-semibold">App Key</Label>
                                <Input
                                    value={data.pusher_app_key}
                                    onChange={e => setData('pusher_app_key', e.target.value)}
                                    className="mt-2 h-12 px-4 rounded-xl bg-white/50 dark:bg-slate-900"
                                />
                            </div>

                            <div>
                                <Label className="text-base font-semibold">App Secret</Label>
                                <Input
                                    type="password"
                                    value={data.pusher_app_secret}
                                    onChange={e => setData('pusher_app_secret', e.target.value)}
                                    className="mt-2 h-12 px-4 rounded-xl bg-white/50 dark:bg-slate-900"
                                />
                            </div>

                            <div>
                                <Label className="text-base font-semibold">Cluster</Label>
                                <Select
                                    value={data.pusher_app_cluster}
                                    onValueChange={(value) => setData('pusher_app_cluster', value)}
                                >
                                    <SelectTrigger className="mt-2 h-12 px-4 rounded-xl bg-white/50 dark:bg-slate-900">
                                        <SelectValue placeholder="Sélectionner un cluster" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="mt1">mt1 (N. Virginia)</SelectItem>
                                        <SelectItem value="eu">eu (Ireland)</SelectItem>
                                        <SelectItem value="ap1">ap1 (Singapore)</SelectItem>
                                        <SelectItem value="ap2">ap2 (Mumbai)</SelectItem>
                                        <SelectItem value="us2">us2 (Ohio)</SelectItem>
                                        <SelectItem value="us3">us3 (Oregon)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    {/* Configuration avancée */}
                    <div className="bg-background rounded-lg shadow p-6">
                        <div className="flex items-center gap-2 mb-6">
                            <Wifi className="h-5 w-5" />
                            <h2 className="text-lg font-semibold">Configuration avancée</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div>
                                <Label className="text-base font-semibold">Host</Label>
                                <Input
                                    value={data.pusher_app_host}
                                    onChange={e => setData('pusher_app_host', e.target.value)}
                                    placeholder="socket.pusher.com"
                                    className="mt-2 h-12 px-4 rounded-xl bg-white/50 dark:bg-slate-900"
                                />
                            </div>

                            <div>
                                <Label className="text-base font-semibold">Port</Label>
                                <Input
                                    value={data.pusher_app_port}
                                    onChange={e => setData('pusher_app_port', e.target.value)}
                                    className="mt-2 h-12 px-4 rounded-xl bg-white/50 dark:bg-slate-900"
                                />
                            </div>

                            <div>
                                <Label className="text-base font-semibold">Schéma</Label>
                                <Select
                                    value={data.pusher_scheme}
                                    onValueChange={(value) => setData('pusher_scheme', value)}
                                >
                                    <SelectTrigger className="mt-2 h-12 px-4 rounded-xl bg-white/50 dark:bg-slate-900">
                                        <SelectValue placeholder="Sélectionner un schéma" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="http">HTTP</SelectItem>
                                        <SelectItem value="https">HTTPS</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="mt-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <Label className="text-base font-semibold">Forcer TLS</Label>
                                    <p className="text-sm text-muted-foreground">Forcer l'utilisation de TLS pour la sécurité</p>
                                </div>
                                <Switch
                                    checked={data.force_tls}
                                    onCheckedChange={(checked) => setData('force_tls', checked)}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <Label className="text-base font-semibold">Chiffrement</Label>
                                    <p className="text-sm text-muted-foreground">Activer le chiffrement des données</p>
                                </div>
                                <Switch
                                    checked={data.encrypted}
                                    onCheckedChange={(checked) => setData('encrypted', checked)}
                                />
                            </div>
                        </div>
                    </div>

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

export default Pusher
