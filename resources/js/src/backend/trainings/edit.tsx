import React from 'react';
import { useForm, Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { CalendarIcon, Clock, ImagePlus, Link2, Loader2, MapPin, Users, X } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn, isDateInPast } from '@/lib/utils';
import QuillEditor from '@/components/ui/quill-editor';

const toIsoOrFallback = (value: string | null | undefined, fallback: Date) => {
  if (!value) return fallback.toISOString();
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? fallback.toISOString() : date.toISOString();
};

type TrainingFormData = {
  title: string;
  excerpt: string;
  content: string;
  location: string;
  start_date: string;
  end_date: string;
  price: string | number;
  max_participants: string | number | null;
  featured_image: Blob | null;
  is_published: boolean;
  is_featured: boolean;
  meeting_link: string;
  tags: string[];
};

type TrainingViewModel = {
  id: number;
  title?: string;
  excerpt?: string;
  content?: string;
  location?: string;
  start_date?: string | null;
  end_date?: string | null;
  price?: number | string | null;
  max_participants?: number | string | null;
  is_published?: boolean;
  is_featured?: boolean;
  meeting_link?: string;
  tags?: string[];
  featured_image?: {
    medium?: string;
  } | null;
};

const EditTraining = ({ training }: { training: TrainingViewModel }) => {
  const now = new Date();
  const inOneHour = new Date(now.getTime() + 60 * 60 * 1000);

  const { data, setData, post, processing, errors, transform } = useForm<TrainingFormData>({
    title: training.title || '',
    excerpt: training.excerpt || '',
    content: training.content || '',
    location: training.location || '',
    start_date: toIsoOrFallback(training.start_date, now),
    end_date: toIsoOrFallback(training.end_date, inOneHour),
    price: training.price ?? '',
    max_participants: training.max_participants ?? '',
    featured_image: null,
    is_published: !!training.is_published,
    is_featured: !!training.is_featured,
    meeting_link: training.meeting_link || '',
    tags: Array.isArray(training.tags) ? training.tags : [],
  });
  const [preview, setPreview] = React.useState<string | null>(
    training?.featured_image?.medium || null
  );
  const [tagInput, setTagInput] = React.useState('');

  const setField = <K extends keyof TrainingFormData>(key: K, value: TrainingFormData[K]) => {
    setData(key, value);
  };

  const updateDateField = React.useCallback(
    (field: 'start_date' | 'end_date', updater: (date: Date) => void) => {
      const rawValue = data[field];
      const baseDate = rawValue ? new Date(rawValue) : new Date();

      if (Number.isNaN(baseDate.getTime())) {
        return;
      }

      updater(baseDate);
      setData(field, baseDate.toISOString());
    },
    [data, setData]
  );

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setData('featured_image', file);

    if (file) {
      setPreview(window.URL.createObjectURL(file));
      return;
    }

    setPreview(training?.featured_image?.medium || null);
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') {
      return;
    }

    e.preventDefault();
    const nextTag = tagInput.trim();
    if (!nextTag) {
      return;
    }

    setData('tags', [...data.tags, nextTag]);
    setTagInput('');
  };

  const removeTag = (tagToRemove: string) => {
    setData(
      'tags',
      data.tags.filter((tag: string) => tag !== tagToRemove)
    );
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();

    transform((payload) => ({
      ...payload,
      price: payload.price === '' ? 0 : Number(payload.price),
      max_participants: payload.max_participants === '' ? null : Number(payload.max_participants),
    }));

    post(route('trainings.update', { training: training.id }), {
      forceFormData: true,
      preserveScroll: true,
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-4 md:p-6">
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-slate-950 via-slate-900 to-[#7f1d1d] px-6 py-7 text-white shadow-xl">
        <div className="absolute -top-10 -right-10 h-36 w-36 rounded-full bg-white/10 blur-2xl" />
        <h1 className="text-3xl font-bold tracking-tight">Modifier la formation</h1>
        <p className="mt-2 text-white/80">
          Modifiez les informations ci-dessous pour mettre à jour votre formation
        </p>
      </div>

      <form onSubmit={submit} className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <Card className="border-slate-200/80 bg-white/95 shadow-sm dark:border-slate-700/70 dark:bg-slate-900/70">
            <CardContent className="space-y-6 p-6">
              <div
                className={cn(
                  'relative aspect-video rounded-lg border-2 border-dashed border-muted-foreground/25 transition-colors hover:border-muted-foreground/50',
                  'flex cursor-pointer flex-col items-center justify-center overflow-hidden p-6 text-center'
                )}
                onClick={() => document.getElementById('image-upload-edit')?.click()}
              >
                <input
                  id="image-upload-edit"
                  type="file"
                  title="Image de couverture"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                {preview ? (
                  <img
                    src={preview}
                    alt="Preview"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center">
                    <ImagePlus className="mb-4 h-12 w-12 text-muted-foreground" />
                    <p className="mb-2 text-lg font-medium">Choisir une image</p>
                    <p className="text-sm text-muted-foreground">PNG, JPG ou GIF jusqu'à 2MB</p>
                  </div>
                )}
              </div>
              {errors.featured_image && (
                <p className="text-sm text-red-500">{errors.featured_image}</p>
              )}

              <div className="space-y-2">
                <Label htmlFor="title">Titre de la formation</Label>
                <Input
                  id="title"
                  placeholder="Entrez le titre..."
                  value={data.title}
                  onChange={(e) => setField('title', e.target.value)}
                  className="h-12"
                />
                {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Lieu</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="location"
                    placeholder="Lieu..."
                    value={data.location}
                    onChange={(e) => setField('location', e.target.value)}
                    className="h-12 pl-11"
                  />
                </div>
                {errors.location && <p className="text-sm text-red-500">{errors.location}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Prix</Label>
                  <div className="relative">
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={data.price}
                      onChange={(e) => setField('price', e.target.value)}
                      className="h-12"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 font-medium text-muted-foreground">
                      CHF
                    </span>
                  </div>
                  {errors.price && <p className="text-sm text-red-500">{errors.price}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max_participants">Participants</Label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="max_participants"
                      type="number"
                      min="0"
                      value={data.max_participants ?? ''}
                      onChange={(e) => setField('max_participants', e.target.value)}
                      className="h-12 pl-11"
                    />
                  </div>
                  {errors.max_participants && (
                    <p className="text-sm text-red-500">{errors.max_participants}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="meeting_link">Lien de meeting</Label>
                <div className="relative">
                  <Link2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="meeting_link"
                    placeholder="https://meet.google.com/xxx-xxxx-xxx"
                    value={data.meeting_link}
                    onChange={(e) => setField('meeting_link', e.target.value)}
                    className="h-12 pl-10"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Lien optionnel pour les réunions en ligne (Google Meet, Zoom, etc.)
                </p>
                {errors.meeting_link && (
                  <p className="text-sm text-red-500">{errors.meeting_link}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>
                  Tags{' '}
                  <span className="text-xs text-muted-foreground">
                    (Appuyez sur Entrée pour ajouter un tag)
                  </span>
                </Label>
                <div className="flex flex-wrap gap-2 rounded-lg border p-2">
                  {data.tags.map((tag: string, index: number) => (
                    <span
                      key={`${tag}-${index}`}
                      className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-sm text-primary"
                    >
                      {tag}
                      <button
                        type="button"
                        title={`Supprimer le tag ${tag}`}
                        aria-label={`Supprimer le tag ${tag}`}
                        onClick={() => removeTag(tag)}
                        className="rounded-full hover:bg-primary/20"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                  <Input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    className="w-full flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                    placeholder="Ajouter des mots-clés..."
                  />
                </div>
                {errors.tags && <p className="text-sm text-red-500">{errors.tags}</p>}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-slate-200/80 bg-white/95 shadow-sm dark:border-slate-700/70 dark:bg-slate-900/70">
            <CardContent className="space-y-6 p-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date et heure de début</Label>
                  <div className="grid gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="h-12 w-full justify-start text-left font-normal"
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
                          disabled={(date) => isDateInPast(date)}
                          selected={data.start_date ? new Date(data.start_date) : undefined}
                          onSelect={(date) => {
                            if (!date) return;
                            updateDateField('start_date', (currentDate) => {
                              currentDate.setFullYear(
                                date.getFullYear(),
                                date.getMonth(),
                                date.getDate()
                              );
                            });
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>

                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Select
                          value={
                            data.start_date ? new Date(data.start_date).getHours().toString() : ''
                          }
                          onValueChange={(value) =>
                            updateDateField('start_date', (date) =>
                              date.setHours(parseInt(value, 10))
                            )
                          }
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
                          value={
                            data.start_date ? new Date(data.start_date).getMinutes().toString() : ''
                          }
                          onValueChange={(value) =>
                            updateDateField('start_date', (date) =>
                              date.setMinutes(parseInt(value, 10))
                            )
                          }
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
                  {errors.start_date && <p className="text-sm text-red-500">{errors.start_date}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Date et heure de fin</Label>
                  <div className="grid gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="h-12 w-full justify-start text-left font-normal"
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
                          disabled={(date) => isDateInPast(date)}
                          selected={data.end_date ? new Date(data.end_date) : undefined}
                          onSelect={(date) => {
                            if (!date) return;
                            updateDateField('end_date', (currentDate) => {
                              currentDate.setFullYear(
                                date.getFullYear(),
                                date.getMonth(),
                                date.getDate()
                              );
                            });
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>

                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Select
                          value={data.end_date ? new Date(data.end_date).getHours().toString() : ''}
                          onValueChange={(value) =>
                            updateDateField('end_date', (date) =>
                              date.setHours(parseInt(value, 10))
                            )
                          }
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
                          value={
                            data.end_date ? new Date(data.end_date).getMinutes().toString() : ''
                          }
                          onValueChange={(value) =>
                            updateDateField('end_date', (date) =>
                              date.setMinutes(parseInt(value, 10))
                            )
                          }
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
                  {errors.end_date && <p className="text-sm text-red-500">{errors.end_date}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="excerpt">Description courte</Label>
                <Textarea
                  id="excerpt"
                  placeholder="Une brève description de la formation..."
                  value={data.excerpt}
                  onChange={(e) => setField('excerpt', e.target.value)}
                  rows={3}
                />
                {errors.excerpt && <p className="text-sm text-red-500">{errors.excerpt}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Contenu détaillé</Label>
                <QuillEditor
                  value={data.content}
                  onChange={(value) => setData('content', value)}
                  className="rounded-md [&>.ql-container_.ql-editor]:min-h-[250px]"
                  labelClassName="mb-1.5 font-medium text-gray-700 dark:text-gray-600"
                />
                {errors.content && <p className="text-sm text-red-500">{errors.content}</p>}
              </div>

              <div className="flex items-center justify-between border-t pt-6">
                <div className="space-y-1">
                  <h4 className="font-medium">Publier la formation</h4>
                  <p className="text-sm text-muted-foreground">
                    Activez pour rendre la formation visible au public
                  </p>
                </div>
                <Switch
                  checked={data.is_published}
                  onCheckedChange={(checked) => setField('is_published', checked)}
                />
              </div>

              <div className="flex items-center justify-between border-t pt-6">
                <div className="space-y-1">
                  <h4 className="font-medium">Mettre en vedette</h4>
                  <p className="text-sm text-muted-foreground">
                    Activez pour mettre la formation en avant sur la page d'accueil
                  </p>
                </div>
                <Switch
                  checked={data.is_featured}
                  onCheckedChange={(checked) => setField('is_featured', checked)}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button variant="outline" size="lg" type="button" asChild className="rounded-xl">
              <Link href={route('trainings.index')}>Annuler</Link>
            </Button>
            <Button
              type="submit"
              size="lg"
              disabled={processing}
              className="rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white hover:from-red-700 hover:to-rose-700"
            >
              {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Mettre à jour la formation
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditTraining;
