import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Save } from 'lucide-react';

const pages = [
  { key: 'services', label: 'Services' },
  { key: 'trainings', label: 'Formations' },
  { key: 'events', label: 'Événements' },
];

export default function PageContentsIndex({ contents }: any) {
  const [activePage, setActivePage] = useState('services');

  const [form, setForm] = useState<any>({
    services: contents?.services || {},
    trainings: contents?.trainings || {},
    events: contents?.events || {},
  });

  const handleChange = (key: string, value: any) => {
    setForm({
      ...form,
      [activePage]: {
        ...form[activePage],
        [key]: value,
      },
    });
  };

  const handleSave = () => {
    const payload = new FormData();

    payload.append('page', activePage);

    Object.entries(form[activePage] || {}).forEach(([key, value]: any) => {
      if (value !== null && value !== undefined) {
        payload.append(`data[${key}]`, value);
      }
    });

    router.post(route('page-contents.update'), payload, {
      forceFormData: true,
    });
  };

  return (
    <>
      <Head title="Contenu des pages" />

      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Contenu des pages</h1>
          <p className="text-sm text-muted-foreground">Modifiez les textes globaux de vos pages</p>
        </div>

        {/* Tabs */}
        <Tabs value={activePage} onValueChange={setActivePage}>
          <TabsList>
            {pages.map((p) => (
              <TabsTrigger key={p.key} value={p.key}>
                {p.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {pages.map((p) => (
            <TabsContent key={p.key} value={p.key} className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>{p.label}</CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                  <Input
                    placeholder="Titre principal (Hero)"
                    value={form[p.key]?.hero_title || ''}
                    onChange={(e) => handleChange('hero_title', e.target.value)}
                  />

                  <Textarea
                    placeholder="Sous-titre (Hero)"
                    value={form[p.key]?.hero_subtitle || ''}
                    onChange={(e) => handleChange('hero_subtitle', e.target.value)}
                  />

                  <div>
                    <p className="mb-2 text-sm font-medium">Image Hero</p>

                    {typeof form[p.key]?.hero_image === 'string' && form[p.key]?.hero_image && (
                      <img
                        src={form[p.key].hero_image}
                        alt="Image Hero actuelle"
                        className="mb-3 h-32 w-full rounded-lg object-cover"
                      />
                    )}

                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleChange('hero_image', e.target.files?.[0] as any)}
                    />
                  </div>

                  <Input
                    placeholder="Titre de section"
                    value={form[p.key]?.section_title || ''}
                    onChange={(e) => handleChange('section_title', e.target.value)}
                  />

                  <Textarea
                    placeholder="Sous-titre de section"
                    value={form[p.key]?.section_subtitle || ''}
                    onChange={(e) => handleChange('section_subtitle', e.target.value)}
                  />

                  <Input
                    placeholder="Titre CTA final"
                    value={form[p.key]?.final_cta_title || ''}
                    onChange={(e) => handleChange('final_cta_title', e.target.value)}
                  />

                  <Textarea
                    placeholder="Texte CTA final"
                    value={form[p.key]?.final_cta_text || ''}
                    onChange={(e) => handleChange('final_cta_text', e.target.value)}
                  />

                  <div className="pt-4">
                    <Button onClick={handleSave} className="gap-2">
                      <Save className="h-4 w-4" />
                      Enregistrer
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </>
  );
}
