import React, { useEffect } from 'react'
import { useForm } from '@inertiajs/react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
    Radio,
    CalendarDays,
    ShoppingBag,
    FileText,
    MessagesSquare,
    Users,
    Music2,
    Loader,
    Settings2,
    BadgeDollarSign,
    Podcast,
    Newspaper,
    Calendar,
    CircleDollarSign,
    Store,
    HeartHandshake,
    BookOpen,
    Home
} from 'lucide-react'
import { toast } from 'sonner'
import { useSettings } from '@/hooks/use-settings'

const Activation = () => {
    const { settings, isLoading, isError } = useSettings()

    const { data, setData, post, processing } = useForm({
        // Radio & Streaming
        enable_radio: settings?.enable_radio || true,
        enable_live_chat: settings?.enable_live_chat || true,
        enable_song_requests: settings?.enable_song_requests || true,
        enable_podcasts: settings?.enable_podcasts || true,
        enable_playlists: settings?.enable_playlists || true,

        // Communauté & Social
        enable_events: settings?.enable_events || true,
        enable_blog: settings?.enable_blog || true,
        enable_comments: settings?.enable_comments || true,
        enable_user_profiles: settings?.enable_user_profiles || true,
        enable_social_feed: settings?.enable_social_feed || true,

        // E-commerce
        enable_shop: settings?.enable_shop || true,
        enable_donations: settings?.enable_donations || true,
        enable_subscriptions: settings?.enable_subscriptions || true,
        enable_merchandise: settings?.enable_merchandise || true,

        // Services
        enable_advertising: settings?.enable_advertising || true,
        enable_partnerships: settings?.enable_partnerships || true,
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
                toast.success('Modules mis à jour avec succès')
            },
        })
    }

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
                <Loader className="h-12 w-12 text-primary animate-spin dark:text-white" />
                <p className="text-lg font-semibold">Chargement des modules...</p>
            </div>
        )
    }

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
                <Settings2 className="h-12 w-12 text-red-500 dark:text-red-500" />
                <p className="text-lg font-semibold">Une erreur s'est produite lors du chargement des modules.</p>
            </div>
        )
    }

    const modules = [
        {
            title: "Prinpal",
            description: "Modules principaux de l'application.",
            icon: <Home className="h-5 w-5" />,
            features: [
                {
                    name: "Formations",
                    description: "Module principal des formations",
                    enabled: data.enable_radio,
                    key: "enable_radio",
                    icon: <BookOpen className="h-4 w-4" />
                },
                {
                    name: "Services",
                    description: "Gestion de vos différents services",
                    enabled: data.enable_live_chat,
                    key: "enable_live_chat",
                    icon: <MessagesSquare className="h-4 w-4" />
                },
                // {
                //     name: "Podcasts",
                //     description: "Gestion et diffusion de podcasts",
                //     enabled: data.enable_podcasts,
                //     key: "enable_podcasts",
                //     icon: <Podcast className="h-4 w-4" />
                // },
            ]
        },
        {
            title: "Communauté & Social",
            description: "Modules de gestion de la communauté",
            icon: <Users className="h-5 w-5" />,
            features: [
                {
                    name: "Événements",
                    description: "Gestion des événements et concerts",
                    enabled: data.enable_events,
                    key: "enable_events",
                    icon: <Calendar className="h-4 w-4" />
                },
                {
                    name: "Blog",
                    description: "Articles et actualités",
                    enabled: data.enable_blog,
                    key: "enable_blog",
                    icon: <Newspaper className="h-4 w-4" />
                },
                {
                    name: "Commentaires",
                    description: "Système de commentaires",
                    enabled: data.enable_comments,
                    key: "enable_comments",
                    icon: <MessagesSquare className="h-4 w-4" />
                },
                {
                    name: "Profils utilisateurs",
                    description: "Profils et paramètres utilisateurs",
                    enabled: data.enable_user_profiles,
                    key: "enable_user_profiles",
                    icon: <Users className="h-4 w-4" />
                },
                // {
                //     name: "Fil social",
                //     description: "Fil d'actualité social",
                //     enabled: data.enable_social_feed,
                //     key: "enable_social_feed",
                //     icon: <FileText className="h-4 w-4" />
                // }
            ]
        }
    ]

    return (
        <div className="container mx-auto p-6">
            <div className="space-y-6">
                <Alert>
                    <Settings2 className="h-4 w-4" />
                    <AlertTitle className="text-lg font-semibold">Activation des modules</AlertTitle>
                    <AlertDescription>
                        Gérez l'activation et la désactivation des différents modules de votre radio en ligne.
                    </AlertDescription>
                </Alert>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {modules.map((module) => (
                        <Card key={module.title}>
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    {module.icon}
                                    <CardTitle>{module.title}</CardTitle>
                                </div>
                                <CardDescription>{module.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {module.features.map((feature) => (
                                    <div key={feature.key} className="flex items-center justify-between">
                                        <div className="flex items-start gap-3">
                                            {feature.icon}
                                            <div>
                                                <Label className="text-base font-semibold">
                                                    {feature.name}
                                                </Label>
                                                <p className="text-sm text-muted-foreground">
                                                    {feature.description}
                                                </p>
                                            </div>
                                        </div>
                                        <Switch
                                            checked={feature.enabled}
                                            onCheckedChange={(checked) =>
                                                setData(feature.key, checked)
                                            }
                                        />
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    ))}

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
        </div>
    )
}

export default Activation
