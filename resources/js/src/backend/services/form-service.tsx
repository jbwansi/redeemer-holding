import { useState } from 'react';
import DOMPurify from 'dompurify';
import { router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import QuillEditor from '@/components/ui/quill-editor';
import { Service } from '@/types/service';
import { IconPicker } from '@/components/ui/IconPicker';
import {
  FileText,
  Palette,
  Save,
  X,
  Target,
  MousePointerClick,
  Sparkles,
  Image,
  Trash2,
} from 'lucide-react';

interface Props {
  service?: Service;
  mode: 'create' | 'edit';
}

export default function FormService({ service, mode }: Props) {
  const [formData, setFormData] = useState<any>({
    name: service?.name ?? '',
    excerpt: service?.excerpt ?? '',
    content: service?.content ?? '',
    icon: service?.icon ?? '',

    image: null,
    existing_image: service?.image ?? service?.featured_image ?? '',

    tagline: service?.tagline ?? '',
    featured_note: service?.featured_note ?? '',

    cta_primary_label: service?.cta_primary_label ?? '',
    cta_primary_url: service?.cta_primary_url ?? '',
    cta_secondary_label: service?.cta_secondary_label ?? '',
    cta_secondary_url: service?.cta_secondary_url ?? '',

    position: service?.position ?? '',

    ideal_for: Array.isArray(service?.ideal_for)
      ? service.ideal_for
      : typeof service?.ideal_for === 'string' && service.ideal_for
        ? JSON.parse(service.ideal_for)
        : [],
  });

  const addIdealItem = () => {
    setFormData({
      ...formData,
      ideal_for: [...formData.ideal_for, ''],
    });
  };

  const updateIdealItem = (index: number, value: string) => {
    const items = [...formData.ideal_for];
    items[index] = value;

    setFormData({
      ...formData,
      ideal_for: items,
    });
  };

  const removeIdealItem = (index: number) => {
    setFormData({
      ...formData,
      ideal_for: formData.ideal_for.filter((_: string, i: number) => i !== index),
    });
  };

  const handleChange = (e: any) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload = new FormData();

    payload.append('name', formData.name || '');
    payload.append('excerpt', formData.excerpt || '');
    payload.append('content', formData.content || '');
    payload.append('icon', formData.icon || '');
    payload.append('tagline', formData.tagline || '');
    payload.append('featured_note', formData.featured_note || '');
    payload.append('cta_primary_label', formData.cta_primary_label || '');
    payload.append('cta_primary_url', formData.cta_primary_url || '');
    payload.append('cta_secondary_label', formData.cta_secondary_label || '');
    payload.append('cta_secondary_url', formData.cta_secondary_url || '');
    payload.append(
      'ideal_for',
      JSON.stringify(formData.ideal_for.filter((item: string) => item.trim() !== ''))
    );

    if (formData.position !== '' && formData.position !== null) {
      payload.append('position', String(formData.position));
    }

    if (formData.image instanceof File) {
      payload.append('image', formData.image);
    }

    if (mode === 'create') {
      router.post(route('services.store'), payload, {
        forceFormData: true,
      });
    } else if (service) {
      payload.append('_method', 'PUT');

      router.post(route('services.update', service.id), payload, {
        forceFormData: true,
      });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setFormData({
      ...formData,
      image: file,
    });
  };

  const safePreviewContent = DOMPurify.sanitize(formData.content || '');

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* ===================== INFOS ===================== */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            Intrainings générales
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div>
            <Label>Nom du service</Label>
            <Input name="name" value={formData.name} onChange={handleChange} />
          </div>

          <div>
            <Label>Résumé court</Label>
            <Textarea name="excerpt" value={formData.excerpt} onChange={handleChange} rows={3} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="h-4 w-4 text-primary" />
            Image du service
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {(formData.image || formData.existing_image) && (
            <div className="overflow-hidden rounded-xl border bg-muted">
              <img
                src={formData.image ? URL.createObjectURL(formData.image) : formData.existing_image}
                alt="Aperçu du service"
                className="h-56 w-full object-cover"
              />
            </div>
          )}

          <div>
            <Label>Photo affichée sur la page services</Label>
            <Input type="file" accept="image/*" onChange={handleImageChange} />
            <p className="mt-2 text-xs text-muted-foreground">
              Recommandé : image horizontale, minimum 900x600px.
            </p>
          </div>

          {formData.image && (
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setFormData({
                  ...formData,
                  image: null,
                })
              }
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Retirer l’image sélectionnée
            </Button>
          )}
        </CardContent>
      </Card>

      {/* ===================== POSITIONNEMENT ===================== */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Positionnement marketing
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div>
            <Label>Accroche (tagline)</Label>
            <Input
              name="tagline"
              value={formData.tagline}
              onChange={handleChange}
              placeholder="Ex: Passez à l'action avec clarté"
            />
          </div>

          <div>
            <Label>Note stratégique</Label>
            <Input
              name="featured_note"
              value={formData.featured_note}
              onChange={handleChange}
              placeholder="Ex: Recommandé comme point de départ"
            />
          </div>

          <div className="space-y-3">
            <Label>Idéal si vous voulez</Label>

            {formData.ideal_for.map((item: string, index: number) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={item}
                  onChange={(e) => updateIdealItem(index, e.target.value)}
                  placeholder={`Point ${index + 1}`}
                />

                <Button type="button" variant="outline" onClick={() => removeIdealItem(index)}>
                  Supprimer
                </Button>
              </div>
            ))}

            <Button type="button" variant="outline" onClick={addIdealItem}>
              Ajouter un point
            </Button>
          </div>

          <div>
            <Label>Position (ordre d'affichage)</Label>
            <Input
              type="number"
              name="position"
              value={formData.position}
              onChange={handleChange}
            />
          </div>
        </CardContent>
      </Card>

      <Label>Position sur la page d’accueil</Label>
      <Input
        type="number"
        name="position"
        value={formData.position}
        onChange={handleChange}
        placeholder="1, 2 ou 3"
      />

      {/* ===================== CTA ===================== */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MousePointerClick className="h-4 w-4 text-primary" />
            Boutons & actions
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Bouton principal</Label>
              <Input
                name="cta_primary_label"
                value={formData.cta_primary_label}
                onChange={handleChange}
                placeholder="Ex: Réserver mon analyse"
              />
            </div>

            <div>
              <Label>Lien bouton principal</Label>
              <Input
                name="cta_primary_url"
                value={formData.cta_primary_url}
                onChange={handleChange}
                placeholder="/contact?service=..."
              />
            </div>

            <div>
              <Label>Bouton secondaire</Label>
              <Input
                name="cta_secondary_label"
                value={formData.cta_secondary_label}
                onChange={handleChange}
                placeholder="Ex: En savoir plus"
              />
            </div>

            <div>
              <Label>Lien bouton secondaire</Label>
              <Input
                name="cta_secondary_url"
                value={formData.cta_secondary_url}
                onChange={handleChange}
                placeholder="/services/slug"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ===================== ICONE ===================== */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-4 w-4 text-primary" />
            Icône
          </CardTitle>
        </CardHeader>
        <CardContent>
          <IconPicker
            value={formData.icon}
            onChange={(icon) => setFormData({ ...formData, icon })}
          />
        </CardContent>
      </Card>

      {/* ===================== CONTENU ===================== */}
      <Card>
        <CardHeader>
          <CardTitle>Description détaillée</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="write">
            <TabsList>
              <TabsTrigger value="write">Écrire</TabsTrigger>
              <TabsTrigger value="preview">Aperçu</TabsTrigger>
            </TabsList>
            <TabsContent value="write">
              <QuillEditor
                value={formData.content}
                onChange={(value) => setFormData({ ...formData, content: value })}
              />
            </TabsContent>

            <TabsContent value="preview">
              <div dangerouslySetInnerHTML={{ __html: safePreviewContent }} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* ===================== ACTIONS ===================== */}
      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            router.visit(
              mode === 'edit' && service
                ? route('services.show', service.id)
                : route('services.index')
            )
          }
        >
          Annuler
        </Button>
        <Button type="submit">{mode === 'create' ? 'Créer' : 'Enregistrer'}</Button>
      </div>
    </form>
  );
}
