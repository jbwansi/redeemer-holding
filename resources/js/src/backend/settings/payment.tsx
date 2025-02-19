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
    CreditCard,
    KeyRound,
    Settings2,
    Loader,
    Globe,
    ShieldCheck
} from 'lucide-react'
import { toast } from 'sonner'
import { useSettings } from '@/hooks/use-settings'

const Payment = () => {
    const { settings, isLoading, isError } = useSettings()

    const { data, setData, post, processing } = useForm({
        paypal_public_key: settings?.paypal_public_key || '',
        paypal_secret_key: settings?.paypal_secret_key || '',
        paypal_environment: settings?.paypal_environment || 'sandbox',
        paypal_enabled: settings?.paypal_enabled || false,
        paypal_webhook_secret: settings?.paypal_webhook_secret || '',
        paypal_currency: settings?.paypal_currency || 'EUR',
        debug_mode: settings?.debug_mode || false,
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
                toast.success('Paramètres Paypal mis à jour avec succès')
            },
        })
    }

    if (isLoading) {
        return <SettingWrapper>
            <div className="flex flex-col items-center justify-center h-full space-y-4">
                <Loader className="h-12 w-12 text-primary animate-spin dark:text-white" />
                <p className="text-lg font-semibold">Chargement des paramètres Paypal...</p>
            </div>
        </SettingWrapper>
    }

    if (isError) {
        return <SettingWrapper>
            <div className="flex flex-col items-center justify-center h-full space-y-4">
                <CreditCard className="h-12 w-12 text-red-500 dark:text-red-500" />
                <p className="text-lg font-semibold">Une erreur s'est produite lors du chargement des paramètres.</p>
            </div>
        </SettingWrapper>
    }

    return (
        <SettingWrapper>
            <div className="space-y-6">
                <Alert>
                    <CreditCard className="h-4 w-4" />
                    <AlertTitle className="text-lg font-semibold">Configuration Paypal</AlertTitle>
                    <AlertDescription>
                        Configurez les paramètres de votre compte Paypal pour activer les paiements en ligne.
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
                                    <Label className="text-base font-semibold">Activer Paypal</Label>
                                    <p className="text-sm text-muted-foreground">Activer/désactiver les paiements via Paypal</p>
                                </div>
                                <Switch
                                    checked={data.paypal_enabled}
                                    onCheckedChange={(checked) => setData('paypal_enabled', checked)}
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

                    {/* Clés API */}
                    <div className="bg-background rounded-lg shadow p-6">
                        <div className="flex items-center gap-2 mb-6">
                            <KeyRound className="h-5 w-5" />
                            <h2 className="text-lg font-semibold">Clés API</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <Label className="text-base font-semibold">Clé Publique</Label>
                                <Input
                                    value={data.paypal_public_key}
                                    onChange={e => setData('paypal_public_key', e.target.value)}
                                    className="mt-2 h-12 px-4 rounded-xl bg-white/50 dark:bg-slate-900"
                                    placeholder="pk_live_xxxxx"
                                />
                            </div>

                            <div>
                                <Label className="text-base font-semibold">Clé Secrète</Label>
                                <Input
                                    type="password"
                                    value={data.paypal_secret_key}
                                    onChange={e => setData('paypal_secret_key', e.target.value)}
                                    className="mt-2 h-12 px-4 rounded-xl bg-white/50 dark:bg-slate-900"
                                    placeholder="sk_live_xxxxx"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Configuration avancée */}
                    <div className="bg-background rounded-lg shadow p-6">
                        <div className="flex items-center gap-2 mb-6">
                            <Globe className="h-5 w-5" />
                            <h2 className="text-lg font-semibold">Configuration avancée</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <Label className="text-base font-semibold">Environnement</Label>
                                <Select
                                    value={data.paypal_environment}
                                    onValueChange={(value) => setData('paypal_environment', value)}
                                >
                                    <SelectTrigger className="mt-2 h-12 px-4 rounded-xl bg-white/50 dark:bg-slate-900">
                                        <SelectValue placeholder="Sélectionner l'environnement" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="sandbox">Sandbox (Test)</SelectItem>
                                        <SelectItem value="live">Production</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label className="text-base font-semibold">Devise</Label>
                                <Select
                                    value={data.paypal_currency}
                                    onValueChange={(value) => setData('paypal_currency', value)}
                                >
                                    <SelectTrigger className="mt-2 h-12 px-4 rounded-xl bg-white/50 dark:bg-slate-900">
                                        <SelectValue placeholder="Sélectionner la devise" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="XOF">Franc CFA (XOF)</SelectItem>
                                        <SelectItem value="EUR">Euro (EUR)</SelectItem>
                                        <SelectItem value="USD">Dollar US (USD)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="mt-6">
                            <div>
                                <Label className="text-base font-semibold">Clé Secrète Webhook</Label>
                                <div className="flex gap-2 mt-2">
                                    <Input
                                        value={data.paypal_webhook_secret}
                                        onChange={e => setData('paypal_webhook_secret', e.target.value)}
                                        className="h-12 px-4 rounded-xl bg-white/50 dark:bg-slate-900"
                                        placeholder="whsec_xxxxx"
                                    />
                                </div>
                                <p className="text-sm text-muted-foreground mt-2">
                                    Cette clé est utilisée pour vérifier l'authenticité des webhooks reçus de Paypal
                                </p>
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

export default Payment
