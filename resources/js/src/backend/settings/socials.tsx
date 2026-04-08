import React, { useEffect } from 'react'
import { useForm } from '@inertiajs/react'
import SettingWrapper from './setting-wrapper'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    Share2,
    Facebook,
    Instagram,
    Twitter,
    Linkedin,
    Youtube,
    Loader,
    Settings2,
    Globe
} from 'lucide-react'
import { toast } from 'sonner'
import { useSettings } from '@/hooks/use-settings'

const SocialMedia = () => {
    const { settings, isLoading, isError } = useSettings()

    const { data, setData, post, processing } = useForm<any>({
        facebook_enabled: settings?.facebook_enabled || false,
        facebook_url: settings?.facebook_url || '',
        instagram_enabled: settings?.instagram_enabled || false,
        instagram_url: settings?.instagram_url || '',
        twitter_enabled: settings?.twitter_enabled || false,
        twitter_url: settings?.twitter_url || '',
        linkedin_enabled: settings?.linkedin_enabled || false,
        linkedin_url: settings?.linkedin_url || '',
        youtube_enabled: settings?.youtube_enabled || false,
        youtube_url: settings?.youtube_url || '',
        tiktok_enabled: settings?.tiktok_enabled || false,
        tiktok_url: settings?.tiktok_url || '',
        show_social_share: settings?.show_social_share || false,
        show_social_links: settings?.show_social_links || false,
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
                toast.success('Paramètres des réseaux sociaux mis à jour avec succès')
            },
        })
    }

    if (isLoading) {
        return <SettingWrapper>
            <div className="flex flex-col items-center justify-center h-full space-y-4">
                <Loader className="h-12 w-12 text-primary animate-spin dark:text-white" />
                <p className="text-lg font-semibold">Chargement des paramètres des réseaux sociaux...</p>
            </div>
        </SettingWrapper>
    }

    if (isError) {
        return <SettingWrapper>
            <div className="flex flex-col items-center justify-center h-full space-y-4">
                <Share2 className="h-12 w-12 text-red-500 dark:text-red-500" />
                <p className="text-lg font-semibold">Une erreur s'est produite lors du chargement des paramètres.</p>
            </div>
        </SettingWrapper>
    }

    const socialNetworks = [
        { name: 'Facebook', icon: Facebook, enabled: 'facebook_enabled', url: 'facebook_url' },
        { name: 'Instagram', icon: Instagram, enabled: 'instagram_enabled', url: 'instagram_url' },
        { name: 'Twitter', icon: Twitter, enabled: 'twitter_enabled', url: 'twitter_url' },
        { name: 'LinkedIn', icon: Linkedin, enabled: 'linkedin_enabled', url: 'linkedin_url' },
        { name: 'YouTube', icon: Youtube, enabled: 'youtube_enabled', url: 'youtube_url' },
        { name: 'TikTok', icon: Globe, enabled: 'tiktok_enabled', url: 'tiktok_url' },
    ]

    return (
        <SettingWrapper>
            <div className="space-y-6">
                <Alert>
                    <Share2 className="h-4 w-4" />
                    <AlertTitle className="text-lg font-semibold">Configuration des réseaux sociaux</AlertTitle>
                    <AlertDescription>
                        Gérez vos liens vers les réseaux sociaux et les options de partage.
                    </AlertDescription>
                </Alert>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <Tabs defaultValue="general" className="space-y-6">
                        <TabsList className="w-full justify-start overflow-x-auto whitespace-nowrap h-auto p-1">
                            <TabsTrigger value="general">Général</TabsTrigger>
                            <TabsTrigger value="networks">Réseaux</TabsTrigger>
                        </TabsList>

                        <TabsContent value="general" className="space-y-6">
                            <div className="bg-background rounded-lg shadow p-6">
                                <div className="flex items-center gap-2 mb-6">
                                    <Settings2 className="h-5 w-5" />
                                    <h2 className="text-lg font-semibold">Configuration générale</h2>
                                </div>

                                <div className="mt-6 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Label className="text-base font-semibold">Afficher les liens sociaux</Label>
                                            <p className="text-sm text-muted-foreground">Afficher les liens vers vos réseaux sociaux sur le site</p>
                                        </div>
                                        <Switch
                                            checked={data.show_social_links}
                                            onCheckedChange={(checked) => setData('show_social_links', checked)}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Label className="text-base font-semibold">Activer le partage social</Label>
                                            <p className="text-sm text-muted-foreground">Permettre aux utilisateurs de partager le contenu sur les réseaux sociaux</p>
                                        </div>
                                        <Switch
                                            checked={data.show_social_share}
                                            onCheckedChange={(checked) => setData('show_social_share', checked)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="networks" className="space-y-6">
                            <div className="bg-background rounded-lg shadow p-6">
                                <div className="flex items-center gap-2 mb-6">
                                    <Globe className="h-5 w-5" />
                                    <h2 className="text-lg font-semibold">Réseaux sociaux</h2>
                                </div>

                                <div className="space-y-6">
                                    {socialNetworks.map((network) => (
                                        <div key={network.name} className="border-b border-border pb-6 last:border-0 last:pb-0">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-2">
                                                    <network.icon className="h-5 w-5" />
                                                    <Label className="text-base font-semibold">{network.name}</Label>
                                                </div>
                                                <Switch
                                                    checked={data[network.enabled]}
                                                    onCheckedChange={(checked) => setData(network.enabled, checked)}
                                                />
                                            </div>

                                            {data[network.enabled] && (
                                                <div>
                                                    <Input
                                                        value={data[network.url]}
                                                        onChange={e => setData(network.url, e.target.value)}
                                                        className="h-12 px-4 rounded-xl bg-white/50 dark:bg-slate-900"
                                                        placeholder={`URL de votre page ${network.name}`}
                                                    />
                                                    <p className="text-sm text-muted-foreground mt-2">
                                                        Entrez l'URL complète de votre profil {network.name}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>

                    <div className="flex justify-end gap-4">
                        <Button
                            type="submit"
                            size="lg"
                            className="dark:text-white"
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

export default SocialMedia
