import React from 'react';
import { useForm, Link } from '@inertiajs/react';
import { route } from 'ziggy-js';

const CreateLesson = ({ training, sections }: any) => {
  const { data, setData, post, processing } = useForm({
    training_section_id: sections[0]?.id || '',
    title: '',
    excerpt: '',
    content: '',
    video_url: '',
    sort_order: 1,
    is_published: true,
  });

  const submit = (e: any) => {
    e.preventDefault();

    post(
      route('trainings.lessons.store', {
        training: training.id,
      })
    );
  };

  return (
    <form onSubmit={submit} className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">
        Nouvelle leçon
      </h1>

      <input
        className="border p-2 w-full"
        placeholder="Titre"
        value={data.title}
        onChange={(e) =>
          setData('title', e.target.value)
        }
      />

      <textarea
        className="border p-2 w-full"
        placeholder="Description"
        value={data.excerpt}
        onChange={(e) =>
          setData('excerpt', e.target.value)
        }
      />

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

export default CreateLesson;