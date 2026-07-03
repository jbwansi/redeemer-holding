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

interface Section {
  id: number;
  title: string;
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
  section: Section;
  lesson: Lesson;
  resources: Resource[];
  section_quiz?: SectionQuiz | null;
  is_completed: boolean;
  next_lesson?: NextLesson | null;
  can_take_quiz: boolean;
  section_lessons_count: number;
  section_completed_lessons_count: number;
}

export default function LearningLesson({
  training,
  section,
  lesson,
  resources,
  section_quiz,
  is_completed,
  next_lesson,
  can_take_quiz,
  section_lessons_count,
  section_completed_lessons_count,
}: Props) {
  const completeForm = useForm({});
  const uncompleteForm = useForm({});

  const markAsCompleted = () => {
    completeForm.post(
      route('learning.lessons.complete', { training: training.id, lesson: lesson.id })
    );
  };

  const markAsUncompleted = () => {
    uncompleteForm.post(
      route('learning.lessons.uncomplete', { training: training.id, lesson: lesson.id })
    );
  };

  return (
    <DashboardLayout title={lesson.title} currentPage="trainings">
      <Head title={lesson.title} />

      <div className="space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900/70">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {training.title}
              </p>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                {lesson.title}
              </h2>
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
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">
            Contenu de la lecon
          </h3>
          <div
            className="prose mt-3 max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{
              __html: lesson.content || '<p>Aucun contenu pour cette lecon.</p>',
            }}
          />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900/70">
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">Ressources</h3>

          {resources.length === 0 ? (
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Aucune ressource disponible.
            </p>
          ) : (
            <div className="mt-3 space-y-2">
              {resources.map((resource) =>
                (() => {
                  const isExternal = Boolean(resource.external_url) && !resource.file_path;

                  return (
                    <div
                      key={resource.id}
                      className="flex flex-col gap-2 rounded-xl border border-slate-200 p-3 dark:border-slate-700 md:flex-row md:items-center md:justify-between"
                    >
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                          {resource.title}
                        </p>
                        {resource.description ? (
                          <p className="text-xs text-slate-600 dark:text-slate-400">
                            {resource.description}
                          </p>
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
                            <span className="text-[11px] text-slate-500 dark:text-slate-400">
                              {resource.file_type}
                            </span>
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
              )}
            </div>
          )}
        </div>

        {is_completed ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-900/50 dark:bg-emerald-900/20">
            <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
              ✓ Leçon terminée
            </p>

            {can_take_quiz ? (
              <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-300">
                Félicitations ! Vous avez terminé toutes les leçons de ce module. Le quiz est
                maintenant disponible.
              </p>
            ) : (
              <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-300">
                Continuez votre progression avec la leçon suivante.
              </p>
            )}
          </div>
        ) : null}

        {section_quiz?.is_published ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-5 dark:border-slate-600 dark:bg-slate-900/70">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {can_take_quiz ? '🎯 Quiz disponible' : '🔒 Quiz verrouillé'}
                </p>

                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Score minimum : {section_quiz.passing_score}%
                </p>

                <div className="mt-3">
                  <div className="mb-1 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>
                      Progression du module : {section_completed_lessons_count}/
                      {section_lessons_count} leçons
                    </span>
                    <span>
                      {section_lessons_count > 0
                        ? Math.round(
                            (section_completed_lessons_count / section_lessons_count) * 100
                          )
                        : 0}
                      %
                    </span>
                  </div>

                  <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700">
                    <div
                      className="h-2 rounded-full bg-red-600 transition-all"
                      style={{
                        width: `${
                          section_lessons_count > 0
                            ? Math.round(
                                (section_completed_lessons_count / section_lessons_count) * 100
                              )
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>

                {!can_take_quiz ? (
                  <p className="mt-3 text-xs text-amber-600 dark:text-amber-400">
                    Encore {section_lessons_count - section_completed_lessons_count} leçon(s) à
                    terminer pour déverrouiller automatiquement le quiz.
                  </p>
                ) : (
                  <p className="mt-3 text-xs text-emerald-600 dark:text-emerald-400">
                    Toutes les leçons du module sont terminées. Vous pouvez maintenant passer le
                    quiz.
                  </p>
                )}
              </div>

              {can_take_quiz ? (
                <Link
                  href={route('learning.quiz.show', {
                    training: training.id,
                    section: section.id,
                  })}
                  className="inline-flex rounded-lg bg-red-600 px-4 py-2 text-xs font-medium text-white hover:bg-red-700"
                >
                  Commencer le quiz
                </Link>
              ) : (
                <button
                  type="button"
                  disabled
                  className="inline-flex cursor-not-allowed rounded-lg bg-slate-300 px-4 py-2 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-400"
                >
                  Quiz verrouillé
                </button>
              )}
            </div>
          </div>
        ) : null}

        <div className="flex justify-end gap-3">
          {is_completed && can_take_quiz && section_quiz?.is_published ? (
            <Link
              href={route('learning.quiz.show', {
                training: training.id,
                section: section.id,
              })}
              className="inline-flex rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              Commencer le quiz
            </Link>
          ) : null}

          {is_completed && !can_take_quiz && next_lesson ? (
            <Link
              href={route('learning.lesson', {
                training: training.id,
                lesson: next_lesson.id,
              })}
              className="inline-flex rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              Leçon suivante : {next_lesson.title}
            </Link>
          ) : null}
        </div>
      </div>
    </DashboardLayout>
  );
}
