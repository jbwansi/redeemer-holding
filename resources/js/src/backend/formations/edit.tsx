import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MapPin, Users, ImagePlus, Loader2, X, Link as LinkIcon } from 'lucide-react'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { router, useForm } from '@inertiajs/react'
import QuillEditor from '@/components/ui/quill-editor'
import { route } from 'ziggy-js'

interface EditFormationProps {
    formation: {
        id: number
        title: string
        excerpt: string
        content: string
        location: string
        start_date: string
        end_date: string
        price: number | null
        max_participants: number | null
        meeting_link: string
        featured_image: any
        is_published: boolean
        tags: string[]
        is_featured: boolean
    }
}

const EditFormation = ({ formation }: EditFormationProps) => {
    const { data, setData, post, processing, errors } = useForm({
        title: formation.title,
        excerpt: formation.excerpt,
        content: formation.content,
        location: formation.location,
        start_date: formation.start_date,
        end_date: formation.end_date,
        price: (formation.price ?? 0).toString(),
        max_participants: (formation.max_participants ?? 0).toString(),
        meeting_link: formation.meeting_link || '',
        featured_image: null,
        is_published: formation.is_published,
        is_featured: formation.is_featured,
        tags: formation?.tags || [],
        _method: 'POST'
    })

    const [preview, setPreview] = React.useState<string | null>(formation.featured_image?.medium ?? null)
    const [inputValue, setInputValue] = React.useState('')

    const updateDateField = React.useCallback(
        (field: 'start_date' | 'end_date', updater: (date: Date) => void) => {
            const rawValue = data[field]
            const baseDate = rawValue ? new Date(rawValue) : new Date()
            if (Number.isNaN(baseDate.getTime())) return
            updater(baseDate)
            setData(field, baseDate.toISOString())
        },
        [data, setData]
    )

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] as any
        if (file) {
            setData('featured_image', file)
            setPreview(URL.createObjectURL(file))
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        post(route('formations.update', formation.id))
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            if (inputValue.trim()) {
                const newTags = [...data.tags, inputValue.trim()]
                setData('tags', newTags)
                setInputValue('')
            }
        }
    }

    const removeTag = (tagToRemove: string) => {
        const newTags = data.tags.filter((tag: string) => tag !== tagToRemove)
        setData('tags', newTags)
    }

    return (
        <div className="p-3 max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Modifier la formation</h1>
                <p className="text-muted-foreground">Modifiez les informations de votre formation</p>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Colonne gauche */}
                <div className="space-y-6">
                    <Card>
                        <CardContent className="p-6 space-y-6">
                            <div
                                className={cn(
                                    "relative aspect-video rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors",
                                    "flex flex-col items-center justify-center text-center p-6",
                                    "cursor-pointer overflow-hidden"
                                )}
                                onClick={() => document.getElementById('image-upload')?.click()}
                            >
                                <input
                                    id="image-upload"
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                />
                                {preview ? (
                                    <img
                                        src={preview}
                                        alt="Preview"
                                        className="absolute inset-0 w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="flex flex-col items-center">
                                        <ImagePlus className="h-12 w-12 text-muted-foreground mb-4" />
                                        <p className="text-lg font-medium mb-2">Choisir une image</p>
                                        <p className="text-sm text-muted-foreground">
                                            PNG, JPG ou GIF jusqu'à 2MB
                                        </p>
                                    </div>
                                )}
                                {errors.featured_image && (
                                    <p className="text-red-500 text-sm mt-2">{errors.featured_image}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="title">Titre de la formation</Label>
                                <Input
                                    id="title"
                                    placeholder="Entrez le titre..."
                                    value={data.title}
                                    onChange={e => setData('title', e.target.value)}
                                    className="h-12"
                                />
                                {errors.title && <p className="text-red-500 text-sm mt-2">{errors.title}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="location">Lieu</Label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
                                    <Input
                                        id="location"
                                        placeholder="Lieu..."
                                        value={data.location}
                                        onChange={e => setData('location', e.target.value)}
                                        className="h-12 pl-11"
                                    />
                                </div>
                                {errors.location && <p className="text-red-500 text-sm mt-2">{errors.location}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="price">Prix</Label>
                                    <div className="relative">
                                        <Input
                                            type="number"
                                            id="price"
                                            min="0"
                                            step="0.01"
                                            readOnly={formation.is_published}
                                            disabled={formation.is_published}
                                            value={data.price}
                                            onChange={e => setData('price', e.target.value)}
                                            className="h-12"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                                            CHF
                                        </span>
                                    </div>
                                    {formation.is_published && <div className="text-xs italic">Impossible de modifier le prix car la formation est déjà publiée</div>}
                                    {errors.price && <p className="text-red-500 text-sm mt-2">{errors.price}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="max_participants">Participants</Label>
                                    <div className="relative">
                                        <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
                                        <Input
                                            type="number"
                                            id="max_participants"
                                            min="0"
                                            value={data.max_participants}
                                            onChange={e => setData('max_participants', e.target.value)}
                                            className="h-12 pl-11"
                                        />
                                    </div>
                                    {errors.max_participants && <p className="text-red-500 text-sm mt-2">{errors.max_participants}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="meeting_link">Lien de meeting</Label>
                                <div className="relative">
                                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
                                    <Input
                                        id="meeting_link"
                                        type="url"
                                        placeholder="https://meet.google.com/xxx-xxxx-xxx"
                                        value={data.meeting_link}
                                        onChange={e => setData('meeting_link', e.target.value)}
                                        className="h-12 pl-11"
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Lien optionnel pour les réunions en ligne (Google Meet, Zoom, etc.)
                                </p>
                                {errors.meeting_link && <p className="text-red-500 text-sm mt-2">{errors.meeting_link}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label>Tags <span className="text-xs text-muted-foreground">(Appuyez sur Entrée pour ajouter un tag)</span></Label>
                                <div className="border rounded-lg p-2 flex flex-wrap gap-2">
                                    {data.tags.map((tag: string, index: number) => (
                                        <span
                                            key={index}
                                            className="bg-primary/10 text-primary px-2 py-1 rounded-full text-sm flex items-center gap-1"
                                        >
                                            {tag}
                                            <button
                                                onClick={() => removeTag(tag)}
                                                type="button"
                                                className="hover:bg-primary/20 rounded-full"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </span>
                                    ))}
                                    <Input
                                        type="text"
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        className="border-0 flex-1 focus-visible:ring-0 focus-visible:ring-offset-0"
                                        placeholder="Ajouter des compétences ou sujets abordés..."
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Colonne droite */}
                <div className="space-y-6">
                    <Card>
                        <CardContent className="p-6 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="start_date">Date et heure de début</Label>
                                    <div className="grid gap-2">
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    className="w-full justify-start text-left font-normal h-12"
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {data.start_date ? (
                                                        format(new Date(data.start_date), 'PPP', { locale: fr })
                                                    ) : (
                                                        <span>Choisir une date</span>
                                                    )}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={data.start_date ? new Date(data.start_date) : undefined}
                                                    onSelect={date => {
                                                        if (date) {
                                                            const currentDate = data.start_date ? new Date(data.start_date) : new Date()
                                                            date.setHours(currentDate.getHours())
                                                            date.setMinutes(currentDate.getMinutes())
                                                            setData('start_date', date.toISOString())
                                                        }
                                                    }}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <div className="flex gap-2">
                                            <div className="flex-1">
                                                <Select
                                                    value={data.start_date ? new Date(data.start_date).getHours().toString() : ""}
                                                    onValueChange={(value) => {
                                                        updateDateField('start_date', (date) => {
                                                            date.setHours(parseInt(value, 10))
                                                        })
                                                    }}
                                                >
                                                    <SelectTrigger className="h-12">
                                                        <Clock className="mr-2 h-4 w-4" />
                                                        <SelectValue placeholder="Heure" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {Array.from({ length: 24 }, (_, i) => (
                                                            <SelectItem key={i} value={i.toString()}>
                                                                {i.toString().padStart(2, '0')}:00
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="flex-1">
                                                <Select
                                                    value={data.start_date ? new Date(data.start_date).getMinutes().toString() : ""}
                                                    onValueChange={(value) => {
                                                        updateDateField('start_date', (date) => {
                                                            date.setMinutes(parseInt(value, 10))
                                                        })
                                                    }}
                                                >
                                                    <SelectTrigger className="h-12">
                                                        <SelectValue placeholder="Min" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {Array.from({ length: 12 }, (_, i) => i * 5).map((minute) => (
                                                            <SelectItem key={minute} value={minute.toString()}>
                                                                {minute.toString().padStart(2, '0')}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </div>
                                    {errors.start_date && <p className="text-red-500 text-sm mt-2">{errors.start_date}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="end_date">Date et heure de fin</Label>
                                    <div className="grid gap-2">
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    className="w-full justify-start text-left font-normal h-12"
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {data.end_date ? (
                                                        format(new Date(data.end_date), 'PPP', { locale: fr })
                                                    ) : (
                                                        <span>Choisir une date</span>
                                                    )}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={data.end_date ? new Date(data.end_date) : undefined}
                                                    onSelect={date => {
                                                        if (date) {
                                                            const currentDate = data.end_date ? new Date(data.end_date) : new Date()
                                                            date.setHours(currentDate.getHours())
                                                            date.setMinutes(currentDate.getMinutes())
                                                            setData('end_date', date.toISOString())
                                                        }
                                                    }}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <div className="flex gap-2">
                                            <div className="flex-1">
                                                <Select
                                                    value={data.end_date ? new Date(data.end_date).getHours().toString() : ""}
                                                    onValueChange={(value) => {
                                                        updateDateField('end_date', (date) => {
                                                            date.setHours(parseInt(value, 10))
                                                        })
                                                    }}
                                                >
                                                    <SelectTrigger className="h-12">
                                                        <Clock className="mr-2 h-4 w-4" />
                                                        <SelectValue placeholder="Heure" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {Array.from({ length: 24 }, (_, i) => (
                                                            <SelectItem key={i} value={i.toString()}>
                                                                {i.toString().padStart(2, '0')}:00
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="flex-1">
                                                <Select
                                                    value={data.end_date ? new Date(data.end_date).getMinutes().toString() : ""}
                                                    onValueChange={(value) => {
                                                        updateDateField('end_date', (date) => {
                                                            date.setMinutes(parseInt(value, 10))
                                                        })
                                                    }}
                                                >
                                                    <SelectTrigger className="h-12">
                                                        <SelectValue placeholder="Min" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {Array.from({ length: 12 }, (_, i) => i * 5).map((minute) => (
                                                            <SelectItem key={minute} value={minute.toString()}>
                                                                {minute.toString().padStart(2, '0')}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {errors.end_date && <p className="text-red-500 text-sm mt-2">{errors.end_date}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="excerpt">Description courte</Label>
                                <Textarea
                                    id="excerpt"
                                    placeholder="Une brève description de la formation..."
                                    value={data.excerpt}
                                    onChange={e => setData('excerpt', e.target.value)}
                                    rows={3}
                                />
                                {errors.excerpt && <p className="text-red-500 text-sm mt-2">{errors.excerpt}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="content">Contenu détaillé</Label>
                                <QuillEditor
                                    value={data.content}
                                    onChange={(value) => setData('content', value)}
                                    className="@3xl:col-span-2 [&>.ql-container_.ql-editor]:min-h-[250px] rounded-md"
                                    labelClassName="font-medium text-gray-700 dark:text-gray-600 mb-1.5"
                                />
                                {errors.content && <p className="text-red-500 text-sm mt-2">{errors.content}</p>}
                            </div>

                            <div className="flex items-center justify-between pt-6 border-t">
                                <div className="space-y-1">
                                    <h4 className="font-medium">Publier la formation</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Activez pour rendre la formation visible au public
                                    </p>
                                </div>
                                <Switch
                                    checked={data.is_published}
                                    onCheckedChange={checked => setData('is_published', checked)}
                                />
                            </div>

                            <div className="flex items-center justify-between pt-6 border-t">
                                <div className="space-y-1">
                                    <h4 className="font-medium">Mettre en vedette</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Activez pour mettre la formation en avant sur la page d'accueil
                                    </p>
                                </div>
                                <Switch
                                    checked={data.is_featured}
                                    onCheckedChange={checked => setData('is_featured', checked)}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-4">
                        <Button
                            variant="outline"
                            size="lg"
                            type="button"
                            onClick={() => window.history.back()}
                        >
                            Annuler
                        </Button>
                        <Button
                            type="submit"
                            size="lg"
                            disabled={processing}
                        >
                            {processing && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Enregistrer les modifications
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    )
}

export default EditFormation