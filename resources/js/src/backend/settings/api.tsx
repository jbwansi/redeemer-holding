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
    Radio,
    KeyRound,
    Wifi,
    Cloud,
    Music2,
    CloudRain,
    Lock,
    GanttChartSquare,
    Loader,
    RefreshCw
} from 'lucide-react'
import { toast } from 'sonner'
import { route } from 'ziggy-js'
import { useSettings } from '@/hooks/use-settings'

const ApiSettings = () => {
    const { settings, isLoading, isError } = useSettings()

    const { data, setData, post, processing } = useForm({
        // Paramètres API exposée
        api_enabled: settings?.api_enabled || true,
        api_debug_mode: settings?.api_debug_mode || false,
        api_rate_limiting: settings?.api_rate_limiting || true,
        rate_limit_per_minute: settings?.rate_limit_per_minute || '60',
        api_token_expiration: settings?.api_token_expiration || '30',
        allowed_origins: settings?.allowed_origins || '',
        api_version: settings?.api_version || 'v1',
        api_prefix: settings?.api_prefix || 'api',
        enable_documentation: settings?.enable_documentation || true,

        // API de streaming
        streaming_provider: settings?.streaming_provider || 'shoutcast',
        streaming_url: settings?.streaming_url || '',
        streaming_port: settings?.streaming_port || '8000',
        streaming_mount_point: settings?.streaming_mount_point || '',
        streaming_api_key: settings?.streaming_api_key || '',
        streaming_admin_password: settings?.streaming_admin_password || '',
        enable_stream_monitoring: settings?.enable_stream_monitoring || true,
        stream_check_interval: settings?.stream_check_interval || '60',

        // Webhooks
        enable_webhooks: settings?.enable_webhooks || false,
        webhook_secret: settings?.webhook_secret || '',
        webhook_events: settings?.webhook_events || [],
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
                toast.success('Paramètres API mis à jour avec succès')
            },
        })
    }

    if (isLoading) {
        return <SettingWrapper>
            <div className="flex flex-col items-center justify-center h-full space-y-4">
                <Loader className="h-12 w-12 text-primary animate-spin dark:text-white" />
                <p className="text-lg font-semibold">Chargement des paramètres API...</p>
            </div>
        </SettingWrapper>
    }

    if (isError) {
        return <SettingWrapper>
            <div className="flex flex-col items-center justify-center h-full space-y-4">
                <Cloud className="h-12 w-12 text-red-500 dark:text-red-500" />
                <p className="text-lg font-semibold">Une erreur s'est produite lors du chargement des paramètres.</p>
            </div>
        </SettingWrapper>
    }

    return (
        <SettingWrapper>
            <div className="space-y-6">
                <Alert>
                    <Cloud className="h-4 w-4" />
                    <AlertTitle>Configuration API</AlertTitle>
                    <AlertDescription>
                        Configurez les paramètres de l'API exposée et des services externes utilisés par votre radio en ligne.
                    </AlertDescription>
                </Alert>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Paramètres API exposée */}
                    <div className="bg-background rounded-lg shadow p-6">
                        <div className="flex items-center gap-2 mb-6">
                            <Lock className="h-5 w-5" />
                            <h2 className="text-lg font-semibold">API Exposée</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div>
                                <Label className="text-base font-semibold">Préfixe API</Label>
                                <Input
                                    value={data.api_prefix}
                                    onChange={e => setData('api_prefix', e.target.value)}
                                    className="mt-2 h-12 px-4 rounded-xl bg-white/50 dark:bg-slate-900"
                                />
                            </div>

                            <div>
                                <Label className="text-base font-semibold">Version API</Label>
                                <Input
                                    value={data.api_version}
                                    onChange={e => setData('api_version', e.target.value)}
                                    className="mt-2 h-12 px-4 rounded-xl bg-white/50 dark:bg-slate-900"
                                />
                            </div>

                            <div>
                                <Label className="text-base font-semibold">Limite par minute</Label>
                                <Input
                                    type="number"
                                    value={data.rate_limit_per_minute}
                                    onChange={e => setData('rate_limit_per_minute', e.target.value)}
                                    className="mt-2 h-12 px-4 rounded-xl bg-white/50 dark:bg-slate-900"
                                />
                            </div>

                            <div>
                                <Label className="text-base font-semibold">Expiration token (jours)</Label>
                                <Input
                                    type="number"
                                    value={data.api_token_expiration}
                                    onChange={e => setData('api_token_expiration', e.target.value)}
                                    className="mt-2 h-12 px-4 rounded-xl bg-white/50 dark:bg-slate-900"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <Label className="text-base font-semibold">Origines autorisées (CORS)</Label>
                                <Input
                                    value={data.allowed_origins}
                                    onChange={e => setData('allowed_origins', e.target.value)}
                                    placeholder="https://app1.com, https://app2.com"
                                    className="mt-2 h-12 px-4 rounded-xl bg-white/50 dark:bg-slate-900"
                                />
                            </div>
                        </div>

                        <div className="mt-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <Label className="text-base font-semibold">API Active</Label>
                                    <p className="text-sm text-muted-foreground">Activer/désactiver l'API</p>
                                </div>
                                <Switch
                                    checked={data.api_enabled}
                                    onCheckedChange={(checked) => setData('api_enabled', checked)}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <Label className="text-base font-semibold">Mode debug</Label>
                                    <p className="text-sm text-muted-foreground">Activer le mode debug pour l'API</p>
                                </div>
                                <Switch
                                    checked={data.api_debug_mode}
                                    onCheckedChange={(checked) => setData('api_debug_mode', checked)}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <Label className="text-base font-semibold">Rate Limiting</Label>
                                    <p className="text-sm text-muted-foreground">Limiter le nombre de requêtes</p>
                                </div>
                                <Switch
                                    checked={data.api_rate_limiting}
                                    onCheckedChange={(checked) => setData('api_rate_limiting', checked)}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <Label className="text-base font-semibold">Documentation</Label>
                                    <p className="text-sm text-muted-foreground">Activer la documentation API</p>
                                </div>
                                <Switch
                                    checked={data.enable_documentation}
                                    onCheckedChange={(checked) => setData('enable_documentation', checked)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Configuration Streaming */}
                    <div className="bg-background rounded-lg shadow p-6">
                        <div className="flex items-center gap-2 mb-6">
                            <Music2 className="h-5 w-5" />
                            <h2 className="text-lg font-semibold">Configuration Streaming</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div>
                                <Label className="text-base font-semibold">Fournisseur</Label>
                                <Select
                                    value={data.streaming_provider}
                                    onValueChange={(value) => setData('streaming_provider', value)}
                                >
                                    <SelectTrigger className="mt-2 h-12 px-4 rounded-xl bg-white/50 dark:bg-slate-900">
                                        <SelectValue placeholder="Sélectionner un fournisseur" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="shoutcast">Shoutcast</SelectItem>
                                        <SelectItem value="icecast">Icecast</SelectItem>
                                        <SelectItem value="custom">Personnalisé</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label className="text-base font-semibold">URL du serveur</Label>
                                <Input
                                    value={data.streaming_url}
                                    onChange={e => setData('streaming_url', e.target.value)}
                                    className="mt-2 h-12 px-4 rounded-xl bg-white/50 dark:bg-slate-900"
                                />
                            </div>

                            <div>
                                <Label className="text-base font-semibold">Port</Label>
                                <Input
                                    value={data.streaming_port}
                                    onChange={e => setData('streaming_port', e.target.value)}
                                    className="mt-2 h-12 px-4 rounded-xl bg-white/50 dark:bg-slate-900"
                                />
                            </div>

                            <div>
                                <Label className="text-base font-semibold">Point de montage</Label>
                                <Input
                                    value={data.streaming_mount_point}
                                    onChange={e => setData('streaming_mount_point', e.target.value)}
                                    className="mt-2 h-12 px-4 rounded-xl bg-white/50 dark:bg-slate-900"
                                />
                            </div>

                            <div>
                                <Label className="text-base font-semibold">Clé API</Label>
                                <Input
                                    type="password"
                                    value={data.streaming_api_key}
                                    onChange={e => setData('streaming_api_key', e.target.value)}
                                    className="mt-2 h-12 px-4 rounded-xl bg-white/50 dark:bg-slate-900"
                                />
                            </div>

                            <div>
                                <Label className="text-base font-semibold">Mot de passe admin</Label>
                                <Input
                                    type="password"
                                    value={data.streaming_admin_password}
                                    onChange={e => setData('streaming_admin_password', e.target.value)}
                                    className="mt-2 h-12 px-4 rounded-xl bg-white/50 dark:bg-slate-900"
                                />
                            </div>
                        </div>

                        <div className="mt-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <Label className="text-base font-semibold">Surveillance du flux</Label>
                                    <p className="text-sm text-muted-foreground">Activer la surveillance du flux</p>
                                </div>
                                <Switch
                                    checked={data.enable_stream_monitoring}
                                    onCheckedChange={(checked) => setData('enable_stream_monitoring', checked)}
                                />
                            </div>

                            {data.enable_stream_monitoring && (
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label className="text-base font-semibold">Intervalle de vérification (secondes)</Label>
                                        <Input
                                            type="number"
                                            value={data.stream_check_interval}
                                            onChange={e => setData('stream_check_interval', e.target.value)}
                                            className="mt-2 h-12 px-4 rounded-xl bg-white/50 dark:bg-slate-900"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Configuration Webhooks */}
                    <div className="bg-background rounded-lg shadow p-6">
                        <div className="flex items-center gap-2 mb-6">
                            <RefreshCw className="h-5 w-5" />
                            <h2 className="text-lg font-semibold">Webhooks</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <Label className="text-base font-semibold">Secret Webhook</Label>
                                <Input
                                    type="password"
                                    value={data.webhook_secret}
                                    onChange={e => setData('webhook_secret', e.target.value)}
                                    className="mt-2 h-12 px-4 rounded-xl bg-white/50 dark:bg-slate-900"
                                />
                            </div>

                            <div>
                                <Label className="text-base font-semibold">Événements</Label>
                                <Textarea
                                    value={data.webhook_events.join('\n')}
                                    onChange={e => setData('webhook_events', e.target.value.split('\n'))}
                                    placeholder="stream.started&#10;stream.stopped&#10;user.subscribed"
                                    className="mt-2 px-4 h-32 rounded-xl bg-white/50 dark:bg-slate-900"
                                />
                            </div>
                        </div>

                        <div className="mt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <Label className="text-base font-semibold">Webhooks actifs</Label>
                                    <p className="text-sm text-muted-foreground">Activer les webhooks</p>
                                </div>
                                <Switch
                                    checked={data.enable_webhooks}
                                    onCheckedChange={(checked) => setData('enable_webhooks', checked)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-4">
                        <Button
                            type="submit"
                            size="lg"
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

export default ApiSettings
