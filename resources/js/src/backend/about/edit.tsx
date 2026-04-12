import React from 'react'
import { Head, useForm } from '@inertiajs/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import QuillEditor from '@/components/ui/quill-editor'
import { Loader2, Plus, Trash2 } from 'lucide-react'

interface ValueItem {
    icon: string
    title: string
    description: string
}

interface StatItem {
    value: string
    label: string
}

interface JourneyItem {
    year: string
    title: string
    description: string
}

interface TestimonialItem {
    content: string
    author: string
    position: string
    image: string
}

interface Meta {
    hero_badge: string
    hero_subtitle: string
    hero_primary_button_text: string
    hero_primary_button_link: string
    hero_secondary_button_text: string
    hero_secondary_button_link: string

    hero_title_before: string
    hero_title_highlight: string
    hero_title_after: string

    story_author: string
    story_role: string
    story_years: string

    values: ValueItem[]

    mission_label: string
    mission_title: string
    mission_subtitle: string
    mission_text: string
    mission_button_text: string
    mission_button_link: string

    stats: StatItem[]
    journey: JourneyItem[]
    testimonials: TestimonialItem[]
    certifications: string[]
}

interface Page {
    id: number
    title: string
    content: string
    meta: Meta | null
}

const ICONS = [
    'TrendingUp',
    'Users',
    'Award',
    'CheckCircle',
    'BookOpen',
    'Star',
    'Heart',
    'Zap',
    'Shield',
    'Target',
]

const defaultMeta: Meta = {
    hero_badge: 'A propos',
    hero_subtitle: '',
    hero_primary_button_text: 'Discutons de votre projet',
    hero_primary_button_link: '/contact',
    hero_secondary_button_text: 'Voir mes services',
    hero_secondary_button_link: '/services',

    hero_title_before: 'Transformer des',
    hero_title_highlight: 'vies',
    hero_title_after: ', une personne à la fois',

    story_author: '',
    story_role: '',
    story_years: '',

    values: [],

    mission_label: 'MA MISSION',
    mission_title: '',
    mission_subtitle: 'TRAVAILLONS ENSEMBLE',
    mission_text: '',
    mission_button_text: 'Parlons-en',
    mission_button_link: '/contact',

    stats: [],
    journey: [],
    testimonials: [],
    certifications: [],
}

function updateItem<T>(arr: T[], index: number, patch: Partial<T>): T[] {
    return arr.map((item, i) => (i === index ? { ...item, ...patch } : item))
}

function removeItem<T>(arr: T[], index: number): T[] {
    return arr.filter((_, i) => i !== index)
}

