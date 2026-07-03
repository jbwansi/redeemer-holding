import React from 'react';
import { useForm, Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { ArrowLeft, Save, FileText, Video, Settings, Eye } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const CreateLesson = ({ training, section }: any) => {
  const [activeTab, setActiveTab] = React.useState('general');

  const { data, setData, post, processing, errors } = useForm({
    title: '',
    excerpt: '',
    content: '',
    video_url: '',
    video_duration: '',
    thumbnail: '',
    sort_order: 1,
    is_free: false,
    is_published: true,
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();

    post(
      route('trainings.sections.lessons.store', {
        training: training.id,
        section: section.id,
      })
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">Formation : {training.title}</p>
          <h1 className="text-2xl font-bold">Créer une leçon</h1>
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
              <button
                type="button"
                onClick={() => setActiveTab('general')}
                className={`rounded-lg px-4 py-2 text-sm font-medium ${
                  activeTab === 'general'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                <FileText className="h-4 w-4 inline mr-2" />
                Général
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('content')}
                className={`rounded-lg px-4 py-2 text-sm font-medium ${
                  activeTab === 'content'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                <FileText className="h-4 w-4 inline mr-2" />
                Contenu
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('video')}
                className={`rounded-lg px-4 py-2 text-sm font-medium ${
                  activeTab === 'video' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                <Video className="h-4 w-4 inline mr-2" />
                Vidéo
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('settings')}
                className={`rounded-lg px-4 py-2 text-sm font-medium ${
                  activeTab === 'settings'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                <Settings className="h-4 w-4 inline mr-2" />
                Paramètres
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`rounded-lg px-4 py-2 text-sm font-medium ${
                  activeTab === 'preview'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                <Eye className="h-4 w-4 inline mr-2" />
                Aperçu
              </button>
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
                      placeholder="Décrivez brièvement ce que l'apprenant va découvrir dans cette leçon."
                      value={data.excerpt}
                      onChange={(e) => setData('excerpt', e.target.value)}
                    />
                    {errors.excerpt && (
                      <p className="text-sm text-red-600 mt-1">{errors.excerpt}</p>
                    )}
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
                <div className="space-y-5">
                  <div>
                    <label className="text-sm font-medium">Contenu principal</label>
                    <textarea
                      className="mt-1 w-full rounded-lg border p-3 min-h-[320px]"
                      placeholder="Écrivez le contenu de la leçon ici..."
                      value={data.content}
                      onChange={(e) => setData('content', e.target.value)}
                    />
                    {errors.content && (
                      <p className="text-sm text-red-600 mt-1">{errors.content}</p>
                    )}
                  </div>
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
                    {errors.video_url && (
                      <p className="text-sm text-red-600 mt-1">{errors.video_url}</p>
                    )}
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

                  <h2 className="text-2xl font-bold"> {data.title || 'Titre de la leçon'} </h2>

                  <p className="text-slate-600"> {data.excerpt || 'Résumé de la leçon...'} </p>

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
            {processing ? 'Enregistrement...' : 'Enregistrer la leçon'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateLesson;
