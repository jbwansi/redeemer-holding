import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, Plus, Trash2 } from 'lucide-react'
import { useForm } from '@inertiajs/react'

interface SubjectItem { value: string; label: string }
interface FaqItem { question: string; answer: string }

interface Meta {
    badge: string
    hero_title: string
    hero_highlight: string
    hero_subtitle: string
    form_title: string
    form_subtitle: string
    form_sla_title: string
    form_sla_text: string
    honeypot_enabled: boolean
    privacy_text: string
    privacy_url: string
    calendly_title: string
    calendly_subtitle: string
    calendly_description: string
    calendly_button: string
    calendly_social_proof: string
    email_description: string
    phone_description: string
    address_description: string
    map_embed_url: string
    subjects: SubjectItem[]
    faqs: FaqItem[]
    faq_title: string
    faq_link_label: string
    faq_link_url: string
}

interface Page {
    id: number
    title: string
    content: string
    meta: Meta | null
}

const defaultMeta: Meta = {
    badge: 'Contact',
    hero_title: 'Discutons de votre transformation',
    hero_highlight: 'transformation',
    hero_subtitle: 'Je suis la pour repondre a vos questions et vous accompagner dans votre parcours de developpement personnel et professionnel.',
    form_title: 'Envoyez-moi un message',
    form_subtitle: 'Completez le formulaire ci-dessous et je vous repondrai dans les plus brefs delais.',
    form_sla_title: 'Reponse garantie',
    form_sla_text: 'Je reponds a chaque demande qualifiee sous 24h ouvrees.',
    honeypot_enabled: true,
    privacy_text: 'En soumettant ce formulaire, vous acceptez notre politique de confidentialite.',
    privacy_url: '/politique-de-confidentialite',
    calendly_title: 'Prendre rendez-vous',
    calendly_subtitle: 'Consultation gratuite de 30 minutes',
    calendly_description: 'Reservez directement un creneau dans mon agenda pour discuter de vos besoins et objectifs.',
    calendly_button: 'Reserver un appel',
    calendly_social_proof: 'Plus de 300 accompagnements realises.',
    email_description: 'Reponse sous 24h ouvrees',
    phone_description: 'Lun-Ven, 9h-18h',
    address_description: 'Suisse',
    map_embed_url: '',
    subjects: [],
    faqs: [],
    faq_title: 'Questions frequentes',
    faq_link_label: 'Voir toutes les questions frequentes',
    faq_link_url: '/faq',
}

function updateItem<T>(arr: T[], index: number, patch: Partial<T>): T[] {
    return arr.map((item, i) => i === index ? { ...item, ...patch } : item)
}
function removeItem<T>(arr: T[], index: number): T[] {
    return arr.filter((_, i) => i !== index)
}