const AboutEdit = ({ page }: { page: Page }) => {
    const { data, setData, put, processing, errors } = useForm({
        title: page.title,
        content: page.content,
        meta: page.meta ?? defaultMeta,
    })

    const m = data.meta
    const setMeta = (patch: Partial<Meta>) => setData('meta', { ...m, ...patch })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        put(route('about.update'))
    }

    return (
        <>
            <Head title="Edition page A propos" />

            <div className="mx-auto max-w-6xl space-y-6 p-4">
                <div className="rounded-2xl border bg-gradient-to-r from-slate-50 to-white p-6">
                    <h1 className="text-3xl font-semibold tracking-tight">
                        Edition de la page A propos
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Modifiez les sections hero, histoire, valeurs, mission, parcours et
                        temoignages depuis un seul ecran.
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <Tabs defaultValue="hero" className="space-y-6">
                        <TabsList className="flex-wrap h-auto gap-1">
                            <TabsTrigger value="hero">Héro</TabsTrigger>
                            <TabsTrigger value="story">Mon histoire</TabsTrigger>
                            <TabsTrigger value="values">Valeurs</TabsTrigger>
                            <TabsTrigger value="mission">Ma mission</TabsTrigger>
                            <TabsTrigger value="stats">Statistiques</TabsTrigger>
                            <TabsTrigger value="journey">Parcours</TabsTrigger>
                            <TabsTrigger value="testimonials">Témoignages</TabsTrigger>
                            <TabsTrigger value="certifications">Certifications</TabsTrigger>
                        </TabsList>

                        <TabsContent value="hero">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Section Héro</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label className="mb-2">Badge</Label>
                                        <Input
                                            value={m.hero_badge}
                                            onChange={e => setMeta({ hero_badge: e.target.value })}
                                            placeholder="A propos"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                        <div>
                                            <Label className="mb-2">Titre avant le mot en rouge</Label>
                                            <Input
                                                value={m.hero_title_before}
                                                onChange={e => setMeta({ hero_title_before: e.target.value })}
                                                placeholder="Transformer des"
                                            />
                                        </div>

                                        <div>
                                            <Label className="mb-2">Mot en rouge</Label>
                                            <Input
                                                value={m.hero_title_highlight}
                                                onChange={e => setMeta({ hero_title_highlight: e.target.value })}
                                                placeholder="vies"
                                            />
                                        </div>

                                        <div>
                                            <Label className="mb-2">Titre après le mot en rouge</Label>
                                            <Input
                                                value={m.hero_title_after}
                                                onChange={e => setMeta({ hero_title_after: e.target.value })}
                                                placeholder=", une personne à la fois"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <Label className="mb-2">Description</Label>
                                        <Textarea
                                            rows={4}
                                            value={m.hero_subtitle}
                                            onChange={e =>
                                                setMeta({ hero_subtitle: e.target.value })
                                            }
                                            placeholder="Découvrez mon parcours, ma philosophie et les valeurs qui guident ma mission d’aider les autres à révéler leur plein potentiel."
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div>
                                            <Label className="mb-2">Texte bouton principal</Label>
                                            <Input
                                                value={m.hero_primary_button_text}
                                                onChange={e =>
                                                    setMeta({
                                                        hero_primary_button_text:
                                                            e.target.value,
                                                    })
                                                }
                                                placeholder="Discutons de votre projet"
                                            />
                                        </div>

                                        <div>
                                            <Label className="mb-2">Lien bouton principal</Label>
                                            <Input
                                                value={m.hero_primary_button_link}
                                                onChange={e =>
                                                    setMeta({
                                                        hero_primary_button_link:
                                                            e.target.value,
                                                    })
                                                }
                                                placeholder="/contact"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div>
                                            <Label className="mb-2">Texte bouton secondaire</Label>
                                            <Input
                                                value={m.hero_secondary_button_text}
                                                onChange={e =>
                                                    setMeta({
                                                        hero_secondary_button_text:
                                                            e.target.value,
                                                    })
                                                }
                                                placeholder="Voir mes services"
                                            />
                                        </div>

                                        <div>
                                            <Label className="mb-2">Lien bouton secondaire</Label>
                                            <Input
                                                value={m.hero_secondary_button_link}
                                                onChange={e =>
                                                    setMeta({
                                                        hero_secondary_button_link:
                                                            e.target.value,
                                                    })
                                                }
                                                placeholder="/services"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="story">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Mon histoire</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                        <div>
                                            <Label className="mb-2">Nom de l'auteur</Label>
                                            <Input
                                                value={m.story_author}
                                                onChange={e =>
                                                    setMeta({ story_author: e.target.value })
                                                }
                                                placeholder="Jean-Bernard Wansi"
                                            />
                                        </div>

                                        <div>
                                            <Label className="mb-2">Rôle / Titre</Label>
                                            <Input
                                                value={m.story_role}
                                                onChange={e =>
                                                    setMeta({ story_role: e.target.value })
                                                }
                                                placeholder="Fondateur & Coach principal"
                                            />
                                        </div>

                                        <div>
                                            <Label className="mb-2">Années d'expertise</Label>
                                            <Input
                                                value={m.story_years}
                                                onChange={e =>
                                                    setMeta({ story_years: e.target.value })
                                                }
                                                placeholder="10+"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <Label className="mb-2">Texte (Mon histoire)</Label>
                                        <QuillEditor
                                            value={data.content}
                                            onChange={value => setData('content', value)}
                                        />
                                        {errors.content && (
                                            <p className="mt-1 text-sm text-red-500">
                                                {errors.content}
                                            </p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="values">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <CardTitle>Nos valeurs</CardTitle>
                                    <Button
                                        type="button"
                                        size="sm"
                                        onClick={() =>
                                            setMeta({
                                                values: [
                                                    ...m.values,
                                                    {
                                                        icon: 'Award',
                                                        title: '',
                                                        description: '',
                                                    },
                                                ],
                                            })
                                        }
                                    >
                                        <Plus className="mr-1 h-4 w-4" />
                                        Ajouter
                                    </Button>
                                </CardHeader>

                                <CardContent className="space-y-4">
                                    {m.values.map((v, i) => (
                                        <div
                                            key={i}
                                            className="space-y-3 rounded-lg border p-4"
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium">
                                                    Valeur {i + 1}
                                                </span>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() =>
                                                        setMeta({
                                                            values: removeItem(m.values, i),
                                                        })
                                                    }
                                                >
                                                    <Trash2 className="h-4 w-4 text-red-500" />
                                                </Button>
                                            </div>

                                            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                                                <div>
                                                    <Label className="mb-1 text-xs">Icône</Label>
                                                    <select
                                                        className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                                                        value={v.icon}
                                                        onChange={e =>
                                                            setMeta({
                                                                values: updateItem(m.values, i, {
                                                                    icon: e.target.value,
                                                                }),
                                                            })
                                                        }
                                                    >
                                                        {ICONS.map(icon => (
                                                            <option key={icon} value={icon}>
                                                                {icon}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div className="md:col-span-2">
                                                    <Label className="mb-1 text-xs">Titre</Label>
                                                    <Input
                                                        value={v.title}
                                                        onChange={e =>
                                                            setMeta({
                                                                values: updateItem(m.values, i, {
                                                                    title: e.target.value,
                                                                }),
                                                            })
                                                        }
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <Label className="mb-1 text-xs">
                                                    Description
                                                </Label>
                                                <Textarea
                                                    rows={2}
                                                    value={v.description}
                                                    onChange={e =>
                                                        setMeta({
                                                            values: updateItem(m.values, i, {
                                                                description: e.target.value,
                                                            }),
                                                        })
                                                    }
                                                />
                                            </div>
                                        </div>
                                    ))}

                                    {m.values.length === 0 && (
                                        <p className="py-4 text-center text-sm text-muted-foreground">
                                            Aucune valeur. Cliquez sur Ajouter.
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="mission">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Ma mission</CardTitle>
                                </CardHeader>

                                <CardContent className="space-y-4">
                                    <div>
                                        <Label className="mb-2">Petit titre</Label>
                                        <Input
                                            value={m.mission_label}
                                            onChange={e =>
                                                setMeta({ mission_label: e.target.value })
                                            }
                                            placeholder="MA MISSION"
                                        />
                                    </div>

                                    <div>
                                        <Label className="mb-2">Titre principal</Label>
                                        <Textarea
                                            rows={3}
                                            value={m.mission_title}
                                            onChange={e =>
                                                setMeta({ mission_title: e.target.value })
                                            }
                                            placeholder="Vous aider à passer un cap avec une approche qui combine coaching, stratégie et exécution."
                                        />
                                    </div>

                                    <div>
                                        <Label className="mb-2">Sous-titre</Label>
                                        <Input
                                            value={m.mission_subtitle}
                                            onChange={e =>
                                                setMeta({
                                                    mission_subtitle: e.target.value,
                                                })
                                            }
                                            placeholder="TRAVAILLONS ENSEMBLE"
                                        />
                                    </div>

                                    <div>
                                        <Label className="mb-2">Texte</Label>
                                        <Textarea
                                            rows={3}
                                            value={m.mission_text}
                                            onChange={e =>
                                                setMeta({ mission_text: e.target.value })
                                            }
                                            placeholder="Si vous voulez plus de clarté, plus de performance et plus d'impact, alors on doit échanger."
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div>
                                            <Label className="mb-2">Texte du bouton</Label>
                                            <Input
                                                value={m.mission_button_text}
                                                onChange={e =>
                                                    setMeta({
                                                        mission_button_text:
                                                            e.target.value,
                                                    })
                                                }
                                                placeholder="Parlons-en"
                                            />
                                        </div>

                                        <div>
                                            <Label className="mb-2">Lien du bouton</Label>
                                            <Input
                                                value={m.mission_button_link}
                                                onChange={e =>
                                                    setMeta({
                                                        mission_button_link:
                                                            e.target.value,
                                                    })
                                                }
                                                placeholder="/contact"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="stats">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <CardTitle>Statistiques</CardTitle>
                                    <Button
                                        type="button"
                                        size="sm"
                                        onClick={() =>
                                            setMeta({
                                                stats: [...m.stats, { value: '', label: '' }],
                                            })
                                        }
                                    >
                                        <Plus className="mr-1 h-4 w-4" />
                                        Ajouter
                                    </Button>
                                </CardHeader>

                                <CardContent className="space-y-3">
                                    {m.stats.map((s, i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <Input
                                                className="w-32"
                                                placeholder="150+"
                                                value={s.value}
                                                onChange={e =>
                                                    setMeta({
                                                        stats: updateItem(m.stats, i, {
                                                            value: e.target.value,
                                                        }),
                                                    })
                                                }
                                            />
                                            <Input
                                                placeholder="Heures de coaching"
                                                value={s.label}
                                                onChange={e =>
                                                    setMeta({
                                                        stats: updateItem(m.stats, i, {
                                                            label: e.target.value,
                                                        }),
                                                    })
                                                }
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() =>
                                                    setMeta({
                                                        stats: removeItem(m.stats, i),
                                                    })
                                                }
                                            >
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                            </Button>
                                        </div>
                                    ))}

                                    {m.stats.length === 0 && (
                                        <p className="py-4 text-center text-sm text-muted-foreground">
                                            Aucune statistique. Cliquez sur Ajouter.
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="journey">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <CardTitle>Mon parcours</CardTitle>
                                    <Button
                                        type="button"
                                        size="sm"
                                        onClick={() =>
                                            setMeta({
                                                journey: [
                                                    ...m.journey,
                                                    {
                                                        year: '',
                                                        title: '',
                                                        description: '',
                                                    },
                                                ],
                                            })
                                        }
                                    >
                                        <Plus className="mr-1 h-4 w-4" />
                                        Ajouter
                                    </Button>
                                </CardHeader>

                                <CardContent className="space-y-4">
                                    {m.journey.map((j, i) => (
                                        <div
                                            key={i}
                                            className="space-y-3 rounded-lg border p-4"
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium">
                                                    Étape {i + 1}
                                                </span>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() =>
                                                        setMeta({
                                                            journey: removeItem(m.journey, i),
                                                        })
                                                    }
                                                >
                                                    <Trash2 className="h-4 w-4 text-red-500" />
                                                </Button>
                                            </div>

                                            <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                                                <div>
                                                    <Label className="mb-1 text-xs">Année</Label>
                                                    <Input
                                                        placeholder="2010"
                                                        value={j.year}
                                                        onChange={e =>
                                                            setMeta({
                                                                journey: updateItem(
                                                                    m.journey,
                                                                    i,
                                                                    {
                                                                        year: e.target.value,
                                                                    }
                                                                ),
                                                            })
                                                        }
                                                    />
                                                </div>

                                                <div className="md:col-span-3">
                                                    <Label className="mb-1 text-xs">Titre</Label>
                                                    <Input
                                                        placeholder="Formation initiale"
                                                        value={j.title}
                                                        onChange={e =>
                                                            setMeta({
                                                                journey: updateItem(
                                                                    m.journey,
                                                                    i,
                                                                    {
                                                                        title: e.target.value,
                                                                    }
                                                                ),
                                                            })
                                                        }
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <Label className="mb-1 text-xs">
                                                    Description
                                                </Label>
                                                <Textarea
                                                    rows={2}
                                                    value={j.description}
                                                    onChange={e =>
                                                        setMeta({
                                                            journey: updateItem(m.journey, i, {
                                                                description:
                                                                    e.target.value,
                                                            }),
                                                        })
                                                    }
                                                />
                                            </div>
                                        </div>
                                    ))}

                                    {m.journey.length === 0 && (
                                        <p className="py-4 text-center text-sm text-muted-foreground">
                                            Aucune étape. Cliquez sur Ajouter.
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="testimonials">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <CardTitle>Témoignages</CardTitle>
                                    <Button
                                        type="button"
                                        size="sm"
                                        onClick={() =>
                                            setMeta({
                                                testimonials: [
                                                    ...m.testimonials,
                                                    {
                                                        content: '',
                                                        author: '',
                                                        position: '',
                                                        image: '',
                                                    },
                                                ],
                                            })
                                        }
                                    >
                                        <Plus className="mr-1 h-4 w-4" />
                                        Ajouter
                                    </Button>
                                </CardHeader>

                                <CardContent className="space-y-4">
                                    {m.testimonials.map((t, i) => (
                                        <div
                                            key={i}
                                            className="space-y-3 rounded-lg border p-4"
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium">
                                                    Témoignage {i + 1}
                                                </span>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() =>
                                                        setMeta({
                                                            testimonials: removeItem(
                                                                m.testimonials,
                                                                i
                                                            ),
                                                        })
                                                    }
                                                >
                                                    <Trash2 className="h-4 w-4 text-red-500" />
                                                </Button>
                                            </div>

                                            <div>
                                                <Label className="mb-1 text-xs">
                                                    Contenu
                                                </Label>
                                                <Textarea
                                                    rows={3}
                                                    value={t.content}
                                                    onChange={e =>
                                                        setMeta({
                                                            testimonials: updateItem(
                                                                m.testimonials,
                                                                i,
                                                                {
                                                                    content: e.target.value,
                                                                }
                                                            ),
                                                        })
                                                    }
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                                                <div>
                                                    <Label className="mb-1 text-xs">
                                                        Auteur
                                                    </Label>
                                                    <Input
                                                        value={t.author}
                                                        onChange={e =>
                                                            setMeta({
                                                                testimonials: updateItem(
                                                                    m.testimonials,
                                                                    i,
                                                                    {
                                                                        author: e.target.value,
                                                                    }
                                                                ),
                                                            })
                                                        }
                                                    />
                                                </div>

                                                <div>
                                                    <Label className="mb-1 text-xs">
                                                        Position
                                                    </Label>
                                                    <Input
                                                        value={t.position}
                                                        onChange={e =>
                                                            setMeta({
                                                                testimonials: updateItem(
                                                                    m.testimonials,
                                                                    i,
                                                                    {
                                                                        position:
                                                                            e.target.value,
                                                                    }
                                                                ),
                                                            })
                                                        }
                                                    />
                                                </div>

                                                <div>
                                                    <Label className="mb-1 text-xs">
                                                        Image
                                                    </Label>
                                                    <Input
                                                        value={t.image}
                                                        onChange={e =>
                                                            setMeta({
                                                                testimonials: updateItem(
                                                                    m.testimonials,
                                                                    i,
                                                                    {
                                                                        image: e.target.value,
                                                                    }
                                                                ),
                                                            })
                                                        }
                                                        placeholder="https://..."
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {m.testimonials.length === 0 && (
                                        <p className="py-4 text-center text-sm text-muted-foreground">
                                            Aucun témoignage. Cliquez sur Ajouter.
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="certifications">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <CardTitle>Certifications</CardTitle>
                                    <Button
                                        type="button"
                                        size="sm"
                                        onClick={() =>
                                            setMeta({
                                                certifications: [
                                                    ...m.certifications,
                                                    '',
                                                ],
                                            })
                                        }
                                    >
                                        <Plus className="mr-1 h-4 w-4" />
                                        Ajouter
                                    </Button>
                                </CardHeader>

                                <CardContent className="space-y-3">
                                    {m.certifications.map((c, i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <Input
                                                placeholder="International Coaching Federation (ICF)"
                                                value={c}
                                                onChange={e => {
                                                    const updated = [...m.certifications]
                                                    updated[i] = e.target.value
                                                    setMeta({ certifications: updated })
                                                }}
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() =>
                                                    setMeta({
                                                        certifications: removeItem(
                                                            m.certifications,
                                                            i
                                                        ),
                                                    })
                                                }
                                            >
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                            </Button>
                                        </div>
                                    ))}

                                    {m.certifications.length === 0 && (
                                        <p className="py-4 text-center text-sm text-muted-foreground">
                                            Aucune certification. Cliquez sur Ajouter.
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>

                    <div className="mt-6 flex justify-end">
                        <Button type="submit" disabled={processing} size="lg">
                            {processing && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Enregistrer toutes les modifications
                        </Button>
                    </div>
                </form>
            </div>
        </>
    )
}

export default AboutEdit