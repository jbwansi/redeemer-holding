import React from 'react';
import { Link, useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';

type Question = {
  question: string;
  options: string[];
  correct_option_index: number;
  points: number;
};

const blankQuestion = (): Question => ({
  question: '',
  options: ['', '', '', ''],
  correct_option_index: 0,
  points: 1,
});

const QuizEdit = ({ training, section, quiz }: any) => {
  const { data, setData, put, processing, errors } = useForm({
    title: quiz?.title || `${section.title} - Quiz`,
    description: quiz?.description || '',
    passing_score: quiz?.passing_score || 70,
    is_published: !!quiz?.is_published,
    questions: (quiz?.questions || []).map((q: any) => ({
      question: q.question,
      options: Array.isArray(q.options) && q.options.length >= 2 ? q.options : ['', '', '', ''],
      correct_option_index: Number(q.correct_option_index ?? 0),
      points: Number(q.points ?? 1),
    })) as Question[],
  });

  const addQuestion = () => {
    setData('questions', [...data.questions, blankQuestion()]);
  };

  const removeQuestion = (index: number) => {
    const next = data.questions.filter((_: Question, i: number) => i !== index);
    setData('questions', next.length ? next : [blankQuestion()]);
  };

  const updateQuestion = (index: number, patch: Partial<Question>) => {
    const next = [...data.questions];
    next[index] = { ...next[index], ...patch };
    setData('questions', next);
  };

  const updateOption = (qIndex: number, oIndex: number, value: string) => {
    const nextOptions = [...data.questions[qIndex].options];
    nextOptions[oIndex] = value;
    updateQuestion(qIndex, { options: nextOptions });
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    put(route('trainings.sections.quiz.update', { training: training.id, section: section.id }));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">Formation / Module</p>
          <h1 className="text-2xl font-bold">Quiz - {section.title}</h1>
        </div>

        <Link
          href={route('trainings.sections.index', { training: training.id })}
          className="rounded border px-4 py-2 text-sm"
        >
          Retour aux modules
        </Link>
      </div>

      <form onSubmit={submit} className="space-y-6">
        <div className="rounded-xl border bg-white p-4 space-y-4">
          <div>
            <label className="block text-sm mb-1">Titre du quiz</label>
            <input
              title="Titre du quiz"
              placeholder="Titre du quiz"
              className="w-full rounded border p-2"
              value={data.title}
              onChange={(e) => setData('title', e.target.value)}
            />
            {errors.title ? <p className="text-xs text-red-600 mt-1">{errors.title}</p> : null}
          </div>

          <div>
            <label className="block text-sm mb-1">Description</label>
            <textarea
              title="Description du quiz"
              placeholder="Description du quiz"
              className="w-full rounded border p-2"
              rows={3}
              value={data.description}
              onChange={(e) => setData('description', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">Score minimum (%)</label>
              <input
                type="number"
                min={1}
                max={100}
                title="Score minimum"
                placeholder="70"
                className="w-full rounded border p-2"
                value={data.passing_score}
                onChange={(e) => setData('passing_score', Number(e.target.value))}
              />
            </div>

            <label className="flex items-center gap-2 text-sm mt-7">
              <input
                type="checkbox"
                checked={data.is_published}
                onChange={(e) => setData('is_published', e.target.checked)}
              />
              Publier ce quiz
            </label>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Questions</h2>
            <button
              type="button"
              onClick={addQuestion}
              className="rounded bg-slate-900 px-3 py-2 text-sm text-white"
            >
              Ajouter une question
            </button>
          </div>

          {data.questions.map((question: Question, qIndex: number) => (
            <div key={qIndex} className="rounded-xl border bg-white p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Question {qIndex + 1}</h3>
                <button
                  type="button"
                  onClick={() => removeQuestion(qIndex)}
                  className="text-sm text-red-600"
                >
                  Supprimer
                </button>
              </div>

              <textarea
                className="w-full rounded border p-2"
                rows={2}
                placeholder="Texte de la question"
                value={question.question}
                onChange={(e) => updateQuestion(qIndex, { question: e.target.value })}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {question.options.map((option: string, oIndex: number) => (
                  <div key={oIndex} className="flex items-center gap-2">
                    <input
                      type="radio"
                      title={`Bonne reponse question ${qIndex + 1} option ${oIndex + 1}`}
                      name={`correct-${qIndex}`}
                      checked={question.correct_option_index === oIndex}
                      onChange={() => updateQuestion(qIndex, { correct_option_index: oIndex })}
                    />
                    <input
                      className="w-full rounded border p-2"
                      placeholder={`Option ${oIndex + 1}`}
                      value={option}
                      onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                    />
                  </div>
                ))}
              </div>

              <div className="w-32">
                <label className="block text-sm mb-1">Points</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  title={`Points de la question ${qIndex + 1}`}
                  placeholder="1"
                  className="w-full rounded border p-2"
                  value={question.points}
                  onChange={(e) => updateQuestion(qIndex, { points: Number(e.target.value) })}
                />
              </div>
            </div>
          ))}

          {errors.questions ? <p className="text-sm text-red-600">{errors.questions}</p> : null}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={processing}
            className="rounded bg-red-600 px-4 py-2 text-white"
          >
            Enregistrer le quiz
          </button>
        </div>
      </form>
    </div>
  );
};

export default QuizEdit;
