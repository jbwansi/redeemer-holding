import React from 'react';
import { Head, Link } from '@inertiajs/react';
import DashboardLayout from '@/components/frontend/layouts/dashboard-layout';

interface LearningTraining {
  id: number;
  title: string;
  excerpt: string;
  lessons_count: number;
  completed_lessons: number;
  progress: number;
  action_label: string;
  action_url: string;
}

interface Props {
  trainings: LearningTraining[];
}

export default function LearningIndex({ trainings }: Props) {
  const progressClass = (progress: number) => {
    if (progress >= 100) return 'w-full';
    if (progress >= 75) return 'w-3/4';
    if (progress >= 50) return 'w-1/2';
    if (progress >= 25) return 'w-1/4';
    return 'w-[5%]';
  };

  return (
    <DashboardLayout title="Mon apprentissage" currentPage="trainings">
      <Head title="Mon apprentissage" />

      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            Mes formations en cours
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Continuez vos lecons, suivez votre progression et accedez aux ressources.
          </p>
        </div>

        {trainings.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center dark:border-slate-700 dark:bg-slate-900/40">
            <p className="text-slate-700 dark:text-slate-300">
              Aucune formation disponible pour votre compte.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {trainings.map((training) => (
              <div
                key={training.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900/70"
              >
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {training.title}
                </h3>
                <p className="mt-1 line-clamp-2 text-sm text-slate-600 dark:text-slate-400">
                  {training.excerpt}
                </p>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>
                      {training.completed_lessons}/{training.lessons_count} lecons terminees
                    </span>
                    <span>{training.progress}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded bg-slate-100 dark:bg-slate-800">
                    <div
                      className={`h-full rounded bg-red-600 ${progressClass(training.progress)}`}
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <Link
                    href={training.action_url}
                    className="inline-flex rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                  >
                    {training.action_label}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
