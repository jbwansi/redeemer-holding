import React from 'react';
import { Link, useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const EditSection = ({ training, section }: any) => {
  const { data, setData, put, processing } = useForm({
    title: section.title || '',
    description: section.description || '',
    sort_order: section.sort_order ?? 1,
    is_published: !!section.is_published,
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();

    put(
      route('trainings.sections.update', {
        training: training.id,
        section: section.id,
      })
    );
  };

  return (
    <form onSubmit={submit} className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Modifier le module</h1>
        <Button variant="outline" asChild>
          <Link href={route('trainings.sections.index', { training: training.id })}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Link>
        </Button>
      </div>

      <input
        title="Titre du module"
        className="border p-2 w-full"
        placeholder="Titre du module"
        value={data.title}
        onChange={(e) => setData('title', e.target.value)}
      />

      <textarea
        title="Description du module"
        className="border p-2 w-full"
        placeholder="Description"
        value={data.description}
        onChange={(e) => setData('description', e.target.value)}
      />

      <input
        type="number"
        title="Ordre"
        className="border p-2 w-full"
        placeholder="Ordre"
        value={data.sort_order}
        onChange={(e) => setData('sort_order', Number(e.target.value))}
      />

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={data.is_published}
          onChange={(e) => setData('is_published', e.target.checked)}
        />
        Module publié
      </label>

      <button
        type="submit"
        disabled={processing}
        className="bg-red-600 text-white px-4 py-2 rounded"
      >
        Mettre à jour
      </button>
    </form>
  );
};

export default EditSection;
