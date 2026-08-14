import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MapPin, Users, ImagePlus, Loader2, X } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn, isDateInPast, isEndDateBeforeStartDate } from '@/lib/utils';
import { useForm, usePage } from '@inertiajs/react';
import QuillEditor from '@/components/ui/quill-editor';
import { Category } from '@/types/category';
import { route } from 'ziggy-js';

const CreateEvent = ({ categories }: any) => {
  const { flash } = usePage().props as any;
  const now = new Date();
  const inOneHour = new Date(now.getTime() + 60 * 60 * 1000);

  const { data, setData, post, processing, errors, transform } = useForm({
    title: '',
    description: '',
    content: '',
    location: '',
    category_id: '',
    start_date: now.toISOString(),
    end_date: inOneHour.toISOString(),
    price: '0',
    max_participants: '',
    featured_image: null as File | null,
    is_published: false,
    tags: [] as string[],
    is_featured: false,
  });
  const [preview, setPreview] = React.useState<string | null>(null);
  const [inputValue, setInputValue] = React.useState('');
  const setField = (key: string, value: any) => setData(key as any, value);

  const updateDateField = React.useCallback(
    (field: 'start_date' | 'end_date', updater: (date: Date) => void) => {
      const rawValue = data[field];
      const baseDate = rawValue ? new Date(rawValue) : new Date();
      if (Number.isNaN(baseDate.getTime())) return;
      updater(baseDate);
      setData(field, baseDate.toISOString());
    },
    [data, setData]
  );

  const handleImageChange = (e: any) => {
    const file = e.target.files?.[0];
    if (file) {
      setData('featured_image', file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    transform((form) => ({
      ...form,
      price: form.price === '' ? 0 : Number(form.price),
      max_participants: form.max_participants === '' ? null : Number(form.max_participants),
    }));

    post(route('events.store'), {
      forceFormData: true,
      preserveScroll: true,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (inputValue.trim()) {
        const newTags = [...data.tags, inputValue.trim()];
        setData('tags', newTags);
        setInputValue('');
      }
    }
  };

  // Gérer la suppression de tag
  const removeTag = (tagToRemove: string) => {
    const newTags = data.tags.filter((tag: string) => tag !== tagToRemove);
    setData('tags', newTags);
  };

  const validateDates = (dateType: 'start' | 'end', newDate: Date): string | null => {
    if (isDateInPast(newDate)) {
      return 'La date ne peut pas être dans le passé';
    }

    if (dateType === 'end' && data.start_date) {
      if (isEndDateBeforeStartDate(new Date(data.start_date), newDate)) {
        return 'La date de fin doit être après la date de début';
      }
    }

    return null;
  };

  // Ajoutez cette section dans votre première Card, après le champ max_participants
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-slate-950 via-slate-900 to-[#7f1d1d] px-6 py-7 text-white shadow-xl">
        <div className="absolute -top-10 -right-10 h-36 w-36 rounded-full bg-white/10 blur-2xl" />
        <h1 className="text-3xl font-bold tracking-tight">Créer un événement</h1>
        <p className="mt-2 text-white/80">
          Remplissez les informations ci-dessous pour créer votre événement
        </p>
      </div>

      {flash?.error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
          {flash.error}
        </div>
      )}

      {flash?.success && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300">
          {flash.success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Colonne gauche */}
        <div className="space-y-6">
          <Card className="border-slate-200/80 bg-white/95 shadow-sm dark:border-slate-700/70 dark:bg-slate-900/70">
            <CardContent className="p-6 space-y-6">
              <div
                className={cn(
                  'relative aspect-video rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors',
                  'flex flex-col items-center justify-center text-center p-6',
                  'cursor-pointer overflow-hidden'
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
                    <p className="text-sm text-muted-foreground">PNG, JPG ou GIF jusqu'à 2MB</p>
                  </div>
                )}
                {errors.featured_image && (
                  <p className="text-red-500 text-sm mt-2">{errors.featured_image}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Titre de l'événement</Label>
                <Input
                  id="title"
                  placeholder="Entrez le titre..."
                  value={data.title}
                  onChange={(e) => setField('title', e.target.value)}
                  className="h-12"
                />
                {errors.title && <p className="text-red-500 text-sm mt-2">{errors.title}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Catégorie</Label>
                  <Select
                    value={data.category_id}
                    onValueChange={(value) => setField('category_id', value)}
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Sélectionnez..." />
                    </SelectTrigger>
                    <SelectContent>
                      {categories?.map((category: Category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category_id && (
                    <p className="text-red-500 text-sm mt-2">{errors.category_id}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Lieu</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
                    <Input
                      id="location"
                      placeholder="Lieu..."
                      value={data.location}
                      onChange={(e) => setField('location', e.target.value)}
                      className="h-12 pl-11"
                    />
                  </div>
                  {errors.location && (
                    <p className="text-red-500 text-sm mt-2">{errors.location}</p>
                  )}
                </div>
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
                      value={data.price}
                      onChange={(e) => setField('price', e.target.value)}
                      className="h-12"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                      CHF
                    </span>
                  </div>
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
                      onChange={(e) => setField('max_participants', e.target.value)}
                      className="h-12 pl-11"
                    />
                  </div>
                  {errors.max_participants && (
                    <p className="text-red-500 text-sm mt-2">{errors.max_participants}</p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label>
                  {' '}
                  Tags{' '}
                  <span className="text-xs text-muted-foreground">
                    (Appuyez sur Entrée pour ajouter un tag...)
                  </span>
                </Label>
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
                    className="border-0 flex-1 focus-visible:ring-0 focus-visible:ring-offset-0 w-full"
                    placeholder="Entrez le nom des différents intervenants   ou invités..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Colonne droite */}
        <div className="space-y-6">
          <Card className="border-slate-200/80 bg-white/95 shadow-sm dark:border-slate-700/70 dark:bg-slate-900/70">
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
                          disabled={(date) => isDateInPast(date)}
                          selected={data.start_date ? new Date(data.start_date) : undefined}
                          onSelect={(date) => {
                            if (date) {
                              updateDateField('start_date', (currentDate) => {
                                currentDate.setFullYear(
                                  date.getFullYear(),
                                  date.getMonth(),
                                  date.getDate()
                                );
                              });
                            }
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
                  {errors.start_date && (
                    <p className="text-red-500 text-sm mt-2">{errors.start_date}</p>
                  )}
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
                          disabled={(date) => isDateInPast(date)}
                          selected={data.end_date ? new Date(data.end_date) : undefined}
                          onSelect={(date) => {
                            if (date) {
                              updateDateField('end_date', (currentDate) => {
                                currentDate.setFullYear(
                                  date.getFullYear(),
                                  date.getMonth(),
                                  date.getDate()
                                );
                              });
                            }
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
                </div>
                {errors.end_date && <p className="text-red-500 text-sm mt-2">{errors.end_date}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description courte</Label>
                <Textarea
                  id="description"
                  placeholder="Une brève description de l'événement..."
                  value={data.description}
                  onChange={(e) => setField('description', e.target.value)}
                  rows={3}
                />
                {errors.description && (
                  <p className="text-red-500 text-sm mt-2">{errors.description}</p>
                )}
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
                  <h4 className="font-medium">Publier l'événement</h4>
                  <p className="text-sm text-muted-foreground">
                    Activez pour rendre l'événement visible au public
                  </p>
                </div>
                <Switch
                  checked={data.is_published}
                  onCheckedChange={(checked) => setField('is_published', checked)}
                />
              </div>
              <div className="flex items-center justify-between pt-6 border-t">
                <div className="space-y-1">
                  <h4 className="font-medium">Mettre en vedette </h4>
                  <p className="text-sm text-muted-foreground">
                    Activez pour rendre l'événement en vedette sur la page d'accueil
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
            <Button
              variant="outline"
              size="lg"
              type="button"
              onClick={() => window.history.back()}
              className="rounded-xl"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              size="lg"
              disabled={processing}
              className="rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white hover:from-red-700 hover:to-rose-700"
            >
              {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Créer l'événement
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateEvent;
