import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { useForm } from '@inertiajs/react';

// ── Types ────────────────────────────────────────────────────────────────────
interface HeroStep {
  icon: string;
  title: string;
  description: string;
}
interface HeroTestimonial {
  content: string;
  author: string;
  position: string;
}
interface HeroStat {
  value: string;
  label: string;
}
interface ProcessStep {
  icon: string;
  title: string;
  description: string;
}
interface AudienceCard {
  icon: string;
  title: string;
  description: string;
}
interface TestimonialItem {
  content: string;
  author: string;
  position: string;
  image: string;
}
interface CtaBenefit {
  text: string;
}
interface StatsBandItem {
  value: string;
  label: string;
}
interface TextItem {
  text: string;
}

interface Meta {
  hero_floating_stat: any;
  // Hero
  hero_badge: string;
  hero_title_line1: string;
  hero_title_line2: string;
  hero_title_line3: string;
  hero_subtitle: string;
  hero_cta_text: string;
  hero_cta_url: string;
  hero_secondary_cta_text: string;
  hero_secondary_cta_url: string;
  hero_reassurance_items: { text: string }[];

  hero_images: string[];
  hero_floating_stat_enabled: boolean;
  hero_floating_stat_value: string;
  hero_floating_stat_label: string;
  hero_social_proof_text: string;
  hero_social_rating: string;
  hero_social_platform: string;
  hero_testimonial: HeroTestimonial;
  // Stats band
  stats: StatsBandItem[];
  // Process
  process_title: string;
  process_subtitle: string;
  process: ProcessStep[];
  // For whom
  for_whom_title: string;
  for_whom_subtitle: string;
  for_whom: AudienceCard[];
  // Testimonials
  testimonials_title: string;
  testimonials: TestimonialItem[];
  // Blog
  blog_title: string;
  // Trainings
  trainings_title: string;
  // Welcome video
  video_enabled: boolean;
  video_url: string;
  video_title: string;
  video_subtitle: string;
  // Events gallery
  events_gallery_enabled: boolean;
  events_gallery_title: string;
  events_gallery_images: string[];
  events_gallery_captions: string[];
  // CTA
  cta_benefits: CtaBenefit[];
  // Bloc clarté
  // Activation
  clarity_action_enabled?: boolean;
  clarity_action_social_proof_text?: string;
  clarity_action_urgency_text?: string;

  // Contenu principal
  clarity_action_title?: string;
  clarity_action_subtitle?: string;
  clarity_action_badge?: string;

  // Colonne gauche (problèmes)
  clarity_action_left_eyebrow?: string;
  clarity_action_left_title?: string;
  clarity_action_left_items?: TextItem[];

  // Colonne droite (solutions)
  clarity_action_right_eyebrow?: string;
  clarity_action_right_title?: string;
  clarity_action_right_items?: TextItem[];

  // Final CTA
  clarity_action_final_cta_title?: string;
  clarity_action_final_cta_subtitle?: string;
  clarity_action_final_cta_button_text?: string;
  clarity_action_final_cta_button_href?: string;
  clarity_action_final_cta_disclaimer?: string;
}

interface Page {
  id: number;
  title: string;
  content: string;
  meta: Meta | null;
}

// ── Icon choices ──────────────────────────────────────────────────────────────
const STEP_ICONS = [
  'Clock',
  'Brain',
  'Zap',
  'Target',
  'TrendingUp',
  'Star',
  'Rocket',
  'CheckCircle',
  'Award',
  'Lightbulb',
  'Shield',
  'Heart',
  'BookOpen',
  'Users',
  'Calendar',
  'MessageCircle',
  'Search',
  'Clipboard',
];
const WHOM_ICONS = [
  'Briefcase',
  'TrendingUp',
  'Users',
  'Target',
  'BookOpen',
  'Heart',
  'Award',
  'Rocket',
  'Star',
  'Lightbulb',
  'GraduationCap',
  'UserCheck',
  'Zap',
  'Shield',
  'CheckCircle',
];