const ContactEdit = ({ page }: { page: Page }) => {
    const { data, setData, put, processing } = useForm<any>({
        title:   page.title,
        content: page.content ?? '',
        meta:    page.meta ?? defaultMeta,
    })

    const m: Meta = (data.meta ?? defaultMeta) as Meta
    const setMeta = (patch: Partial<Meta>) => setData('meta', { ...m, ...patch })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        put('/dashboard/contact-page')
    }

    return (
        <div className="max-w-6xl mx-auto p-4">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Page contact</h1>
                <p className="text-muted-foreground">Configurez la page Contact visible sur le site</p>
            </div>

            <form onSubmit={handleSubmit}>
                <Tabs defaultValue="hero" className="space-y-6">
                    <TabsList className="flex-wrap h-auto gap-1">
                        <TabsTrigger value="hero">Hero</TabsTrigger>
                        <TabsTrigger value="form">Formulaire</TabsTrigger>
                        <TabsTrigger value="info">Infos de contact</TabsTrigger>
                        <TabsTrigger value="subjects">Sujets</TabsTrigger>
                        <TabsTrigger value="faq">FAQ</TabsTrigger>
                        <TabsTrigger value="map">Carte</TabsTrigger>
                    </TabsList>

                    <TabsContent value="hero">
                        <Card>
                            <CardHeader><CardTitle>Hero</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label className="mb-2">Badge</Label>
                                    <Input value={m.badge} onChange={e => setMeta({ badge: e.target.value })} />
                                </div>
                                <div>
                                    <Label className="mb-2">Titre</Label>
                                    <Input value={m.hero_title} onChange={e => setMeta({ hero_title: e.target.value })} />
                                </div>
                                <div>
                                    <Label className="mb-2">Mot a surligner en rouge</Label>
                                    <Input value={m.hero_highlight} onChange={e => setMeta({ hero_highlight: e.target.value })} />
                                </div>
                                <div>
                                    <Label className="mb-2">Sous-titre</Label>
                                    <Textarea rows={3} value={m.hero_subtitle} onChange={e => setMeta({ hero_subtitle: e.target.value })} />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="form">
                        <Card>
                            <CardHeader><CardTitle>Formulaire et CTA rendez-vous</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label className="mb-2">Titre formulaire</Label>
                                    <Input value={m.form_title} onChange={e => setMeta({ form_title: e.target.value })} />
                                </div>
                                <div>
                                    <Label className="mb-2">Sous-titre formulaire</Label>
                                    <Textarea rows={2} value={m.form_subtitle} onChange={e => setMeta({ form_subtitle: e.target.value })} />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label className="mb-2">Titre bloc reassurance</Label>
                                        <Input value={m.form_sla_title} onChange={e => setMeta({ form_sla_title: e.target.value })} />
                                    </div>
                                    <div>
                                        <Label className="mb-2">Texte bloc reassurance</Label>
                                        <Input value={m.form_sla_text} onChange={e => setMeta({ form_sla_text: e.target.value })} />
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 rounded-md border p-3">
                                    <input
                                        id="honeypot_enabled"
                                        type="checkbox"
                                        checked={Boolean(m.honeypot_enabled)}
                                        onChange={e => setMeta({ honeypot_enabled: e.target.checked })}
                                        className="h-4 w-4"
                                    />
                                    <Label htmlFor="honeypot_enabled" className="mb-0">Activer l'anti-spam honeypot</Label>
                                </div>
                                <div>
                                    <Label className="mb-2">Texte legal</Label>
                                    <Input value={m.privacy_text} onChange={e => setMeta({ privacy_text: e.target.value })} />
                                </div>
                                <div>
                                    <Label className="mb-2">URL legal</Label>
                                    <Input value={m.privacy_url} onChange={e => setMeta({ privacy_url: e.target.value })} />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label className="mb-2">Titre bloc calendly</Label>
                                        <Input value={m.calendly_title} onChange={e => setMeta({ calendly_title: e.target.value })} />
                                    </div>
                                    <div>
                                        <Label className="mb-2">Sous-titre bloc calendly</Label>
                                        <Input value={m.calendly_subtitle} onChange={e => setMeta({ calendly_subtitle: e.target.value })} />
                                    </div>
                                </div>
                                <div>
                                    <Label className="mb-2">Description calendly</Label>
                                    <Textarea rows={2} value={m.calendly_description} onChange={e => setMeta({ calendly_description: e.target.value })} />
                                </div>
                                <div>
                                    <Label className="mb-2">Texte bouton calendly</Label>
                                    <Input value={m.calendly_button} onChange={e => setMeta({ calendly_button: e.target.value })} />
                                </div>
                                <div>
                                    <Label className="mb-2">Preuve sociale (ligne courte)</Label>
                                    <Input value={m.calendly_social_proof} onChange={e => setMeta({ calendly_social_proof: e.target.value })} />
                                </div>

                                <div className="rounded-xl border bg-muted/20 p-4 space-y-3">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Apercu mini (live)</p>

                                    <div className="rounded-lg border border-red-200 bg-red-50/70 px-3 py-2">
                                        <p className="text-xs font-semibold text-red-700">{m.form_sla_title || 'Titre reassurance'}</p>
                                        <p className="text-xs text-red-800/90">{m.form_sla_text || 'Texte reassurance'}</p>
                                    </div>

                                    <div className="rounded-lg border bg-background px-3 py-2">
                                        <p className="text-xs text-muted-foreground">{m.calendly_social_proof || 'Preuve sociale courte'}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="info">
                        <Card>
                            <CardHeader><CardTitle>Descriptions infos de contact</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label className="mb-2">Description email</Label>
                                    <Input value={m.email_description} onChange={e => setMeta({ email_description: e.target.value })} />
                                </div>
                                <div>
                                    <Label className="mb-2">Description telephone</Label>
                                    <Input value={m.phone_description} onChange={e => setMeta({ phone_description: e.target.value })} />
                                </div>
                                <div>
                                    <Label className="mb-2">Description adresse</Label>
                                    <Input value={m.address_description} onChange={e => setMeta({ address_description: e.target.value })} />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="subjects">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>Liste des sujets</CardTitle>
                                <Button type="button" size="sm" onClick={() => setMeta({ subjects: [...m.subjects, { value: '', label: '' }] })}>
                                    <Plus className="h-4 w-4 mr-1" /> Ajouter
                                </Button>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {m.subjects.map((item, i) => (
                                    <div key={i} className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center">
                                        <Input className="md:col-span-2" placeholder="value: coaching"
                                            value={item.value}
                                            onChange={e => setMeta({ subjects: updateItem(m.subjects, i, { value: e.target.value }) })}
                                        />
                                        <Input className="md:col-span-2" placeholder="label: Coaching individuel"
                                            value={item.label}
                                            onChange={e => setMeta({ subjects: updateItem(m.subjects, i, { label: e.target.value }) })}
                                        />
                                        <Button type="button" variant="ghost" size="sm" onClick={() => setMeta({ subjects: removeItem(m.subjects, i) })}>
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                        </Button>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="faq">
                        <div className="space-y-4">
                            <Card>
                                <CardHeader><CardTitle>Titre et lien FAQ</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label className="mb-2">Titre FAQ</Label>
                                        <Input value={m.faq_title} onChange={e => setMeta({ faq_title: e.target.value })} />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label className="mb-2">Texte lien</Label>
                                            <Input value={m.faq_link_label} onChange={e => setMeta({ faq_link_label: e.target.value })} />
                                        </div>
                                        <div>
                                            <Label className="mb-2">URL lien</Label>
                                            <Input value={m.faq_link_url} onChange={e => setMeta({ faq_link_url: e.target.value })} />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <CardTitle>Questions frequentes</CardTitle>
                                    <Button type="button" size="sm" onClick={() => setMeta({ faqs: [...m.faqs, { question: '', answer: '' }] })}>
                                        <Plus className="h-4 w-4 mr-1" /> Ajouter
                                    </Button>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {m.faqs.map((faq, i) => (
                                        <div key={i} className="border rounded-lg p-4 space-y-3">
                                            <div className="flex justify-between items-center">
                                                <span className="font-medium text-sm">FAQ {i + 1}</span>
                                                <Button type="button" variant="ghost" size="sm" onClick={() => setMeta({ faqs: removeItem(m.faqs, i) })}>
                                                    <Trash2 className="h-4 w-4 text-red-500" />
                                                </Button>
                                            </div>
                                            <Input placeholder="Question"
                                                value={faq.question}
                                                onChange={e => setMeta({ faqs: updateItem(m.faqs, i, { question: e.target.value }) })}
                                            />
                                            <Textarea rows={3} placeholder="Reponse"
                                                value={faq.answer}
                                                onChange={e => setMeta({ faqs: updateItem(m.faqs, i, { answer: e.target.value }) })}
                                            />
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="map">
                        <Card>
                            <CardHeader><CardTitle>Carte Google Maps</CardTitle></CardHeader>
                            <CardContent>
                                <Label className="mb-2">URL embed (iframe src)</Label>
                                <Textarea rows={5} value={m.map_embed_url} onChange={e => setMeta({ map_embed_url: e.target.value })} />
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

export default ContactEdit
