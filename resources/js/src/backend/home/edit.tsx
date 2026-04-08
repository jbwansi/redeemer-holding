import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, Plus, Trash2 } from 'lucide-react'
import { useForm } from '@inertiajs/react'

// ── Types ────────────────────────────────────────────────────────────────────
interface HeroStep         { icon: string; title: string; description: string }
interface HeroTestimonial  { content: string; author: string; position: string }
interface HeroStat         { value: string; label: string }
interface ProcessStep      { icon: string; title: string; description: string }
interface AudienceCard     { icon: string; title: string; description: string }
interface TestimonialItem  { content: string; author: string; position: string; image: string }
interface CtaBenefit       { text: string }
interface StatsBandItem    { value: string; label: string }

interface Meta {
    // Hero
    hero_badge:        string
    hero_title_line1:  string
    hero_title_line2:  string
    hero_subtitle:     string
    hero_cta_text:     string
    hero_cta_url:      string
    hero_image:        string
    hero_steps:        HeroStep[]
    hero_testimonial:  HeroTestimonial
    hero_stats:        HeroStat[]
    // Stats band
    stats:             StatsBandItem[]
    // Process
    process_title:     string
    process_subtitle:  string
    process:           ProcessStep[]
    // For whom
    for_whom_title:    string
    for_whom_subtitle: string
    for_whom:          AudienceCard[]
    // Testimonials
    testimonials_title: string
    testimonials:       TestimonialItem[]
    // Blog
    blog_title:        string
    // Formations
    formations_title:  string
    // Welcome video
    video_enabled:  boolean
    video_url:      string
    video_title:    string
    video_subtitle: string
    // Events gallery
    events_gallery_enabled: boolean
    events_gallery_title: string
    events_gallery_images: string[]
    events_gallery_captions: string[]
    // CTA
    cta_benefits:      CtaBenefit[]
}

interface Page {
    id: number
    title: string
    content: string
    meta: Meta | null
}

// ── Icon choices ──────────────────────────────────────────────────────────────
const STEP_ICONS  = ['Clock', 'Brain', 'Zap', 'Target', 'TrendingUp', 'Star', 'Rocket', 'CheckCircle', 'Award', 'Lightbulb', 'Shield', 'Heart', 'BookOpen', 'Users', 'Calendar', 'MessageCircle', 'Search', 'Clipboard']
const WHOM_ICONS  = ['Briefcase', 'TrendingUp', 'Users', 'Target', 'BookOpen', 'Heart', 'Award', 'Rocket', 'Star', 'Lightbulb', 'GraduationCap', 'UserCheck', 'Zap', 'Shield', 'CheckCircle']

