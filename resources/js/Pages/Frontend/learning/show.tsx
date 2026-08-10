import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import DashboardLayout from '@/components/frontend/layouts/dashboard-layout';

interface Resource {
  id: number;
}

interface Lesson {
  id: number;
  title: string;
  excerpt?: string;
  sort_order: number;
  resources?: Resource[];
}

interface Section {
  id: number;
  title: string;
  lessons: Lesson[];
  quiz?: {
    id: number;
    title: string;
    passing_score: number;
    is_published: boolean;
  } | null;
}

interface Training {
  id: number;
  title: string;
  excerpt?: string;
  sections: Section[];
}

interface SectionProgress {
  completed_lessons: number;
  total_lessons: number;
  progress_percentage: number;
  is_completed: boolean;
  can_access: boolean;
  can_take_quiz: boolean;
}

interface Props {
  training: Training;
  progress: Record<string, { completed?: boolean }>;
  progress_percentage: number;
  section_progress: Record<string, SectionProgress>;
}

export default function LearningShow({
  training,
  progress,
  progress_percentage,
  section_progress,
}: Props) {
  const progressClass = (value: number) => {
    if (value >= 100) return 'w-full';
    if (value >= 75) return 'w-3/4';
    if (value >= 50) return 'w-1/2';
    if (value >= 25) return 'w-1/4';
    return value > 0 ? 'w-[5%]' : 'w-0';
  };

  return (
    <DashboardLayout title={training.title} currentPage="trainings">
      <Head title={training.title} />

      <div className="space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900/70">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{training.title}</h2>

          {training.excerpt ? (
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{training.excerpt}</p>
          ) : null}

          <div className="mt-4">
            <div className="mb-1 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>Progression globale</span>
              <span>{progress_percentage}%</span>
            </div>

            <div className="h-2 overflow-hidden rounded bg-slate-100 dark:bg-slate-800">
              <div
                className={`h-full rounded bg-red-600 transition-all ${progressClass(
                  progress_percentage
                )}`}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {training.sections?.map((section) => {
            const sectionProgress = section_progress?.[String(section.id)];

            const canAccess = sectionProgress?.can_access ?? false;
            const isSectionCompleted = sectionProgress?.is_completed ?? false;
            const canTakeQuiz = sectionProgress?.can_take_quiz ?? false;

            const completedLessons = sectionProgress?.completed_lessons ?? 0;
            const totalLessons = sectionProgress?.total_lessons ?? section.lessons?.length ?? 0;
            const sectionPercentage = sectionProgress?.progress_percentage ?? 0;

            return (
              <div
                key={section.id}
                className={`rounded-2xl border p-5 transition-all ${
                  !canAccess
                    ? 'border-slate-200 bg-slate-100 opacity-75 dark:border-slate-700 dark:bg-slate-800/50'
                    : isSectionCompleted
                      ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-900/50 dark:bg-emerald-900/20'
                      : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900/70'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                        {!canAccess ? '🔒 ' : isSectionCompleted ? '✅ ' : '🔓 '}
                        {section.title}
                      </h3>

                      {!canAccess ? (
                        <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                          Terminez le module précédent pour déverrouiller celui-ci.
                        </p>
                      ) : isSectionCompleted ? (
                        <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">
                          Module validé.
                        </p>
                      ) : (
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          Progression : {completedLessons}/{totalLessons} leçons terminées
                        </p>
                      )}
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        !canAccess
                          ? 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                          : isSectionCompleted
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                            : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                      }`}
                    >
                      {!canAccess ? 'Verrouillé' : isSectionCompleted ? 'Validé' : 'En cours'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>
                      {completedLessons}/{totalLessons} leçons terminées
                    </span>
                    <span>{sectionPercentage}%</span>
                  </div>

                  <div className="h-2 overflow-hidden rounded bg-slate-200 dark:bg-slate-800">
                    <div
                      className={`h-full rounded transition-all ${
                        isSectionCompleted ? 'bg-emerald-600' : 'bg-red-600'
                      } ${progressClass(sectionPercentage)}`}
                    />
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  {section.lessons?.map((lesson) => {
                    const isCompleted = !!progress?.[String(lesson.id)]?.completed;

                    return (
                      <div
                        key={lesson.id}
                        className={`flex flex-col gap-3 rounded-xl border p-4 md:flex-row md:items-center md:justify-between ${
                          !canAccess
                            ? 'border-slate-200 bg-white/60 dark:border-slate-700 dark:bg-slate-900/30'
                            : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900/60'
                        }`}
                      >
                        <div>
                          <p
                            className={`text-sm font-medium ${
                              !canAccess ? 'text-slate-400' : 'text-slate-900 dark:text-white'
                            }`}
                          >
                            {!canAccess ? '🔒 ' : isCompleted ? '✅ ' : ''}
                            {lesson.title}
                          </p>

                          {lesson.excerpt ? (
                            <p className="text-xs text-slate-600 dark:text-slate-400">
                              {lesson.excerpt}
                            </p>
                          ) : null}

                          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            {lesson.resources?.length ?? 0} ressource(s)
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`rounded-full px-2 py-1 text-xs ${
                              isCompleted
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                                : !canAccess
                                  ? 'bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
                                  : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                            }`}
                          >
                            {isCompleted ? 'Terminée' : !canAccess ? 'Verrouillée' : 'À faire'}
                          </span>

                          {canAccess ? (
                            <Link
                              href={route('learning.lesson', {
                                training: training.id,
                                lesson: lesson.id,
                              })}
                              className="inline-flex rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
                            >
                              Ouvrir
                            </Link>
                          ) : (
                            <button
                              type="button"
                              disabled
                              className="inline-flex cursor-not-allowed rounded-lg bg-slate-300 px-3 py-2 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-400"
                            >
                              Verrouillé
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {section.quiz?.is_published ? (
                    <div
                      className={`flex flex-col gap-3 rounded-xl border border-dashed p-4 md:flex-row md:items-center md:justify-between ${
                        !canAccess
                          ? 'border-slate-300 bg-white/60 dark:border-slate-700 dark:bg-slate-900/30'
                          : canTakeQuiz
                            ? 'border-red-300 bg-red-50 dark:border-red-900/50 dark:bg-red-900/20'
                            : 'border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-900/60'
                      }`}
                    >
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                          {!canAccess
                            ? '🔒 Quiz verrouillé'
                            : canTakeQuiz
                              ? '🎯 Quiz disponible'
                              : '🔒 Quiz verrouillé'}
                        </p>

                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Score minimum : {section.quiz.passing_score}%
                        </p>

                        {!canAccess ? (
                          <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                            Terminez le module précédent pour accéder à ce quiz.
                          </p>
                        ) : !canTakeQuiz ? (
                          <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                            Terminez toutes les leçons de ce module pour déverrouiller le quiz.
                          </p>
                        ) : (
                          <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">
                            Vous pouvez maintenant passer le quiz.
                          </p>
                        )}
                      </div>

                      {canAccess && canTakeQuiz ? (
                        <Link
                          href={route('learning.quiz.show', {
                            training: training.id,
                            section: section.id,
                          })}
                          className="inline-flex rounded-lg bg-red-600 px-3 py-2 text-xs font-medium text-white hover:bg-red-700"
                        >
                          Commencer le quiz
                        </Link>
                      ) : (
                        <button
                          type="button"
                          disabled
                          className="inline-flex cursor-not-allowed rounded-lg bg-slate-300 px-3 py-2 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-400"
                        >
                          Quiz verrouillé
                        </button>
                      )}
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