// ── Default meta ─────────────────────────────────────────────────────────────
const defaultMeta: Meta = {
  hero_badge: 'Formation • Coaching • Conseil',
  hero_title_line1: 'La vie que vous méritez',
  hero_title_line2: 'à portée de main !',
  hero_subtitle:
    'Bienvenue sur le chemin de la transformation par les valeurs. Je vous aide à découvrir votre véritable potentiel et à vivre une vie épanouie.',
  hero_cta_text: 'Découvrir mes formations',
  hero_cta_url: '',
  hero_images: [],

  // hero_image: '/assets/images/portrait.jpg',
  hero_steps: [
    {
      icon: 'Clock',
      title: 'Révélez votre potentiel',
      description: 'Découvrez vos forces cachées et définissez votre vision personnelle',
    },
    {
      icon: 'Brain',
      title: 'Transformez vos habitudes',
      description: 'Développez des routines quotidiennes soutenues par la science',
    },
    {
      icon: 'Zap',
      title: 'Optimisez votre productivité',
      description: 'Atteignez vos objectifs avec mon système éprouvé',
    },
  ],
  hero_testimonial: {
    content: '',
    author: '',
    position: '',
  },
  hero_stats: [],
  stats: [],
  process_title: "Mon processus d'accompagnement",
  process_subtitle: '',
  process: [],
  for_whom_title: 'Ce coaching est fait pour vous si…',
  for_whom_subtitle: '',
  for_whom: [],
  testimonials_title: 'Ce que disent mes clients',
  testimonials: [],
  blog_title: 'Derniers articles',
  trainings_title: 'Prochaines formations',
  video_enabled: false,
  video_url: '',
  video_title: 'Bienvenue dans mon univers',
  video_subtitle: 'Une courte vidéo pour faire connaissance et vous présenter ma démarche.',
  events_gallery_enabled: true,
  events_gallery_title: 'Galerie photos',
  events_gallery_images: [],
  events_gallery_captions: [],
  cta_benefits: [],
  clarity_action_enabled: true,
  clarity_action_title: 'Du flou à l’action : un cadre simple pour avancer',
  clarity_action_subtitle:
    'Identifiez ce qui freine votre progression et découvrez le cadre concret pour avancer avec plus de clarté, de constance et de résultats.',

  clarity_action_left_title: 'Vous vous reconnaissez si :',
  clarity_action_left_items: [
    { text: 'Trop de priorités et pas assez de clarté' },
    { text: 'Vous démarrez fort puis perdez le rythme' },
    { text: 'Vous êtes souvent dans l’urgence' },
    { text: 'Vous avancez sans résultats stables' },
  ],

  clarity_action_right_title: 'Vous repartez avec :',
  clarity_action_right_items: [
    { text: 'Des priorités nettes et une direction claire' },
    { text: 'Un plan d’action simple et réaliste' },
    { text: 'Des habitudes durables' },
    { text: 'Des résultats mesurables' },
  ],

  clarity_action_final_cta_title: 'Faisons le point sur votre situation',
  clarity_action_final_cta_subtitle:
    'Profitez d’un premier échange pour clarifier vos priorités, prendre du recul et identifier les prochaines étapes à mettre en place.',
  clarity_action_final_cta_button_text: 'Réserver mon appel découverte',
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function updateItem<T>(arr: T[], index: number, patch: Partial<T>): T[] {
  return arr.map((item, i) => (i === index ? { ...item, ...patch } : item));
}
function removeItem<T>(arr: T[], index: number): T[] {
  return arr.filter((_, i) => i !== index);
}

// ── Component ─────────────────────────────────────────────────────────────────
// const HomeEdit = ({ page }: { page: Page }) => {
//     const { data, setData, post, processing, errors } = useForm<any>({
//         title: page.title,
//         content: page.content ?? '',
//         meta: page.meta ?? defaultMeta,
//         gallery_uploads: [] as (File | null)[],
//         _method: 'put',
//     })

const HomeEdit = ({ page }: { page: Page }) => {
  const { data, setData, post, processing, errors } = useForm<any>({
    title: page.title,
    content: page.content ?? '',
    meta: { ...defaultMeta, ...(page.meta ?? {}) },
    gallery_uploads: [] as (File | null)[],
    hero_uploads: [] as (File | null)[],
    _method: 'put',
  });

  const m: Meta = (data.meta ?? defaultMeta) as Meta;
  const setMeta = (patch: Partial<Meta>) => setData('meta', { ...m, ...patch });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/dashboard/accueil', {
      forceFormData: true,
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Page d'accueil</h1>
        <p className="text-muted-foreground">
          Configurez intégralement le contenu de la page d'accueil
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="hero" className="space-y-6">
          <TabsList className="flex-wrap h-auto gap-1">
            <TabsTrigger value="hero">Héro</TabsTrigger>
            <TabsTrigger value="clarity-action">Bloc clarté</TabsTrigger>
            <TabsTrigger value="stats">Statistiques</TabsTrigger>
            <TabsTrigger value="process">Processus</TabsTrigger>
            <TabsTrigger value="for-whom">Pour qui</TabsTrigger>
            <TabsTrigger value="sections">Titres sections</TabsTrigger>
            <TabsTrigger value="cta">CTA</TabsTrigger>
          </TabsList>

          {/* ── Héro ─────────────────────────────────────── */}
          <TabsContent value="hero">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Contenu principal</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="mb-2">Badge</Label>
                    <Input
                      value={m.hero_badge ?? ''}
                      onChange={(e) => setMeta({ hero_badge: e.target.value })}
                      placeholder="Coaching • Formation • Accompagnement"
                    />
                  </div>

                  <div>
                    <Label className="mb-2">Titre — Ligne 1</Label>
                    <Input
                      value={m.hero_title_line1 ?? ''}
                      onChange={(e) => setMeta({ hero_title_line1: e.target.value })}
                      placeholder="Structurez vos actions"
                    />
                  </div>

                  <div>
                    <Label className="mb-2">Titre — Ligne 2</Label>
                    <Input
                      value={m.hero_title_line2 ?? ''}
                      onChange={(e) => setMeta({ hero_title_line2: e.target.value })}
                      placeholder="et développez des résultats"
                    />
                  </div>

                  <div>
                    <Label className="mb-2">Titre — Ligne 3</Label>
                    <Input
                      value={m.hero_title_line3 ?? ''}
                      onChange={(e) => setMeta({ hero_title_line3: e.target.value })}
                      placeholder="durables"
                    />
                  </div>

                  <div>
                    <Label className="mb-2">Sous-titre</Label>
                    <Textarea
                      rows={3}
                      value={m.hero_subtitle ?? ''}
                      onChange={(e) => setMeta({ hero_subtitle: e.target.value })}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Images du hero</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="mb-1">Images du slider</Label>
                      <p className="text-sm text-muted-foreground">
                        Tu peux téléverser plusieurs images ou coller des URLs. Idéalement 3 images
                        maximum.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground shadow-sm transition hover:bg-primary/90">
                        <Plus className="h-3.5 w-3.5" />
                        Télécharger
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="sr-only"
                          onChange={(e) => {
                            const files = Array.from(e.target.files ?? []);
                            if (!files.length) return;

                            const currentImages = m.hero_images ?? [];
                            const currentUploads = [...(data.hero_uploads ?? [])];
                            const startIndex = currentImages.length;

                            setMeta({
                              hero_images: [...currentImages, ...files.map(() => '')],
                            });

                            files.forEach((file, i) => {
                              currentUploads[startIndex + i] = file;
                            });

                            setData('hero_uploads', currentUploads);
                            e.target.value = '';
                          }}
                        />
                      </label>

                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setMeta({
                            hero_images: [...(m.hero_images ?? []), ''],
                          })
                        }
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        URL
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {(m.hero_images ?? []).map((img, i) => {
                      const uploadedFile = data.hero_uploads?.[i] as File | null;
                      const previewSrc = uploadedFile ? URL.createObjectURL(uploadedFile) : img;

                      return (
                        <div key={i} className="rounded-xl border p-4 space-y-3">
                          <div className="flex items-start gap-4">
                            <div className="h-24 w-24 overflow-hidden rounded-lg border bg-muted flex-shrink-0">
                              {previewSrc ? (
                                <img
                                  src={previewSrc}
                                  alt={`Hero preview ${i + 1}`}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                                  Aperçu
                                </div>
                              )}
                            </div>

                            <div className="flex-1 space-y-2">
                              {uploadedFile ? (
                                <p className="truncate rounded-md border bg-muted px-3 py-2 text-sm text-muted-foreground">
                                  📎 {uploadedFile.name}
                                </p>
                              ) : (
                                <Input
                                  placeholder="https://..."
                                  value={img}
                                  onChange={(e) => {
                                    const updated = [...(m.hero_images ?? [])];
                                    updated[i] = e.target.value;
                                    setMeta({ hero_images: updated });
                                  }}
                                />
                              )}

                              <p className="text-xs text-muted-foreground">Image {i + 1}</p>
                            </div>

                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setMeta({
                                  hero_images: removeItem(m.hero_images ?? [], i),
                                });
                                setData('hero_uploads', removeItem(data.hero_uploads ?? [], i));
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}

                    {(m.hero_images ?? []).length === 0 && (
                      <p className="text-muted-foreground text-sm text-center py-4">
                        Aucune image ajoutée.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Boutons</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="mb-2">Texte bouton principal</Label>
                      <Input
                        value={m.hero_cta_text ?? ''}
                        onChange={(e) => setMeta({ hero_cta_text: e.target.value })}
                        placeholder="Réserver un appel découverte"
                      />
                    </div>
                    <div>
                      <Label className="mb-2">URL bouton principal</Label>
                      <Input
                        value={m.hero_cta_url ?? ''}
                        onChange={(e) => setMeta({ hero_cta_url: e.target.value })}
                        placeholder="/contact"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="mb-2">Texte bouton secondaire</Label>
                      <Input
                        value={m.hero_secondary_cta_text ?? ''}
                        onChange={(e) => setMeta({ hero_secondary_cta_text: e.target.value })}
                        placeholder="Découvrir les accompagnements"
                      />
                    </div>
                    <div>
                      <Label className="mb-2">URL bouton secondaire</Label>
                      <Input
                        value={m.hero_secondary_cta_url ?? ''}
                        onChange={(e) => setMeta({ hero_secondary_cta_url: e.target.value })}
                        placeholder="/services"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Réassurances</CardTitle>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() =>
                      setMeta({
                        hero_reassurance_items: [...(m.hero_reassurance_items ?? []), { text: '' }],
                      })
                    }
                  >
                    <Plus className="h-4 w-4 mr-1" /> Ajouter
                  </Button>
                </CardHeader>
                <CardContent className="space-y-3">
                  {(m.hero_reassurance_items ?? []).map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Input
                        placeholder="Sans engagement"
                        value={item.text}
                        onChange={(e) =>
                          setMeta({
                            hero_reassurance_items: updateItem(m.hero_reassurance_items ?? [], i, {
                              text: e.target.value,
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
                            hero_reassurance_items: removeItem(m.hero_reassurance_items ?? [], i),
                          })
                        }
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ))}

                  {(m.hero_reassurance_items ?? []).length === 0 && (
                    <p className="text-muted-foreground text-sm text-center py-4">
                      Aucun élément. Cliquez sur Ajouter.
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Preuve sociale</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="mb-2">Texte principal</Label>
                    <Input
                      value={m.hero_social_proof_text ?? ''}
                      onChange={(e) => setMeta({ hero_social_proof_text: e.target.value })}
                      placeholder="Des professionnels accompagnés avec méthode"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="mb-2">Note / mention</Label>
                      <Input
                        value={m.hero_social_rating ?? ''}
                        onChange={(e) => setMeta({ hero_social_rating: e.target.value })}
                        placeholder="Retours très positifs"
                      />
                    </div>

                    <div>
                      <Label className="mb-2">Plateforme / libellé</Label>
                      <Input
                        value={m.hero_social_platform ?? ''}
                        onChange={(e) => setMeta({ hero_social_platform: e.target.value })}
                        placeholder="Accompagnements appréciés"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Statistique flottante</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <Label className="mb-0">Afficher la statistique flottante</Label>
                      <p className="text-muted-foreground text-xs">
                        Affiche ou masque le petit badge sur l’image du hero.
                      </p>
                    </div>

                    <Switch
                      checked={m.hero_floating_stat_enabled ?? true}
                      onCheckedChange={(checked) =>
                        setMeta({ hero_floating_stat_enabled: checked })
                      }
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="mb-2">Valeur</Label>
                      <Input
                        value={m.hero_floating_stat_value ?? ''}
                        onChange={(e) => setMeta({ hero_floating_stat_value: e.target.value })}
                        placeholder="97%"
                      />
                    </div>
                    <div>
                      <Label className="mb-2">Libellé</Label>
                      <Input
                        value={m.hero_floating_stat_label ?? ''}
                        onChange={(e) => setMeta({ hero_floating_stat_label: e.target.value })}
                        placeholder="Satisfaction"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="clarity-action">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Bloc “Du flou à l’action”</CardTitle>
                </CardHeader>

                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <Label className="mb-0">Activer ce bloc</Label>
                      <p className="text-muted-foreground text-xs">
                        Affiche ou masque complètement cette section sur la page d’accueil.
                      </p>
                    </div>

                    <Switch
                      checked={m.clarity_action_enabled ?? true}
                      onCheckedChange={(checked) => setMeta({ clarity_action_enabled: checked })}
                    />
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label className="mb-2">Titre principal</Label>
                      <Input
                        value={m.clarity_action_title ?? ''}
                        onChange={(e) => setMeta({ clarity_action_title: e.target.value })}
                        placeholder="Du flou à l’action : un cadre simple pour avancer"
                      />
                    </div>

                    <div>
                      <Label className="mb-2">Sous-titre</Label>
                      <Textarea
                        value={m.clarity_action_subtitle ?? ''}
                        onChange={(e) => setMeta({ clarity_action_subtitle: e.target.value })}
                        placeholder="Quand tout semble prioritaire, il devient difficile d’avancer avec clarté. Cet échange vous aide à faire le tri, retrouver une direction nette et passer à l’action avec plus de sérénité."
                        rows={3}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="space-y-4">
                      <div>
                        <Label className="mb-2">Titre colonne gauche</Label>
                        <Input
                          value={m.clarity_action_left_title ?? ''}
                          onChange={(e) =>
                            setMeta({
                              clarity_action_left_title: e.target.value,
                            })
                          }
                          placeholder="Vous avancez… mais sans direction vraiment claire"
                        />
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label>Liste gauche</Label>
                          <Button
                            type="button"
                            size="sm"
                            onClick={() =>
                              setMeta({
                                clarity_action_left_items: [
                                  ...(m.clarity_action_left_items ?? []),
                                  { text: '' },
                                ],
                              })
                            }
                          >
                            <Plus className="mr-1 h-4 w-4" /> Ajouter
                          </Button>
                        </div>

                        {(m.clarity_action_left_items ?? []).map((item, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <Input
                              placeholder="Texte du point"
                              value={item.text}
                              onChange={(e) =>
                                setMeta({
                                  clarity_action_left_items: updateItem(
                                    m.clarity_action_left_items ?? [],
                                    i,
                                    { text: e.target.value }
                                  ),
                                })
                              }
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                setMeta({
                                  clarity_action_left_items: removeItem(
                                    m.clarity_action_left_items ?? [],
                                    i
                                  ),
                                })
                              }
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        ))}

                        {(m.clarity_action_left_items ?? []).length === 0 && (
                          <p className="text-muted-foreground py-2 text-center text-sm">
                            Aucun élément. Cliquez sur Ajouter.
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label className="mb-2">Titre colonne droite</Label>
                        <Input
                          value={m.clarity_action_right_title ?? ''}
                          onChange={(e) =>
                            setMeta({
                              clarity_action_right_title: e.target.value,
                            })
                          }
                          placeholder="Ce que vous obtenez concrètement :"
                        />
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label>Liste droite</Label>
                          <Button
                            type="button"
                            size="sm"
                            onClick={() =>
                              setMeta({
                                clarity_action_right_items: [
                                  ...(m.clarity_action_right_items ?? []),
                                  { text: '' },
                                ],
                              })
                            }
                          >
                            <Plus className="mr-1 h-4 w-4" /> Ajouter
                          </Button>
                        </div>

                        {(m.clarity_action_right_items ?? []).map((item, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <Input
                              placeholder="Texte du point"
                              value={item.text}
                              onChange={(e) =>
                                setMeta({
                                  clarity_action_right_items: updateItem(
                                    m.clarity_action_right_items ?? [],
                                    i,
                                    { text: e.target.value }
                                  ),
                                })
                              }
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                setMeta({
                                  clarity_action_right_items: removeItem(
                                    m.clarity_action_right_items ?? [],
                                    i
                                  ),
                                })
                              }
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        ))}

                        {(m.clarity_action_right_items ?? []).length === 0 && (
                          <p className="text-muted-foreground py-2 text-center text-sm">
                            Aucun élément. Cliquez sur Ajouter.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg border p-4 space-y-4">
                    <div>
                      <Label className="mb-2">Titre du formulaire</Label>
                      <Input
                        value={m.clarity_action_final_cta_title ?? ''}
                        onChange={(e) =>
                          setMeta({
                            clarity_action_final_cta_title: e.target.value,
                          })
                        }
                        placeholder="Réservez un échange pour clarifier vos prochaines étapes"
                      />
                    </div>

                    <div>
                      <Label className="mb-2">Texte du formulaire</Label>
                      <Textarea
                        value={m.clarity_action_final_cta_subtitle ?? ''}
                        onChange={(e) =>
                          setMeta({
                            clarity_action_final_cta_subtitle: e.target.value,
                          })
                        }
                        placeholder="En 30 minutes, nous faisons le point sur votre situation, vos priorités et les actions les plus utiles pour avancer."
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label className="mb-2">Texte du bouton</Label>
                      <Input
                        value={m.clarity_action_final_cta_button_text ?? ''}
                        onChange={(e) =>
                          setMeta({
                            clarity_action_final_cta_button_text: e.target.value,
                          })
                        }
                        placeholder="Réserver mon appel découverte"
                      />
                    </div>

                    <div>
                      <Label className="mb-2">Preuve sociale du formulaire</Label>
                      <Input
                        value={m.clarity_action_social_proof_text ?? ''}
                        onChange={(e) =>
                          setMeta({
                            clarity_action_social_proof_text: e.target.value,
                          })
                        }
                        placeholder="Un accompagnement structuré et orienté résultats"
                      />
                    </div>

                    <div>
                      <Label className="mb-2">Texte de rareté / qualité</Label>
                      <Textarea
                        value={m.clarity_action_urgency_text ?? ''}
                        onChange={(e) =>
                          setMeta({
                            clarity_action_urgency_text: e.target.value,
                          })
                        }
                        placeholder="Je limite le nombre d’accompagnements chaque semaine pour garantir un suivi de qualité."
                        rows={2}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ── Statistiques (bande rouge) ─────────────── */}
          <TabsContent value="stats">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Bande de statistiques</CardTitle>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => setMeta({ stats: [...m.stats, { value: '', label: '' }] })}
                >
                  <Plus className="h-4 w-4 mr-1" /> Ajouter
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-muted-foreground text-sm">
                  Les compteurs animés sur fond rouge. Exemples : 150+ → Clients, 97% →
                  Satisfaction. Laissez vide pour masquer la section.
                </p>
                {m.stats.map((s, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Input
                      className="w-32"
                      placeholder="150+"
                      value={s.value}
                      onChange={(e) =>
                        setMeta({ stats: updateItem(m.stats, i, { value: e.target.value }) })
                      }
                    />
                    <Input
                      placeholder="Clients accompagnés"
                      value={s.label}
                      onChange={(e) =>
                        setMeta({ stats: updateItem(m.stats, i, { label: e.target.value }) })
                      }
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setMeta({ stats: removeItem(m.stats, i) })}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}
                {m.stats.length === 0 && (
                  <p className="text-muted-foreground text-sm text-center py-8">
                    Aucune statistique → section masquée. Cliquez sur Ajouter.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Processus ─────────────────────────────── */}
          <TabsContent value="process">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>En-tête de section</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="mb-2">Titre</Label>
                    <Input
                      value={m.process_title}
                      onChange={(e) => setMeta({ process_title: e.target.value })}
                      placeholder="Mon processus d'accompagnement"
                    />
                  </div>
                  <div>
                    <Label className="mb-2">Sous-titre (optionnel)</Label>
                    <Textarea
                      rows={2}
                      value={m.process_subtitle}
                      onChange={(e) => setMeta({ process_subtitle: e.target.value })}
                    />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Étapes du processus</CardTitle>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() =>
                      setMeta({
                        process: [
                          ...m.process,
                          { icon: 'CheckCircle', title: '', description: '' },
                        ],
                      })
                    }
                  >
                    <Plus className="h-4 w-4 mr-1" /> Ajouter
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {m.process.map((s, i) => (
                    <div key={i} className="border rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-sm">Étape {i + 1}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setMeta({ process: removeItem(m.process, i) })}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <div>
                          <Label className="mb-1 text-xs">Icône</Label>
                          <select
                            className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                            value={s.icon}
                            onChange={(e) =>
                              setMeta({
                                process: updateItem(m.process, i, { icon: e.target.value }),
                              })
                            }
                          >
                            {STEP_ICONS.map((ic) => (
                              <option key={ic}>{ic}</option>
                            ))}
                          </select>
                        </div>
                        <div className="md:col-span-3">
                          <Label className="mb-1 text-xs">Titre</Label>
                          <Input
                            value={s.title}
                            onChange={(e) =>
                              setMeta({
                                process: updateItem(m.process, i, { title: e.target.value }),
                              })
                            }
                          />
                        </div>
                      </div>
                      <div>
                        <Label className="mb-1 text-xs">Description</Label>
                        <Textarea
                          rows={2}
                          value={s.description}
                          onChange={(e) =>
                            setMeta({
                              process: updateItem(m.process, i, { description: e.target.value }),
                            })
                          }
                        />
                      </div>
                    </div>
                  ))}
                  {m.process.length === 0 && (
                    <p className="text-muted-foreground text-sm text-center py-4">
                      Aucune étape → section masquée. Cliquez sur Ajouter.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ── Pour qui ──────────────────────────────── */}
          <TabsContent value="for-whom">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>En-tête de section</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="mb-2">Titre</Label>
                    <Input
                      value={m.for_whom_title}
                      onChange={(e) => setMeta({ for_whom_title: e.target.value })}
                      placeholder="Ce coaching est fait pour vous si…"
                    />
                  </div>
                  <div>
                    <Label className="mb-2">Sous-titre (optionnel)</Label>
                    <Textarea
                      rows={2}
                      value={m.for_whom_subtitle}
                      onChange={(e) => setMeta({ for_whom_subtitle: e.target.value })}
                    />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Profils cibles</CardTitle>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() =>
                      setMeta({
                        for_whom: [
                          ...m.for_whom,
                          { icon: 'Briefcase', title: '', description: '' },
                        ],
                      })
                    }
                  >
                    <Plus className="h-4 w-4 mr-1" /> Ajouter
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {m.for_whom.map((c, i) => (
                    <div key={i} className="border rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-sm">Profil {i + 1}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setMeta({ for_whom: removeItem(m.for_whom, i) })}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <div>
                          <Label className="mb-1 text-xs">Icône</Label>
                          <select
                            className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                            value={c.icon}
                            onChange={(e) =>
                              setMeta({
                                for_whom: updateItem(m.for_whom, i, { icon: e.target.value }),
                              })
                            }
                          >
                            {WHOM_ICONS.map((ic) => (
                              <option key={ic}>{ic}</option>
                            ))}
                          </select>
                        </div>
                        <div className="md:col-span-3">
                          <Label className="mb-1 text-xs">Titre</Label>
                          <Input
                            value={c.title}
                            onChange={(e) =>
                              setMeta({
                                for_whom: updateItem(m.for_whom, i, { title: e.target.value }),
                              })
                            }
                          />
                        </div>
                      </div>
                      <div>
                        <Label className="mb-1 text-xs">Description</Label>
                        <Textarea
                          rows={2}
                          value={c.description}
                          onChange={(e) =>
                            setMeta({
                              for_whom: updateItem(m.for_whom, i, { description: e.target.value }),
                            })
                          }
                        />
                      </div>
                    </div>
                  ))}
                  {m.for_whom.length === 0 && (
                    <p className="text-muted-foreground text-sm text-center py-4">
                      Aucun profil → section masquée. Cliquez sur Ajouter.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ── Titres des sections DB ─────────────────── */}
          <TabsContent value="sections">
            <Card>
              <CardHeader>
                <CardTitle>Titres des sections dynamiques</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground text-sm">
                  Ces sections affichent des données de la base de données (formations publiées,
                  articles). Vous pouvez personnaliser leur titre.
                </p>
                <div>
                  <Label className="mb-2">Titre section Formations</Label>
                  <Input
                    value={m.trainings_title}
                    onChange={(e) => setMeta({ trainings_title: e.target.value })}
                    placeholder="Prochaines formations"
                  />
                </div>
                <div>
                  <Label className="mb-2">Titre section Blog</Label>
                  <Input
                    value={m.blog_title}
                    onChange={(e) => setMeta({ blog_title: e.target.value })}
                    placeholder="Derniers articles"
                  />
                </div>

                {/* ── Vidéo de bienvenue ── */}
                <hr className="my-2" />
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Vidéo de bienvenue
                </p>
                <div>
                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <Label className="mb-0">Activer la vidéo de bienvenue</Label>
                      <p className="text-muted-foreground text-xs">
                        Affiche une vidéo YouTube / Vimeo juste après le Hero.
                      </p>
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
                    onChange={(e) => setMeta({ video_url: e.target.value })}
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                </div>
                <div>
                  <Label className="mb-2">Titre de la section vidéo</Label>
                  <Input
                    value={m.video_title}
                    onChange={(e) => setMeta({ video_title: e.target.value })}
                    placeholder="Bienvenue dans mon univers"
                  />
                </div>
                <div>
                  <Label className="mb-2">Sous-titre de la section vidéo</Label>
                  <Input
                    value={m.video_subtitle}
                    onChange={(e) => setMeta({ video_subtitle: e.target.value })}
                    placeholder="Une courte vidéo pour faire connaissance…"
                  />
                </div>

                {/* ── Galerie photos ── */}
                <hr className="my-2" />
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Galerie photos
                </p>
                <div>
                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <Label className="mb-0">Activer la galerie photos</Label>
                      <p className="text-muted-foreground text-xs">
                        Désactive complètement la section sur la page d'accueil.
                      </p>
                    </div>
                    <Switch
                      checked={m.events_gallery_enabled ?? true}
                      onCheckedChange={(checked) => setMeta({ events_gallery_enabled: checked })}
                    />
                  </div>
                </div>
                <div>
                  <Label className="mb-2">Titre section Galerie photos</Label>
                  <Input
                    value={m.events_gallery_title}
                    onChange={(e) => setMeta({ events_gallery_title: e.target.value })}
                    placeholder="Galerie photos"
                  />
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
                          onChange={(e) => {
                            const files = Array.from(e.target.files ?? []);
                            if (!files.length) return;
                            setMeta({
                              events_gallery_images: removeItem(m.events_gallery_images ?? [], i),
                              events_gallery_captions: removeItem(
                                m.events_gallery_captions ?? [],
                                i
                              ),
                            });
                            const currentUploads = [...(data.gallery_uploads ?? [])];
                            const startIndex = currentImages.length;
                            setMeta({
                              events_gallery_images: [...currentImages, ...files.map(() => '')],
                              events_gallery_captions: [...currentCaptions, ...files.map(() => '')],
                            });
                            files.forEach((file, i) => {
                              currentUploads[startIndex + i] = file;
                            });
                            setData('gallery_uploads', currentUploads);
                            e.target.value = '';
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
                          });
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
                            onChange={(e) => {
                              const updated = [...(m.events_gallery_images ?? [])];
                              updated[i] = e.target.value;
                              setMeta({ events_gallery_images: updated });
                            }}
                          />
                        )}
                        <Input
                          placeholder="Légende (optionnelle)"
                          value={(m.events_gallery_captions ?? [])[i] ?? ''}
                          onChange={(e) => {
                            const updated = [...(m.events_gallery_captions ?? [])];
                            updated[i] = e.target.value;
                            setMeta({ events_gallery_captions: updated });
                          }}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setMeta({
                            events_gallery_images: removeItem(m.events_gallery_images ?? [], i),
                            events_gallery_captions: removeItem(m.events_gallery_captions ?? [], i),
                          });
                          setData('gallery_uploads', removeItem(data.gallery_uploads ?? [], i));
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                  {(m.events_gallery_images ?? []).length === 0 && (
                    <p className="text-muted-foreground text-sm text-center py-2">
                      Aucune photo ajoutée.
                    </p>
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
                <Button
                  type="button"
                  size="sm"
                  onClick={() => setMeta({ cta_benefits: [...m.cta_benefits, { text: '' }] })}
                >
                  <Plus className="h-4 w-4 mr-1" /> Ajouter
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-muted-foreground text-sm">
                  Ces points apparaissent dans la section de prise de rendez-vous. Laissez vide pour
                  utiliser les valeurs par défaut.
                </p>
                {m.cta_benefits.map((b, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Input
                      placeholder="Séance de découverte gratuite"
                      value={b.text}
                      onChange={(e) =>
                        setMeta({
                          cta_benefits: updateItem(m.cta_benefits, i, { text: e.target.value }),
                        })
                      }
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setMeta({ cta_benefits: removeItem(m.cta_benefits, i) })}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}
                {m.cta_benefits.length === 0 && (
                  <p className="text-muted-foreground text-sm text-center py-4">
                    Aucun avantage. Cliquez sur Ajouter.
                  </p>
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
  );
};

export default HomeEdit;
