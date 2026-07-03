import React from 'react';
import { Link, router, useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';
import {
  ArrowLeft,
  Save,
  FileText,
  Video,
  Settings,
  Eye,
  Paperclip,
  Trash,
  Plus,
} from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EditLessonProps, ResourceFormData } from '@/types/training';
import { validateFile, formatFileSize } from '@/utils/fileValidation';
import { toast } from 'sonner';

const EditLesson = ({ training, section, lesson }: EditLessonProps) => {
  const [activeTab, setActiveTab] = React.useState('general');

  const { data, setData, put, processing, errors } = useForm({
    title: lesson.title || '',
    excerpt: lesson.excerpt || '',
    content: lesson.content || '',
    video_url: lesson.video_url || '',
    video_duration: lesson.video_duration || '',
    thumbnail: lesson.thumbnail || '',
    sort_order: lesson.sort_order || 1,
    is_free: lesson.is_free || false,
    is_published: lesson.is_published || false,
  });

  const resourceForm =  useForm<ResourceFormData>({
    title: '',
    description: '',
    external_url: '',
    file: null as File | null,
    file_type: 'pdf',
    is_downloadable: true,
    is_public: false,
    sort_order: (lesson.resources?.length || 0) + 1,
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();

    put(
      route('trainings.lessons.update', {
        training: training.id,
        section: section.id,
        lesson: lesson.id,
      })
    );
  };

  const submitResource = (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side validation for file upload
    if (resourceForm.data.file) {
      const validation = validateFile(resourceForm.data.file, resourceForm.data.file_type);
      if (!validation.valid) {
        toast.error(validation.error || 'Fichier invalide.');
        return;
      }
    }

    resourceForm.post(
      route('trainings.lessons.resources.store', {
        training: training.id,
        lesson: lesson.id,
      }),
      {
        forceFormData: true,
        onSuccess: () => {
          resourceForm.reset();
          resourceForm.setData('file_type', 'pdf');
          resourceForm.setData('is_downloadable', true);
          resourceForm.setData('is_public', false);
          resourceForm.setData('sort_order', (lesson.resources?.length || 0) + 1);
        },
        onError: () => {
          const messages = Object.values(resourceForm.errors || {}).filter(Boolean);
          if (messages.length) {
            toast.error(messages.join('\n'));
            return;
          }

          toast.error("Erreur lors de l'upload de la ressource. Vérifiez les données.");
        },
      }
    );
  };

  const removeResource = (resourceId: number) => {
    if (!confirm('Supprimer cette ressource ?')) return;

    router.delete(
      route('trainings.lessons.resources.destroy', {
        training: training.id,
        lesson: lesson.id,
        resource: resourceId,
      })
    );
  };

  const tabs = [
    { key: 'general', label: 'Général', icon: FileText },
    { key: 'content', label: 'Contenu', icon: FileText },
    { key: 'video', label: 'Vidéo', icon: Video },
    { key: 'resources', label: 'Ressources', icon: Paperclip },
    { key: 'settings', label: 'Paramètres', icon: Settings },
    { key: 'preview', label: 'Aperçu', icon: Eye },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">Formation : {training.title}</p>
          <h1 className="text-2xl font-bold">Modifier la leçon</h1>
          <p className="text-slate-500 mt-1">Module : {section.title}</p>
        </div>

        <Button variant="outline" asChild>
          <Link href={route('trainings.sections.index', training.id)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour au constructeur
          </Link>
        </Button>
      </div>

      <form onSubmit={submit} className="space-y-6">
        <Card>
          <CardContent className="p-0">
            <div className="flex flex-wrap items-center gap-2 border-b p-4">
              {tabs.map((tab) => {
                const Icon = tab.icon;

                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key)}
                    className={`rounded-lg px-4 py-2 text-sm font-medium ${
                      activeTab === tab.key
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    <Icon className="h-4 w-4 inline mr-2" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <div className="p-6">
              {activeTab === 'general' && (
                <div className="space-y-5">
                  <div>
                    <label className="text-sm font-medium">Titre de la leçon</label>
                    <input
                      className="mt-1 w-full rounded-lg border p-3"
                      placeholder="Ex. Bienvenue dans la formation"
                      value={data.title}
                      onChange={(e) => setData('title', e.target.value)}
                    />
                    {errors.title && <p className="text-sm text-red-600 mt-1">{errors.title}</p>}
                  </div>

                  <div>
                    <label className="text-sm font-medium">Résumé court</label>
                    <textarea
                      className="mt-1 w-full rounded-lg border p-3 min-h-[120px]"
                      placeholder="Décrivez brièvement cette leçon."
                      value={data.excerpt}
                      onChange={(e) => setData('excerpt', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Image de couverture</label>
                    <input
                      className="mt-1 w-full rounded-lg border p-3"
                      placeholder="URL de l'image"
                      value={data.thumbnail}
                      onChange={(e) => setData('thumbnail', e.target.value)}
                    />
                  </div>
                </div>
              )}

              {activeTab === 'content' && (
                <div>
                  <label className="text-sm font-medium">Contenu principal</label>
                  <textarea
                    className="mt-1 w-full rounded-lg border p-3 min-h-[360px]"
                    placeholder="Écrivez le contenu de la leçon ici..."
                    value={data.content}
                    onChange={(e) => setData('content', e.target.value)}
                  />
                </div>
              )}

              {activeTab === 'video' && (
                <div className="space-y-5">
                  <div>
                    <label className="text-sm font-medium">URL vidéo</label>
                    <input
                      className="mt-1 w-full rounded-lg border p-3"
                      placeholder="https://youtube.com/..."
                      value={data.video_url}
                      onChange={(e) => setData('video_url', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Durée vidéo en minutes</label>
                    <input
                      type="number"
                      min="0"
                      className="mt-1 w-full rounded-lg border p-3"
                      value={data.video_duration}
                      onChange={(e) => setData('video_duration', e.target.value)}
                    />
                  </div>
                </div>
              )}

              {activeTab === 'resources' && (
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold">Ressources de la leçon</h2>

                      <Button variant="outline" size="sm" asChild>
                        <Link
                          href={route('trainings.lessons.resources.index', {
                            training: training.id,
                            lesson: lesson.id,
                          })}
                        >
                          Gestion avancée
                        </Link>
                      </Button>
                    </div>

                    {lesson.resources?.length ? (
                      <div className="space-y-2">
                        {lesson.resources.map((resource: any) => (
                          <div
                            key={resource.id}
                            className="flex items-center justify-between rounded-lg border p-3"
                          >
                            <div>
                              <p className="font-medium">{resource.title}</p>
                              {resource.description && (
                                <p className="text-sm text-slate-500">{resource.description}</p>
                              )}
                            </div>

                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => removeResource(resource.id)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500">Aucune ressource pour le moment.</p>
                    )}
                  </div>

                  <div className="rounded-xl border bg-slate-50 p-4">
                    <h3 className="font-medium mb-4">Ajouter une ressource</h3>

                    <div className="grid gap-4 md:grid-cols-2">
                      <input
                        title="Titre"
                        placeholder="Titre"
                        className="rounded-lg border p-3"
                        value={resourceForm.data.title}
                        onChange={(e) => resourceForm.setData('title', e.target.value)}
                      />
                      {resourceForm.errors.title && (
                        <p className="text-sm text-red-600">{resourceForm.errors.title}</p>
                      )}

                      <select
                        title="Type de fichier"
                        className="rounded-lg border p-3"
                        value={resourceForm.data.file_type}
                        onChange={(e) => resourceForm.setData('file_type', e.target.value)}
                      >
                        <option value="pdf">PDF</option>
                        <option value="video">Vidéo</option>
                        <option value="audio">Audio</option>
                        <option value="document">Document</option>
                        <option value="link">Lien externe</option>
                      </select>
                      {resourceForm.errors.file_type && (
                        <p className="text-sm text-red-600">{resourceForm.errors.file_type}</p>
                      )}
                    </div>

                    <textarea
                      title="Description"
                      placeholder="Description"
                      className="mt-4 w-full rounded-lg border p-3"
                      value={resourceForm.data.description}
                      onChange={(e) => resourceForm.setData('description', e.target.value)}
                    />
                    {resourceForm.errors.description && (
                      <p className="mt-1 text-sm text-red-600">{resourceForm.errors.description}</p>
                    )}

                    <input
                      title="URL externe"
                      placeholder="https://..."
                      className="mt-4 w-full rounded-lg border p-3"
                      value={resourceForm.data.external_url}
                      onChange={(e) => resourceForm.setData('external_url', e.target.value)}
                    />
                    {resourceForm.errors.external_url && (
                      <p className="mt-1 text-sm text-red-600">{resourceForm.errors.external_url}</p>
                    )}

                    <input
                      title="Fichier"
                      type="file"
                      className="mt-4 w-full rounded-lg border p-3"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        resourceForm.setData('file', file);

                        if (file && !resourceForm.data.title.trim()) {
                          const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
                          resourceForm.setData('title', fileNameWithoutExt);
                        }
                      }}
                    />
                    {resourceForm.errors.file && (
                      <p className="mt-1 text-sm text-red-600">{resourceForm.errors.file}</p>
                    )}

                    {resourceForm.data.file && (
                      <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm">
                          <span className="font-medium">Fichier sélectionné:</span>{' '}
                          {resourceForm.data.file.name}
                        </p>
                        <p className="text-sm text-slate-600">
                          Taille: {formatFileSize(resourceForm.data.file.size)}
                        </p>
                      </div>
                    )}

                    <div className="mt-4 flex justify-end">
                      <Button
                        type="button"
                        onClick={submitResource}
                        disabled={resourceForm.processing}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Ajouter la ressource
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium">Ordre d'affichage</label>
                    <input
                      type="number"
                      min="0"
                      className="mt-1 w-full rounded-lg border p-3"
                      value={data.sort_order}
                      onChange={(e) => setData('sort_order', Number(e.target.value))}
                    />
                  </div>

                  <div className="flex items-center gap-3 rounded-lg border p-4">
                    <input
                      id="is_published"
                      type="checkbox"
                      checked={data.is_published}
                      onChange={(e) => setData('is_published', e.target.checked)}
                    />
                    <label htmlFor="is_published" className="text-sm font-medium">
                      Publier la leçon
                    </label>
                  </div>

                  <div className="flex items-center gap-3 rounded-lg border p-4">
                    <input
                      id="is_free"
                      type="checkbox"
                      checked={data.is_free}
                      onChange={(e) => setData('is_free', e.target.checked)}
                    />
                    <label htmlFor="is_free" className="text-sm font-medium">
                      Leçon gratuite / aperçu
                    </label>
                  </div>
                </div>
              )}

              {activeTab === 'preview' && (
                <div className="space-y-4 rounded-xl border bg-slate-50 p-6">
                  <div className="flex items-center gap-2">
                    <Badge>{data.is_published ? 'Publié' : 'Brouillon'}</Badge>
                    {data.is_free && <Badge variant="secondary">Gratuit</Badge>}
                  </div>

                  <h2 className="text-2xl font-bold">{data.title || 'Titre de la leçon'}</h2>

                  <p className="text-slate-600">{data.excerpt || 'Résumé de la leçon...'}</p>

                  {data.video_url && (
                    <div className="rounded-lg border bg-white p-4 text-sm text-slate-600">
                      Vidéo : {data.video_url}
                    </div>
                  )}

                  <div className="prose max-w-none rounded-lg border bg-white p-4">
                    {data.content || 'Contenu de la leçon...'}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={processing}>
            <Save className="h-4 w-4 mr-2" />
            {processing ? 'Enregistrement...' : 'Sauvegarder la leçon'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditLesson;
