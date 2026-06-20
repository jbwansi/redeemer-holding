import React from 'react';
import { Link, router, useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';

const EditLesson = ({
  training,
  lesson,
  sections,
}: any) => {
  const { data, setData, put, processing } =
    useForm({
      training_section_id:
        lesson.training_section_id,
      title: lesson.title,
      excerpt: lesson.excerpt,
      content: lesson.content,
      video_url: lesson.video_url,
      sort_order: lesson.sort_order,
      is_published: lesson.is_published,
    });

  const resourceForm = useForm({
    title: '',
    description: '',
    external_url: '',
    file: null as File | null,
    file_type: 'pdf',
    is_downloadable: true,
    is_public: false,
    sort_order: (lesson.resources?.length || 0) + 1,
  });

  const submit = (e: any) => {
    e.preventDefault();

    put(
      route('trainings.lessons.update', {
        training: training.id,
        lesson: lesson.id,
      })
    );
  };

  const submitResource = (e: React.FormEvent) => {
    e.preventDefault();

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
      }
    );
  };

  const removeResource = (resourceId: number) => {
    if (!confirm('Supprimer cette ressource ?')) {
      return;
    }

    router.delete(
      route('trainings.lessons.resources.destroy', {
        training: training.id,
        lesson: lesson.id,
        resource: resourceId,
      })
    );
  };

  return (
    <div className="p-6 space-y-8">
      <form onSubmit={submit} className="space-y-4">
        <h1 className="text-2xl font-bold">
          Modifier la leçon
        </h1>

        <input
          title="Titre de la leçon"
          placeholder="Titre de la leçon"
          className="border p-2 w-full"
          value={data.title}
          onChange={(e) =>
            setData('title', e.target.value)
          }
        />

        <button
          type="submit"
          disabled={processing}
          className="bg-red-600 text-white px-4 py-2 rounded"
        >
          Sauvegarder
        </button>
      </form>

      <div className="rounded-xl border bg-white p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Ressources de la leçon</h2>
          <Link
            href={route('trainings.lessons.resources.index', {
              training: training.id,
              lesson: lesson.id,
            })}
            className="text-sm text-red-600 underline"
          >
            Gestion avancée
          </Link>
        </div>

        {lesson.resources?.length ? (
          <div className="space-y-2 mb-5">
            {lesson.resources.map((resource: any) => (
              <div key={resource.id} className="flex items-center justify-between border rounded p-3">
                <div>
                  <p className="font-medium">{resource.title}</p>
                  {resource.description ? <p className="text-sm text-slate-500">{resource.description}</p> : null}
                </div>

                <button
                  type="button"
                  onClick={() => removeResource(resource.id)}
                  className="text-sm text-red-600 border border-red-300 rounded px-3 py-1"
                >
                  Supprimer
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500 mb-5">Aucune ressource pour le moment.</p>
        )}

        <form onSubmit={submitResource} className="space-y-3">
          <h3 className="font-medium">Ajouter une ressource</h3>

          <input
            title="Titre"
            placeholder="Titre"
            className="border p-2 w-full"
            value={resourceForm.data.title}
            onChange={(e) => resourceForm.setData('title', e.target.value)}
          />

          <textarea
            title="Description"
            placeholder="Description"
            className="border p-2 w-full"
            value={resourceForm.data.description}
            onChange={(e) => resourceForm.setData('description', e.target.value)}
          />

          <input
            title="URL externe"
            placeholder="https://..."
            className="border p-2 w-full"
            value={resourceForm.data.external_url}
            onChange={(e) => resourceForm.setData('external_url', e.target.value)}
          />

          <input
            title="Fichier"
            type="file"
            onChange={(e) => resourceForm.setData('file', e.target.files?.[0] || null)}
          />

          <button
            type="submit"
            disabled={resourceForm.processing}
            className="bg-slate-900 text-white px-4 py-2 rounded"
          >
            Ajouter la ressource
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditLesson;