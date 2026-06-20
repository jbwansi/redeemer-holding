import React from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';
import DashboardLayout from '@/components/frontend/layouts/dashboard-layout';

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  sort_order: number;
}

interface Quiz {
  id: number;
  title: string;
  description?: string;
  passing_score: number;
  questions: QuizQuestion[];
}

interface Props {
  training: { id: number; title: string };
  section: { id: number; title: string };
  quiz: Quiz;
  latest_attempt?: {
    score: number;
    passed: boolean;
    correct_answers: number;
    total_questions: number;
    submitted_at?: string;
  } | null;
}

export default function LearningQuiz({ training, section, quiz, latest_attempt }: Props) {
  const { flash } = usePage().props as { flash?: { success?: string } };

  const { data, setData, post, processing } = useForm<{ answers: Record<string, number | null> }>({
    answers: {},
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('learning.quiz.submit', { training: training.id, section: section.id }));
  };

  return (
    <DashboardLayout title={quiz.title} currentPage="trainings">
      <Head title={quiz.title} />

      <div className="space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900/70">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {training.title} / {section.title}
              </p>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{quiz.title}</h2>
              {quiz.description ? (
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{quiz.description}</p>
              ) : null}
            </div>

            <Link
              href={route('learning.show', { training: training.id })}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Retour au module
            </Link>
          </div>

          <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
            Score minimum requis: <span className="font-semibold">{quiz.passing_score}%</span>
          </p>
        </div>

        {flash?.success ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {flash.success}
          </div>
        ) : null}

        {latest_attempt ? (
          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900/70">
            <p className="text-sm text-slate-600 dark:text-slate-400">Derniere tentative</p>
            <p className="mt-1 text-sm font-medium text-slate-900 dark:text-white">
              Score: {latest_attempt.score}% ({latest_attempt.correct_answers}/{latest_attempt.total_questions}) -{' '}
              {latest_attempt.passed ? 'Reussi' : 'Non reussi'}
            </p>
          </div>
        ) : null}

        <form onSubmit={submit} className="space-y-4">
          {quiz.questions.map((question, index) => (
            <div
              key={question.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900/70"
            >
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                Question {index + 1}: {question.question}
              </p>

              <div className="mt-3 space-y-2">
                {question.options.map((option, optionIndex) => (
                  <label
                    key={`${question.id}-${optionIndex}`}
                    className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 p-2 text-sm dark:border-slate-700"
                  >
                    <input
                      type="radio"
                      name={`question-${question.id}`}
                      checked={data.answers[String(question.id)] === optionIndex}
                      onChange={() =>
                        setData('answers', {
                          ...data.answers,
                          [String(question.id)]: optionIndex,
                        })
                      }
                    />
                    {option}
                  </label>
                ))}
              </div>
            </div>
          ))}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={processing}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              Soumettre le quiz
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
