import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';
import DashboardLayout from '@/components/frontend/layouts/dashboard-layout';

interface Resource {
  id: number;
  title: string;
  description?: string;
  file_type?: string;
  external_url?: string | null;
  file_path?: string | null;
}

interface Lesson {
  id: number;
  section_id: number;
  title: string;
  content?: string;
  video_url?: string;
}

interface Training {
  id: number;
  title: string;
}

interface NextLesson {
  id: number;
  title: string;
}

interface SectionQuiz {
  id: number;
  title: string;
  passing_score: number;
  is_published: boolean;
}

interface Props {
  training: Training;
  lesson: Lesson;
  resources: Resource[];
  section_quiz?: SectionQuiz | null;
  is_completed: boolean;
  next_lesson?: NextLesson | null;
}

export default function LearningLesson({
  training,
  lesson,
  resources,
  section_quiz,
  is_completed,
  next_lesson,
}: Props) {
  const completeForm = useForm({});
  const uncompleteForm = useForm({});

  const markAsCompleted = () => {
    completeForm.post(route('learning.lessons.complete', { training: training.id, lesson: lesson.id }));
  };

  const markAsUncompleted = () => {
    uncompleteForm.post(route('learning.lessons.uncomplete', { training: training.id, lesson: lesson.id }));
  };

  return (
    <DashboardLayout title={lesson.title} currentPage="trainings">
      <Head title={lesson.title} />

      <div className="space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900/70">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{training.title}</p>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{lesson.title}</h2>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href={route('learning.show', { training: training.id })}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Retour au plan
              </Link>

              {is_completed ? (
                <button
                  type="button"
                  onClick={markAsUncompleted}
                  className="rounded-lg bg-amber-600 px-3 py-2 text-sm font-medium text-white hover:bg-amber-700"
                >
                  Marquer non terminee
                </button>
              ) : (
                <button
                  type="button"
                  onClick={markAsCompleted}
                  className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                >
                  Marquer terminee
                </button>
              )}
            </div>
          </div>
        </div>

        {lesson.video_url ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900/70">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">Video</h3>
            <a
              href={lesson.video_url}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex text-sm text-red-600 hover:text-red-700"
            >
              Ouvrir la video
            </a>
          </div>
        ) : null}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900/70">
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">Contenu de la lecon</h3>
          <div
            className="prose mt-3 max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: lesson.content || '<p>Aucun contenu pour cette lecon.</p>' }}
          />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900/70">
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">Ressources</h3>

          {resources.length === 0 ? (
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Aucune ressource disponible.</p>
          ) : (
            <div className="mt-3 space-y-2">
              {resources.map((resource) => (
                (() => {
                  const isExternal = Boolean(resource.external_url) && !resource.file_path;

                  return (
                <div
                  key={resource.id}
                  className="flex flex-col gap-2 rounded-xl border border-slate-200 p-3 dark:border-slate-700 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{resource.title}</p>
                    {resource.description ? (
                      <p className="text-xs text-slate-600 dark:text-slate-400">{resource.description}</p>
                    ) : null}
                    <div className="mt-1 flex items-center gap-2">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${
                          isExternal
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                            : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                        }`}
                      >
                        {isExternal ? 'Lien externe' : 'Fichier interne'}
                      </span>
                      {resource.file_type ? (
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">{resource.file_type}</span>
                      ) : null}
                    </div>
                  </div>

                  <a
                    href={route('learning.resources.download', { resource: resource.id })}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
                  >
                    {isExternal ? 'Ouvrir le lien' : 'Telecharger'}
                  </a>
                </div>
                  );
                })()
              ))}
            </div>
          )}
        </div>

        {section_quiz?.is_published ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-5 dark:border-slate-600 dark:bg-slate-900/70">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">Quiz du module</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Score minimum: {section_quiz.passing_score}%
                </p>
              </div>

              <Link
                href={route('learning.quiz.show', { training: training.id, section: lesson.section_id })}
                className="inline-flex rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700"
              >
                Passer le quiz
              </Link>
            </div>
          </div>
        ) : null}

        {next_lesson ? (
          <div className="flex justify-end">
            <Link
              href={route('learning.lesson', { training: training.id, lesson: next_lesson.id })}
              className="inline-flex rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              Lecon suivante: {next_lesson.title}
            </Link>
          </div>
        ) : null}
      </div>
    </DashboardLayout>
  );
}
