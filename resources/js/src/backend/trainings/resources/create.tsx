import React from 'react';
import { useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';

const ResourceCreate = ({ training, lesson }: any) => {
  const { data, setData, post, processing, errors } = useForm({
    title: '',
    description: '',
    external_url: '',
    file: null as File | null,
    file_type: 'pdf',
    is_downloadable: true,
    is_public: false,
    sort_order: 0,
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();

    post(
      route('trainings.lessons.resources.store', {
        training: training.id,
        lesson: lesson.id,
      }),
      {
        forceFormData: true,
      }
    );
  };

  return (
    <form onSubmit={submit} className="p-6 space-y-4 max-w-3xl">
      <h1 className="text-2xl font-bold">Nouvelle ressource</h1>

      <div>
        <label htmlFor="title" className="block text-sm mb-1">
          Titre
        </label>
        <input
          id="title"
          title="Titre"
          placeholder="Nom de la ressource"
          className="border p-2 w-full"
          value={data.title}
          onChange={(e) => setData('title', e.target.value)}
        />
        {errors.title ? <p className="text-xs text-red-600 mt-1">{errors.title}</p> : null}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm mb-1">
          Description
        </label>
        <textarea
          id="description"
          title="Description"
          placeholder="Description optionnelle"
          className="border p-2 w-full"
          value={data.description}
          onChange={(e) => setData('description', e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="file" className="block text-sm mb-1">
          Fichier (optionnel)
        </label>
        <input
          id="file"
          title="Fichier"
          placeholder="Choisir un fichier"
          type="file"
          onChange={(e) => setData('file', e.target.files?.[0] || null)}
        />
        {errors.file ? <p className="text-xs text-red-600 mt-1">{errors.file}</p> : null}
      </div>

      <div>
        <label htmlFor="external_url" className="block text-sm mb-1">
          URL externe (optionnel)
        </label>
        <input
          id="external_url"
          title="URL externe"
          className="border p-2 w-full"
          value={data.external_url}
          onChange={(e) => setData('external_url', e.target.value)}
          placeholder="https://..."
        />
        {errors.external_url ? (
          <p className="text-xs text-red-600 mt-1">{errors.external_url}</p>
        ) : null}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label htmlFor="file_type" className="block text-sm mb-1">
            Type de fichier
          </label>
          <input
            id="file_type"
            title="Type de fichier"
            placeholder="pdf"
            className="border p-2 w-full"
            value={data.file_type}
            onChange={(e) => setData('file_type', e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="sort_order" className="block text-sm mb-1">
            Ordre
          </label>
          <input
            id="sort_order"
            title="Ordre"
            placeholder="0"
            type="number"
            className="border p-2 w-full"
            value={data.sort_order}
            onChange={(e) => setData('sort_order', Number(e.target.value))}
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={data.is_downloadable}
            onChange={(e) => setData('is_downloadable', e.target.checked)}
          />
          Telechargeable
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={data.is_public}
            onChange={(e) => setData('is_public', e.target.checked)}
          />
          Public
        </label>
      </div>

      <button
        type="submit"
        disabled={processing}
        className="bg-red-600 text-white px-4 py-2 rounded"
      >
        Enregistrer
      </button>
    </form>
  );
};

export default ResourceCreate;
