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

interface Props {
  training: Training;
  progress: Record<string, { completed?: boolean }>;
  progress_percentage: number;
  section_progress: Record<string, {
    completed_lessons: number;
    total_lessons: number;
    progress_percentage: number;
  }>;
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
    return 'w-[5%]';
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
              <div className={`h-full rounded bg-red-600 ${progressClass(progress_percentage)}`} />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {training.sections?.map((section) => (
            <div
              key={section.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900/70"
            >
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{section.title}</h3>
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>
                    {section_progress?.[String(section.id)]?.completed_lessons ?? 0}/
                    {section_progress?.[String(section.id)]?.total_lessons ?? section.lessons?.length ?? 0} lecons terminees
                  </span>
                  <span>{section_progress?.[String(section.id)]?.progress_percentage ?? 0}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded bg-slate-100 dark:bg-slate-800">
                  <div
                    className={`h-full rounded bg-red-600 ${progressClass(
                      section_progress?.[String(section.id)]?.progress_percentage ?? 0
                    )}`}
                  />
                </div>
              </div>

              <div className="mt-3 space-y-3">
                {section.lessons?.map((lesson) => {
                  const isCompleted = !!progress?.[String(lesson.id)]?.completed;

                  return (
                    <div
                      key={lesson.id}
                      className="flex flex-col gap-3 rounded-xl border border-slate-200 p-4 dark:border-slate-700 md:flex-row md:items-center md:justify-between"
                    >
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">{lesson.title}</p>
                        {lesson.excerpt ? (
                          <p className="text-xs text-slate-600 dark:text-slate-400">{lesson.excerpt}</p>
                        ) : null}
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          {(lesson.resources?.length ?? 0)} ressource(s)
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-full px-2 py-1 text-xs ${
                            isCompleted
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                              : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                          }`}
                        >
                          {isCompleted ? 'Terminee' : 'A faire'}
                        </span>

                        <Link
                          href={route('learning.lesson', { training: training.id, lesson: lesson.id })}
                          className="inline-flex rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
                        >
                          Ouvrir
                        </Link>
                      </div>
                    </div>
                  );
                })}

                {section.quiz?.is_published ? (
                  <div className="flex items-center justify-between rounded-xl border border-dashed border-slate-300 p-3 dark:border-slate-600">
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">Quiz du module</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Score minimum: {section.quiz.passing_score}%
                      </p>
                    </div>

                    <Link
                      href={route('learning.quiz.show', { training: training.id, section: section.id })}
                      className="inline-flex rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700"
                    >
                      Passer le quiz
                    </Link>
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
