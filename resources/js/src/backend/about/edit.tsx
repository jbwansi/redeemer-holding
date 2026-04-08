import React from 'react'
import { Head } from '@inertiajs/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import QuillEditor from '@/components/ui/quill-editor'
import { Loader2, Plus, Trash2 } from 'lucide-react'
import { useForm } from '@inertiajs/react'

// ── Types ────────────────────────────────────────────────────────────────────
interface ValueItem    { icon: string; title: string; description: string }
interface StatItem     { value: string; label: string }
interface JourneyItem  { year: string; title: string; description: string }
interface TestimonialItem { content: string; author: string; position: string; image: string }

interface Meta {
    hero_subtitle:  string
    story_author:   string
    story_role:     string
    story_years:    string
    values:         ValueItem[]
    stats:          StatItem[]
    journey:        JourneyItem[]
    testimonials:   TestimonialItem[]
    certifications: string[]
}

interface Page {
    id: number
    title: string
    content: string
    meta: Meta | null
}

// ── Available icons ───────────────────────────────────────────────────────────
const ICONS = ['TrendingUp', 'Users', 'Award', 'CheckCircle', 'BookOpen', 'Star', 'Heart', 'Zap', 'Shield', 'Target']

// ── Defaults ──────────────────────────────────────────────────────────────────
const defaultMeta: Meta = {
    hero_subtitle: '',
    story_author: '',
    story_role: '',
    story_years: '',
    values: [],
    stats: [],
    journey: [],
    testimonials: [],
    certifications: [],
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function updateItem<T>(arr: T[], index: number, patch: Partial<T>): T[] {
    return arr.map((item, i) => i === index ? { ...item, ...patch } : item)
}
function removeItem<T>(arr: T[], index: number): T[] {
    return arr.filter((_, i) => i !== index)
}

// ── Component ─────────────────────────────────────────────────────────────────
const AboutEdit = ({ page }: { page: Page }) => {
    const { data, setData, put, processing, errors } = useForm({
        title:   page.title,
        content: page.content,
        meta:    page.meta ?? defaultMeta,
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
                    <h1 className="text-3xl font-semibold tracking-tight">Edition de la page A propos</h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Modifiez les sections hero, histoire, valeurs, parcours et temoignages depuis un seul ecran.
                    </p>
                </div>

            <form onSubmit={handleSubmit}>
                <Tabs defaultValue="hero" className="space-y-6">
                    <TabsList className="flex-wrap h-auto gap-1">
                        <TabsTrigger value="hero">Héro</TabsTrigger>
                        <TabsTrigger value="story">Mon histoire</TabsTrigger>
                        <TabsTrigger value="values">Valeurs</TabsTrigger>
                        <TabsTrigger value="stats">Statistiques</TabsTrigger>
                        <TabsTrigger value="journey">Parcours</TabsTrigger>
                        <TabsTrigger value="testimonials">Témoignages</TabsTrigger>
                        <TabsTrigger value="certifications">Certifications</TabsTrigger>
                    </TabsList>

                    {/* ── Héro ───────────────────────────────────────────── */}
                    <TabsContent value="hero">
                        <Card>
                            <CardHeader><CardTitle>Section Héro</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label className="mb-2">Titre principal</Label>
                                    <Input
                                        value={data.title}
                                        onChange={e => setData('title', e.target.value)}
                                        placeholder="Transformer des vies, une personne à la fois"
                                    />
                                    {errors.title && <p className="text-red-500 mt-1 text-sm">{errors.title}</p>}
                                </div>
                                <div>
                                    <Label className="mb-2">Sous-titre</Label>
                                    <Textarea
                                        rows={3}
                                        value={m.hero_subtitle}
                                        onChange={e => setMeta({ hero_subtitle: e.target.value })}
                                        placeholder="Découvrez mon parcours, ma philosophie…"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* ── Mon histoire ───────────────────────────────────── */}
                    <TabsContent value="story">
                        <Card>
                            <CardHeader><CardTitle>Mon histoire</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <Label className="mb-2">Nom de l'auteur</Label>
                                        <Input
                                            value={m.story_author}
                                            onChange={e => setMeta({ story_author: e.target.value })}
                                            placeholder="Jean-Bernard Wansi"
                                        />
                                    </div>
                                    <div>
                                        <Label className="mb-2">Rôle / Titre</Label>
                                        <Input
                                            value={m.story_role}
                                            onChange={e => setMeta({ story_role: e.target.value })}
                                            placeholder="Fondateur & Coach principal"
                                        />
                                    </div>
                                    <div>
                                        <Label className="mb-2">Années d'expertise</Label>
                                        <Input
                                            value={m.story_years}
                                            onChange={e => setMeta({ story_years: e.target.value })}
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
                                    {errors.content && <p className="text-red-500 mt-1 text-sm">{errors.content}</p>}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* ── Valeurs ────────────────────────────────────────── */}
                    <TabsContent value="values">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>Nos valeurs</CardTitle>
                                <Button type="button" size="sm" onClick={() =>
                                    setMeta({ values: [...m.values, { icon: 'Award', title: '', description: '' }] })
                                }>
                                    <Plus className="h-4 w-4 mr-1" /> Ajouter
                                </Button>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {m.values.map((v, i) => (
                                    <div key={i} className="border rounded-lg p-4 space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="font-medium text-sm">Valeur {i + 1}</span>
                                            <Button type="button" variant="ghost" size="sm"
                                                onClick={() => setMeta({ values: removeItem(m.values, i) })}>
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                            </Button>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                            <div>
                                                <Label className="mb-1 text-xs">Icône</Label>
                                                <select
                                                    className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                                                    value={v.icon}
                                                    onChange={e => setMeta({ values: updateItem(m.values, i, { icon: e.target.value }) })}
                                                >
                                                    {ICONS.map(icon => <option key={icon}>{icon}</option>)}
                                                </select>
                                            </div>
                                            <div className="md:col-span-2">
                                                <Label className="mb-1 text-xs">Titre</Label>
                                                <Input
                                                    value={v.title}
                                                    onChange={e => setMeta({ values: updateItem(m.values, i, { title: e.target.value }) })}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <Label className="mb-1 text-xs">Description</Label>
                                            <Textarea
                                                rows={2}
                                                value={v.description}
                                                onChange={e => setMeta({ values: updateItem(m.values, i, { description: e.target.value }) })}
                                            />
                                        </div>
                                    </div>
                                ))}
                                {m.values.length === 0 && (
                                    <p className="text-muted-foreground text-sm text-center py-4">Aucune valeur. Cliquez sur Ajouter.</p>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* ── Statistiques ───────────────────────────────────── */}
                    <TabsContent value="stats">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>Statistiques</CardTitle>
                                <Button type="button" size="sm" onClick={() =>
                                    setMeta({ stats: [...m.stats, { value: '', label: '' }] })
                                }>
                                    <Plus className="h-4 w-4 mr-1" /> Ajouter
                                </Button>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {m.stats.map((s, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <Input
                                            className="w-32"
                                            placeholder="150+"
                                            value={s.value}
                                            onChange={e => setMeta({ stats: updateItem(m.stats, i, { value: e.target.value }) })}
                                        />
                                        <Input
                                            placeholder="Heures de coaching"
                                            value={s.label}
                                            onChange={e => setMeta({ stats: updateItem(m.stats, i, { label: e.target.value }) })}
                                        />
                                        <Button type="button" variant="ghost" size="sm"
                                            onClick={() => setMeta({ stats: removeItem(m.stats, i) })}>
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                        </Button>
                                    </div>
                                ))}
                                {m.stats.length === 0 && (
                                    <p className="text-muted-foreground text-sm text-center py-4">Aucune statistique. Cliquez sur Ajouter.</p>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* ── Parcours ───────────────────────────────────────── */}
                    <TabsContent value="journey">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>Mon parcours</CardTitle>
                                <Button type="button" size="sm" onClick={() =>
                                    setMeta({ journey: [...m.journey, { year: '', title: '', description: '' }] })
                                }>
                                    <Plus className="h-4 w-4 mr-1" /> Ajouter
                                </Button>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {m.journey.map((j, i) => (
                                    <div key={i} className="border rounded-lg p-4 space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="font-medium text-sm">Étape {i + 1}</span>
                                            <Button type="button" variant="ghost" size="sm"
                                                onClick={() => setMeta({ journey: removeItem(m.journey, i) })}>
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                            </Button>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                            <div>
                                                <Label className="mb-1 text-xs">Année</Label>
                                                <Input
                                                    placeholder="2010"
                                                    value={j.year}
                                                    onChange={e => setMeta({ journey: updateItem(m.journey, i, { year: e.target.value }) })}
                                                />
                                            </div>
                                            <div className="md:col-span-3">
                                                <Label className="mb-1 text-xs">Titre</Label>
                                                <Input
                                                    placeholder="Formation initiale"
                                                    value={j.title}
                                                    onChange={e => setMeta({ journey: updateItem(m.journey, i, { title: e.target.value }) })}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <Label className="mb-1 text-xs">Description</Label>
                                            <Textarea
                                                rows={2}
                                                value={j.description}
                                                onChange={e => setMeta({ journey: updateItem(m.journey, i, { description: e.target.value }) })}
                                            />
                                        </div>
                                    </div>
                                ))}
                                {m.journey.length === 0 && (
                                    <p className="text-muted-foreground text-sm text-center py-4">Aucune étape. Cliquez sur Ajouter.</p>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* ── Témoignages ────────────────────────────────────── */}
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
                                                <Input
                                                    placeholder="Marie Dupont"
                                                    value={t.author}
                                                    onChange={e => setMeta({ testimonials: updateItem(m.testimonials, i, { author: e.target.value }) })}
                                                />
                                            </div>
                                            <div>
                                                <Label className="mb-1 text-xs">Poste / Rôle</Label>
                                                <Input
                                                    placeholder="Entrepreneure"
                                                    value={t.position}
                                                    onChange={e => setMeta({ testimonials: updateItem(m.testimonials, i, { position: e.target.value }) })}
                                                />
                                            </div>
                                            <div>
                                                <Label className="mb-1 text-xs">URL photo</Label>
                                                <Input
                                                    placeholder="https://…"
                                                    value={t.image}
                                                    onChange={e => setMeta({ testimonials: updateItem(m.testimonials, i, { image: e.target.value }) })}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <Label className="mb-1 text-xs">Contenu</Label>
                                            <Textarea
                                                rows={3}
                                                value={t.content}
                                                onChange={e => setMeta({ testimonials: updateItem(m.testimonials, i, { content: e.target.value }) })}
                                            />
                                        </div>
                                    </div>
                                ))}
                                {m.testimonials.length === 0 && (
                                    <p className="text-muted-foreground text-sm text-center py-4">Aucun témoignage. Cliquez sur Ajouter.</p>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* ── Certifications ─────────────────────────────────── */}
                    <TabsContent value="certifications">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>Certifications</CardTitle>
                                <Button type="button" size="sm" onClick={() =>
                                    setMeta({ certifications: [...m.certifications, ''] })
                                }>
                                    <Plus className="h-4 w-4 mr-1" /> Ajouter
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
                                        <Button type="button" variant="ghost" size="sm"
                                            onClick={() => setMeta({ certifications: removeItem(m.certifications, i) })}>
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                        </Button>
                                    </div>
                                ))}
                                {m.certifications.length === 0 && (
                                    <p className="text-muted-foreground text-sm text-center py-4">Aucune certification. Cliquez sur Ajouter.</p>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                <div className="flex justify-end mt-6">
                    <Button type="submit" disabled={processing} size="lg">
                        {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Enregistrer toutes les modifications
                    </Button>
                </div>
            </form>
        </div>
        </>
    )
}

export default AboutEdit