// ── Default meta ─────────────────────────────────────────────────────────────
const defaultMeta: Meta = {
    hero_badge:        'Coaching de vie',
    hero_title_line1:  'La vie que vous méritez',
    hero_title_line2:  'à portée de main !',
    hero_subtitle:     "Bienvenue sur le chemin de la transformation par les valeurs. Je vous aide à découvrir votre véritable potentiel et à vivre une vie épanouie.",
    hero_cta_text:     'Découvrir mes formations',
    hero_cta_url:      '',
    hero_image:        '/assets/images/portrait.jpg',
    hero_steps: [
        { icon: 'Clock', title: 'Révélez votre potentiel',     description: 'Découvrez vos forces cachées et définissez votre vision personnelle' },
        { icon: 'Brain', title: 'Transformez vos habitudes',   description: 'Développez des routines quotidiennes soutenues par la science' },
        { icon: 'Zap',   title: 'Optimisez votre productivité', description: 'Atteignez vos objectifs avec mon système éprouvé' },
    ],
    hero_testimonial:  { content: "Cette méthode a complètement transformé ma productivité et ma vision de la vie.", author: "Marie L.", position: "Entrepreneure" },
    hero_stats:        [{ value: '97%', label: 'Satisfaction' }, { value: '3k+', label: 'Vies transformées' }],
    stats:             [],
    process_title:     "Mon processus d'accompagnement",
    process_subtitle:  '',
    process:           [],
    for_whom_title:    'Ce coaching est fait pour vous si…',
    for_whom_subtitle: '',
    for_whom:          [],
    testimonials_title: 'Ce que disent mes clients',
    testimonials:      [],
    blog_title:        'Derniers articles',
    formations_title:  'Prochaines formations',
    video_enabled:  false,
    video_url:      '',
    video_title:    'Bienvenue dans mon univers',
    video_subtitle: 'Une courte vidéo pour faire connaissance et vous présenter ma démarche.',
    events_gallery_enabled: true,
    events_gallery_title: 'Galerie photos',
    events_gallery_images: [],
    events_gallery_captions: [],
    cta_benefits:      [],
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function updateItem<T>(arr: T[], index: number, patch: Partial<T>): T[] {
    return arr.map((item, i) => i === index ? { ...item, ...patch } : item)
}
function removeItem<T>(arr: T[], index: number): T[] {
    return arr.filter((_, i) => i !== index)
}

// ── Component ─────────────────────────────────────────────────────────────────
const HomeEdit = ({ page }: { page: Page }) => {
    const { data, setData, post, processing, errors } = useForm<any>({
        title:   page.title,
        content: page.content ?? '',
        meta:    page.meta ?? defaultMeta,
        gallery_uploads: [] as (File | null)[],
        _method: 'put',
    })

    const m: Meta = (data.meta ?? defaultMeta) as Meta
    const setMeta = (patch: Partial<Meta>) => setData('meta', { ...m, ...patch })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        post('/dashboard/accueil', {
            forceFormData: true,
        })
    }

    return (
            <div className="max-w-6xl mx-auto p-4">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Page d'accueil</h1>
                    <p className="text-muted-foreground">Configurez intégralement le contenu de la page d'accueil</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <Tabs defaultValue="hero" className="space-y-6">
                        <TabsList className="flex-wrap h-auto gap-1">
                            <TabsTrigger value="hero">Héro</TabsTrigger>
                            <TabsTrigger value="stats">Statistiques</TabsTrigger>
                            <TabsTrigger value="process">Processus</TabsTrigger>
                            <TabsTrigger value="for-whom">Pour qui</TabsTrigger>
                            <TabsTrigger value="testimonials">Témoignages</TabsTrigger>
                            <TabsTrigger value="sections">Titres sections</TabsTrigger>
                            <TabsTrigger value="cta">CTA</TabsTrigger>
                        </TabsList>

                        {/* ── Héro ─────────────────────────────────────── */}
                        <TabsContent value="hero">
                            <div className="space-y-6">
                                <Card>
                                    <CardHeader><CardTitle>Textes principaux</CardTitle></CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label className="mb-2">Badge (libellé rouge)</Label>
                                                <Input
                                                    value={m.hero_badge}
                                                    onChange={e => setMeta({ hero_badge: e.target.value })}
                                                    placeholder="Coaching de vie"
                                                />
                                            </div>
                                            <div>
                                                <Label className="mb-2">Image portrait (URL)</Label>
                                                <Input
                                                    value={m.hero_image}
                                                    onChange={e => setMeta({ hero_image: e.target.value })}
                                                    placeholder="/assets/images/portrait.jpg"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <Label className="mb-2">Titre — Ligne 1</Label>
                                            <Input
                                                value={m.hero_title_line1}
                                                onChange={e => setMeta({ hero_title_line1: e.target.value })}
                                                placeholder="La vie que vous méritez"
                                            />
                                        </div>
                                        <div>
                                            <Label className="mb-2">Titre — Ligne 2 (rouge)</Label>
                                            <Input
                                                value={m.hero_title_line2}
                                                onChange={e => setMeta({ hero_title_line2: e.target.value })}
                                                placeholder="à portée de main !"
                                            />
                                        </div>
                                        <div>
                                            <Label className="mb-2">Sous-titre / description</Label>
                                            <Textarea
                                                rows={3}
                                                value={m.hero_subtitle}
                                                onChange={e => setMeta({ hero_subtitle: e.target.value })}
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label className="mb-2">Texte du bouton CTA</Label>
                                                <Input
                                                    value={m.hero_cta_text}
                                                    onChange={e => setMeta({ hero_cta_text: e.target.value })}
                                                    placeholder="Découvrir mes formations"
                                                />
                                            </div>
                                            <div>
                                                <Label className="mb-2">URL du bouton (vide = formations)</Label>
                                                <Input
                                                    value={m.hero_cta_url}
                                                    onChange={e => setMeta({ hero_cta_url: e.target.value })}
                                                    placeholder="/formations"
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Hero 3 steps */}
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between">
                                        <CardTitle>Les 3 étapes (cartes)</CardTitle>
                                        <Button type="button" size="sm" onClick={() =>
                                            setMeta({ hero_steps: [...m.hero_steps, { icon: 'CheckCircle', title: '', description: '' }] })
                                        }>
                                            <Plus className="h-4 w-4 mr-1" /> Ajouter
                                        </Button>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {m.hero_steps.map((s, i) => (
                                            <div key={i} className="border rounded-lg p-4 space-y-3">
                                                <div className="flex justify-between items-center">
                                                    <span className="font-medium text-sm">Étape {i + 1}</span>
                                                    <Button type="button" variant="ghost" size="sm"
                                                        onClick={() => setMeta({ hero_steps: removeItem(m.hero_steps, i) })}>
                                                        <Trash2 className="h-4 w-4 text-red-500" />
                                                    </Button>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                                    <div>
                                                        <Label className="mb-1 text-xs">Icône</Label>
                                                        <select className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                                                            value={s.icon}
                                                            onChange={e => setMeta({ hero_steps: updateItem(m.hero_steps, i, { icon: e.target.value }) })}>
                                                            {STEP_ICONS.map(ic => <option key={ic}>{ic}</option>)}
                                                        </select>
                                                    </div>
                                                    <div className="md:col-span-3">
                                                        <Label className="mb-1 text-xs">Titre</Label>
                                                        <Input value={s.title}
                                                            onChange={e => setMeta({ hero_steps: updateItem(m.hero_steps, i, { title: e.target.value }) })} />
                                                    </div>
                                                </div>
                                                <div>
                                                    <Label className="mb-1 text-xs">Description</Label>
                                                    <Textarea rows={2} value={s.description}
                                                        onChange={e => setMeta({ hero_steps: updateItem(m.hero_steps, i, { description: e.target.value }) })} />
                                                </div>
                                            </div>
                                        ))}
                                        {m.hero_steps.length === 0 && (
                                            <p className="text-muted-foreground text-sm text-center py-4">Aucune étape. Cliquez sur Ajouter.</p>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Hero testimonial card */}
                                <Card>
                                    <CardHeader><CardTitle>Témoignage flottant (hero)</CardTitle></CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div>
                                                <Label className="mb-1 text-xs">Auteur</Label>
                                                <Input value={m.hero_testimonial.author}
                                                    onChange={e => setMeta({ hero_testimonial: { ...m.hero_testimonial, author: e.target.value } })} />
                                            </div>
                                            <div>
                                                <Label className="mb-1 text-xs">Poste / Rôle</Label>
                                                <Input value={m.hero_testimonial.position}
                                                    onChange={e => setMeta({ hero_testimonial: { ...m.hero_testimonial, position: e.target.value } })} />
                                            </div>
                                        </div>
                                        <div>
                                            <Label className="mb-1 text-xs">Contenu du témoignage</Label>
                                            <Textarea rows={3} value={m.hero_testimonial.content}
                                                onChange={e => setMeta({ hero_testimonial: { ...m.hero_testimonial, content: e.target.value } })} />
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Hero stats badge */}
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between">
                                        <CardTitle>Badge statistiques (hero)</CardTitle>
                                        <Button type="button" size="sm" onClick={() =>
                                            setMeta({ hero_stats: [...m.hero_stats, { value: '', label: '' }] })
                                        }>
                                            <Plus className="h-4 w-4 mr-1" /> Ajouter
                                        </Button>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        {m.hero_stats.map((s, i) => (
                                            <div key={i} className="flex items-center gap-3">
                                                <Input className="w-28" placeholder="97%" value={s.value}
                                                    onChange={e => setMeta({ hero_stats: updateItem(m.hero_stats, i, { value: e.target.value }) })} />
                                                <Input placeholder="Satisfaction" value={s.label}
                                                    onChange={e => setMeta({ hero_stats: updateItem(m.hero_stats, i, { label: e.target.value }) })} />
                                                <Button type="button" variant="ghost" size="sm"
                                                    onClick={() => setMeta({ hero_stats: removeItem(m.hero_stats, i) })}>
                                                    <Trash2 className="h-4 w-4 text-red-500" />
                                                </Button>
                                            </div>
                                        ))}
                                        {m.hero_stats.length === 0 && (
                                            <p className="text-muted-foreground text-sm text-center py-4">Aucune statistique. Cliquez sur Ajouter.</p>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        {/* ── Statistiques (bande rouge) ─────────────── */}
                        <TabsContent value="stats">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <CardTitle>Bande de statistiques</CardTitle>
                                    <Button type="button" size="sm" onClick={() =>
                                        setMeta({ stats: [...m.stats, { value: '', label: '' }] })
                                    }>
                                        <Plus className="h-4 w-4 mr-1" /> Ajouter
                                    </Button>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <p className="text-muted-foreground text-sm">
                                        Les compteurs animés sur fond rouge. Exemples : 150+ → Clients, 97% → Satisfaction. Laissez vide pour masquer la section.
                                    </p>
                                    {m.stats.map((s, i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <Input className="w-32" placeholder="150+" value={s.value}
                                                onChange={e => setMeta({ stats: updateItem(m.stats, i, { value: e.target.value }) })} />
                                            <Input placeholder="Clients accompagnés" value={s.label}
                                                onChange={e => setMeta({ stats: updateItem(m.stats, i, { label: e.target.value }) })} />
                                            <Button type="button" variant="ghost" size="sm"
                                                onClick={() => setMeta({ stats: removeItem(m.stats, i) })}>
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                            </Button>
                                        </div>
                                    ))}
                                    {m.stats.length === 0 && (
                                        <p className="text-muted-foreground text-sm text-center py-8">Aucune statistique → section masquée. Cliquez sur Ajouter.</p>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* ── Processus ─────────────────────────────── */}
                        <TabsContent value="process">
                            <div className="space-y-4">
                                <Card>
                                    <CardHeader><CardTitle>En-tête de section</CardTitle></CardHeader>
                                    <CardContent className="space-y-3">
                                        <div>
                                            <Label className="mb-2">Titre</Label>
                                            <Input value={m.process_title}
                                                onChange={e => setMeta({ process_title: e.target.value })}
                                                placeholder="Mon processus d'accompagnement" />
                                        </div>
                                        <div>
                                            <Label className="mb-2">Sous-titre (optionnel)</Label>
                                            <Textarea rows={2} value={m.process_subtitle}
                                                onChange={e => setMeta({ process_subtitle: e.target.value })} />
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between">
                                        <CardTitle>Étapes du processus</CardTitle>
                                        <Button type="button" size="sm" onClick={() =>
                                            setMeta({ process: [...m.process, { icon: 'CheckCircle', title: '', description: '' }] })
                                        }>
                                            <Plus className="h-4 w-4 mr-1" /> Ajouter
                                        </Button>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {m.process.map((s, i) => (
                                            <div key={i} className="border rounded-lg p-4 space-y-3">
                                                <div className="flex justify-between items-center">
                                                    <span className="font-medium text-sm">Étape {i + 1}</span>
                                                    <Button type="button" variant="ghost" size="sm"
                                                        onClick={() => setMeta({ process: removeItem(m.process, i) })}>
                                                        <Trash2 className="h-4 w-4 text-red-500" />
                                                    </Button>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                                    <div>
                                                        <Label className="mb-1 text-xs">Icône</Label>
                                                        <select className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                                                            value={s.icon}
                                                            onChange={e => setMeta({ process: updateItem(m.process, i, { icon: e.target.value }) })}>
                                                            {STEP_ICONS.map(ic => <option key={ic}>{ic}</option>)}
                                                        </select>
                                                    </div>
                                                    <div className="md:col-span-3">
                                                        <Label className="mb-1 text-xs">Titre</Label>
                                                        <Input value={s.title}
                                                            onChange={e => setMeta({ process: updateItem(m.process, i, { title: e.target.value }) })} />
                                                    </div>
                                                </div>
                                                <div>
                                                    <Label className="mb-1 text-xs">Description</Label>
                                                    <Textarea rows={2} value={s.description}
                                                        onChange={e => setMeta({ process: updateItem(m.process, i, { description: e.target.value }) })} />
                                                </div>
                                            </div>
                                        ))}
                                        {m.process.length === 0 && (
                                            <p className="text-muted-foreground text-sm text-center py-4">Aucune étape → section masquée. Cliquez sur Ajouter.</p>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        {/* ── Pour qui ──────────────────────────────── */}
                        <TabsContent value="for-whom">
                            <div className="space-y-4">
                                <Card>
                                    <CardHeader><CardTitle>En-tête de section</CardTitle></CardHeader>
                                    <CardContent className="space-y-3">
                                        <div>
                                            <Label className="mb-2">Titre</Label>
                                            <Input value={m.for_whom_title}
                                                onChange={e => setMeta({ for_whom_title: e.target.value })}
                                                placeholder="Ce coaching est fait pour vous si…" />
                                        </div>
                                        <div>
                                            <Label className="mb-2">Sous-titre (optionnel)</Label>
                                            <Textarea rows={2} value={m.for_whom_subtitle}
                                                onChange={e => setMeta({ for_whom_subtitle: e.target.value })} />
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between">
                                        <CardTitle>Profils cibles</CardTitle>
                                        <Button type="button" size="sm" onClick={() =>
                                            setMeta({ for_whom: [...m.for_whom, { icon: 'Briefcase', title: '', description: '' }] })
                                        }>
                                            <Plus className="h-4 w-4 mr-1" /> Ajouter
                                        </Button>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {m.for_whom.map((c, i) => (
                                            <div key={i} className="border rounded-lg p-4 space-y-3">
                                                <div className="flex justify-between items-center">
                                                    <span className="font-medium text-sm">Profil {i + 1}</span>
                                                    <Button type="button" variant="ghost" size="sm"
                                                        onClick={() => setMeta({ for_whom: removeItem(m.for_whom, i) })}>
                                                        <Trash2 className="h-4 w-4 text-red-500" />
                                                    </Button>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                                    <div>
                                                        <Label className="mb-1 text-xs">Icône</Label>
                                                        <select className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                                                            value={c.icon}
                                                            onChange={e => setMeta({ for_whom: updateItem(m.for_whom, i, { icon: e.target.value }) })}>
                                                            {WHOM_ICONS.map(ic => <option key={ic}>{ic}</option>)}
                                                        </select>
                                                    </div>
                                                    <div className="md:col-span-3">
                                                        <Label className="mb-1 text-xs">Titre</Label>
                                                        <Input value={c.title}
                                                            onChange={e => setMeta({ for_whom: updateItem(m.for_whom, i, { title: e.target.value }) })} />
                                                    </div>
                                                </div>
                                                <div>
                                                    <Label className="mb-1 text-xs">Description</Label>
                                                    <Textarea rows={2} value={c.description}
                                                        onChange={e => setMeta({ for_whom: updateItem(m.for_whom, i, { description: e.target.value }) })} />
                                                </div>
                                            </div>
                                        ))}
                                        {m.for_whom.length === 0 && (
                                            <p className="text-muted-foreground text-sm text-center py-4">Aucun profil → section masquée. Cliquez sur Ajouter.</p>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        {/* ── Témoignages ───────────────────────────── */}
                        <TabsContent value="testimonials">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <CardTitle>Témoignages</CardTitle>
                                    <Button type="button" size="sm" onClick={() =>
                                        setMeta({ testimonials: [...m.testimonials, { content: '', author: '', position: '', image: '' }] })
                                    }>
                                        <Plus className="h-4 w-4 mr-1" /> Ajouter
                                    </Button>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label className="mb-2">Titre de la section</Label>
                                        <Input value={m.testimonials_title}
                                            onChange={e => setMeta({ testimonials_title: e.target.value })}
                                            placeholder="Ce que disent mes clients" />
                                    </div>
                                    {m.testimonials.map((t, i) => (
                                        <div key={i} className="border rounded-lg p-4 space-y-3">
                                            <div className="flex justify-between items-center">
                                                <span className="font-medium text-sm">Témoignage {i + 1}</span>
                                                <Button type="button" variant="ghost" size="sm"
                                                    onClick={() => setMeta({ testimonials: removeItem(m.testimonials, i) })}>
                                                    <Trash2 className="h-4 w-4 text-red-500" />
                                                </Button>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                <div>
                                                    <Label className="mb-1 text-xs">Auteur</Label>
                                                    <Input value={t.author}
                                                        onChange={e => setMeta({ testimonials: updateItem(m.testimonials, i, { author: e.target.value }) })} />
                                                </div>
                                                <div>
                                                    <Label className="mb-1 text-xs">Poste / Rôle</Label>
                                                    <Input value={t.position}
                                                        onChange={e => setMeta({ testimonials: updateItem(m.testimonials, i, { position: e.target.value }) })} />
                                                </div>
                                                <div>
                                                    <Label className="mb-1 text-xs">URL photo (optionnel)</Label>
                                                    <Input value={t.image}
                                                        onChange={e => setMeta({ testimonials: updateItem(m.testimonials, i, { image: e.target.value }) })} />
                                                </div>
                                            </div>
                                            <div>
                                                <Label className="mb-1 text-xs">Contenu</Label>
                                                <Textarea rows={3} value={t.content}
                                                    onChange={e => setMeta({ testimonials: updateItem(m.testimonials, i, { content: e.target.value }) })} />
                                            </div>
                                        </div>
                                    ))}
                                    {m.testimonials.length === 0 && (
                                        <p className="text-muted-foreground text-sm text-center py-4">Aucun témoignage → section masquée. Cliquez sur Ajouter.</p>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* ── Titres des sections DB ─────────────────── */}
                        <TabsContent value="sections">
                            <Card>
                                <CardHeader><CardTitle>Titres des sections dynamiques</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    <p className="text-muted-foreground text-sm">
                                        Ces sections affichent des données de la base de données (formations publiées, articles). Vous pouvez personnaliser leur titre.
                                    </p>
                                    <div>
                                        <Label className="mb-2">Titre section Formations</Label>
                                        <Input value={m.formations_title}
                                            onChange={e => setMeta({ formations_title: e.target.value })}
                                            placeholder="Prochaines formations" />
                                    </div>
                                    <div>
                                        <Label className="mb-2">Titre section Blog</Label>
                                        <Input value={m.blog_title}
                                            onChange={e => setMeta({ blog_title: e.target.value })}
                                            placeholder="Derniers articles" />
                                    </div>

                                    {/* ── Vidéo de bienvenue ── */}
                                    <hr className="my-2" />
                                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Vidéo de bienvenue</p>
                                    <div>
                                        <div className="flex items-center justify-between rounded-lg border p-3">
                                            <div>
                                                <Label className="mb-0">Activer la vidéo de bienvenue</Label>
                                                <p className="text-muted-foreground text-xs">Affiche une vidéo YouTube / Vimeo juste après le Hero.</p>
                                            </div>
                                            <Switch
                                                checked={m.video_enabled ?? false}
                                                onCheckedChange={(checked) => setMeta({ video_enabled: checked })}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <Label className="mb-2">URL YouTube ou Vimeo</Label>
                                        <Input
                                            value={m.video_url}
                                            onChange={e => setMeta({ video_url: e.target.value })}
                                            placeholder="https://www.youtube.com/watch?v=..."
                                        />
                                    </div>
                                    <div>
                                        <Label className="mb-2">Titre de la section vidéo</Label>
                                        <Input
                                            value={m.video_title}
                                            onChange={e => setMeta({ video_title: e.target.value })}
                                            placeholder="Bienvenue dans mon univers"
                                        />
                                    </div>
                                    <div>
                                        <Label className="mb-2">Sous-titre de la section vidéo</Label>
                                        <Input
                                            value={m.video_subtitle}
                                            onChange={e => setMeta({ video_subtitle: e.target.value })}
                                            placeholder="Une courte vidéo pour faire connaissance…"
                                        />
                                    </div>

                                    {/* ── Galerie photos ── */}
                                    <hr className="my-2" />
                                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Galerie photos</p>
                                    <div>
                                        <div className="flex items-center justify-between rounded-lg border p-3">
                                            <div>
                                                <Label className="mb-0">Activer la galerie photos</Label>
                                                <p className="text-muted-foreground text-xs">Désactive complètement la section sur la page d'accueil.</p>
                                            </div>
                                            <Switch
                                                checked={m.events_gallery_enabled ?? true}
                                                onCheckedChange={(checked) => setMeta({ events_gallery_enabled: checked })}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <Label className="mb-2">Titre section Galerie photos</Label>
                                        <Input value={m.events_gallery_title}
                                            onChange={e => setMeta({ events_gallery_title: e.target.value })}
                                            placeholder="Galerie photos" />
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <Label>Photos de la galerie</Label>
                                            <div className="flex items-center gap-2">
                                                {/* Multi-upload bouton */}
                                                <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground shadow-sm transition hover:bg-primary/90">
                                                    <Plus className="h-3.5 w-3.5" /> Télécharger des photos
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        multiple
                                                        className="sr-only"
                                                        onChange={e => {
                                                            const files = Array.from(e.target.files ?? [])
                                                            if (!files.length) return
                                                            const currentImages = m.events_gallery_images ?? []
                                                            const currentCaptions = m.events_gallery_captions ?? []
                                                            const currentUploads = [...(data.gallery_uploads ?? [])]
                                                            const startIndex = currentImages.length
                                                            setMeta({
                                                                events_gallery_images: [...currentImages, ...files.map(() => '')],
                                                                events_gallery_captions: [...currentCaptions, ...files.map(() => '')],
                                                            })
                                                            files.forEach((file, i) => { currentUploads[startIndex + i] = file })
                                                            setData('gallery_uploads', currentUploads)
                                                            e.target.value = ''
                                                        }}
                                                    />
                                                </label>
                                                {/* Ajouter une URL */}
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => {
                                                        setMeta({
                                                            events_gallery_images: [...(m.events_gallery_images ?? []), ''],
                                                            events_gallery_captions: [...(m.events_gallery_captions ?? []), ''],
                                                        })
                                                    }}
                                                >
                                                    <Plus className="h-4 w-4 mr-1" /> URL
                                                </Button>
                                            </div>
                                        </div>
                                        <p className="text-muted-foreground text-sm">
                                            Téléchargez plusieurs photos à la fois ou collez des URLs.
                                        </p>
                                        {(m.events_gallery_images ?? []).map((img, i) => (
                                            <div key={i} className="flex items-center gap-3">
                                                <div className="flex-1 space-y-2">
                                                    {data.gallery_uploads?.[i] ? (
                                                        <p className="truncate rounded-md border bg-muted px-3 py-2 text-sm text-muted-foreground">
                                                            📎 {(data.gallery_uploads[i] as File).name}
                                                        </p>
                                                    ) : (
                                                        <Input
                                                            placeholder="https://..."
                                                            value={img}
                                                            onChange={e => {
                                                                const updated = [...(m.events_gallery_images ?? [])]
                                                                updated[i] = e.target.value
                                                                setMeta({ events_gallery_images: updated })
                                                            }}
                                                        />
                                                    )}
                                                    <Input
                                                        placeholder="Légende (optionnelle)"
                                                        value={(m.events_gallery_captions ?? [])[i] ?? ''}
                                                        onChange={e => {
                                                            const updated = [...(m.events_gallery_captions ?? [])]
                                                            updated[i] = e.target.value
                                                            setMeta({ events_gallery_captions: updated })
                                                        }}
                                                    />
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        setMeta({ events_gallery_images: removeItem(m.events_gallery_images ?? [], i) })
                                                        setMeta({ events_gallery_captions: removeItem(m.events_gallery_captions ?? [], i) })
                                                        setData('gallery_uploads', removeItem(data.gallery_uploads ?? [], i))
                                                    }}
                                                >
                                                    <Trash2 className="h-4 w-4 text-red-500" />
                                                </Button>
                                            </div>
                                        ))}
                                        {(m.events_gallery_images ?? []).length === 0 && (
                                            <p className="text-muted-foreground text-sm text-center py-2">Aucune photo ajoutée.</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* ── CTA ───────────────────────────────────── */}
                        <TabsContent value="cta">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <CardTitle>Avantages (liste dans le CTA Calendly)</CardTitle>
                                    <Button type="button" size="sm" onClick={() =>
                                        setMeta({ cta_benefits: [...m.cta_benefits, { text: '' }] })
                                    }>
                                        <Plus className="h-4 w-4 mr-1" /> Ajouter
                                    </Button>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <p className="text-muted-foreground text-sm">
                                        Ces points apparaissent dans la section de prise de rendez-vous. Laissez vide pour utiliser les valeurs par défaut.
                                    </p>
                                    {m.cta_benefits.map((b, i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <Input
                                                placeholder="Séance de découverte gratuite"
                                                value={b.text}
                                                onChange={e => setMeta({ cta_benefits: updateItem(m.cta_benefits, i, { text: e.target.value }) })}
                                            />
                                            <Button type="button" variant="ghost" size="sm"
                                                onClick={() => setMeta({ cta_benefits: removeItem(m.cta_benefits, i) })}>
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                            </Button>
                                        </div>
                                    ))}
                                    {m.cta_benefits.length === 0 && (
                                        <p className="text-muted-foreground text-sm text-center py-4">Aucun avantage. Cliquez sur Ajouter.</p>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>

                    <div className="mt-8 flex justify-end">
                        <Button type="submit" disabled={processing} className="min-w-32">
                            {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Enregistrer
                        </Button>
                    </div>
                </form>
            </div>
    )
}

export default HomeEdit
