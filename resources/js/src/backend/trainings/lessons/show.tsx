import React from 'react';
import DOMPurify from 'dompurify';
import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';

const ShowLesson = ({ training, lesson }: any) => {
  const safeContent = DOMPurify.sanitize(
    lesson.content || ''
  );

  return (
    <div className="p-6 space-y-6">
      <div>
        <p className="text-slate-500">
          {training.title}
        </p>

        <h1 className="text-3xl font-bold">
          {lesson.title}
        </h1>

        <div className="mt-3">
          <Link
            href={route('trainings.lessons.resources.index', {
              training: training.id,
              lesson: lesson.id,
            })}
            className="text-sm text-red-600 underline"
          >
            Gérer les ressources de cette leçon
          </Link>
        </div>
      </div>

      {lesson.video_url && (
        <div>
          <a
            href={lesson.video_url}
            target="_blank"
            rel="noreferrer"
            className="text-red-600 underline"
          >
            Voir la vidéo
          </a>
        </div>
      )}

      <div
        className="prose max-w-none"
        dangerouslySetInnerHTML={{
          __html: safeContent,
        }}
      />
    </div>
  );
};

export default ShowLesson;