import React from 'react';
import { Link, router } from '@inertiajs/react';
import { route } from 'ziggy-js';

const ResourcesIndex = ({ training, lesson, resources = [] }: any) => {
  const [orderedResources, setOrderedResources] = React.useState(resources);
  const [draggingId, setDraggingId] = React.useState<number | null>(null);

  React.useEffect(() => {
    setOrderedResources(resources);
  }, [resources]);

  const persistOrder = (nextList: any[]) => {
    router.post(
      route('trainings.lessons.resources.reorder', {
        training: training.id,
        lesson: lesson.id,
      }),
      {
        resource_ids: nextList.map((item) => item.id),
      },
      {
        preserveScroll: true,
      }
    );
  };

  const handleDrop = (targetId: number) => {
    if (draggingId === null || draggingId === targetId) {
      setDraggingId(null);
      return;
    }

    const current = [...orderedResources];
    const from = current.findIndex((item) => item.id === draggingId);
    const to = current.findIndex((item) => item.id === targetId);

    if (from === -1 || to === -1) {
      setDraggingId(null);
      return;
    }

    const [moved] = current.splice(from, 1);
    current.splice(to, 0, moved);

    setOrderedResources(current);
    setDraggingId(null);
    persistOrder(current);
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
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">Formation / Lecon</p>
          <h1 className="text-2xl font-bold">{lesson.title}</h1>
        </div>

        <Link
          href={route('trainings.lessons.resources.create', {
            training: training.id,
            lesson: lesson.id,
          })}
          className="rounded bg-red-600 px-4 py-2 text-sm text-white"
        >
          Nouvelle ressource
        </Link>
      </div>

      <div className="rounded-xl border bg-white">
        {resources.length === 0 ? (
          <div className="p-4 text-sm text-slate-500">Aucune ressource pour cette lecon.</div>
        ) : (
          <div className="divide-y">
            {orderedResources.map((resource: any) => (
              <div
                key={resource.id}
                draggable
                onDragStart={() => setDraggingId(resource.id)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => handleDrop(resource.id)}
                className="flex items-center justify-between p-4 cursor-move"
              >
                <div>
                  <p className="font-medium">{resource.title}</p>
                  {resource.description ? (
                    <p className="text-sm text-slate-500">{resource.description}</p>
                  ) : null}
                  <p className="text-xs text-slate-500 mt-1">
                    {resource.file_path ? 'Fichier local' : 'Lien externe'}
                    {resource.file_type ? ` • ${resource.file_type}` : ''}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">Glisser-deposer</span>
                  <Link
                    href={route('trainings.lessons.resources.edit', {
                      training: training.id,
                      lesson: lesson.id,
                      resource: resource.id,
                    })}
                    className="rounded border px-3 py-1 text-sm"
                  >
                    Modifier
                  </Link>

                  <button
                    type="button"
                    onClick={() => removeResource(resource.id)}
                    className="rounded border border-red-300 px-3 py-1 text-sm text-red-600"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResourcesIndex;
