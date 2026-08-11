import { Head, router, useForm, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';
import DashboardLayout from '@/components/frontend/layouts/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

interface Turn {
  id: number;
  position: number;
  question: string;
  feedback?: string;
  score?: number;
}
interface Simulation {
  id: number;
  job_title: string;
  status: string;
  language: string;
  current_turn: number;
  turns: Turn[];
}
interface PageProps {
  flash?: { error?: string };
  [key: string]: unknown;
}
export default function Show({
  simulation,
  progress,
  currentTurn,
}: {
  simulation: Simulation;
  progress: number;
  currentTurn: Turn | null;
}) {
  const form = useForm({ answer: '', submission_token: crypto.randomUUID() });
  const { flash } = usePage<PageProps>().props;
  const previous = simulation.turns.find((turn) => turn.position === simulation.current_turn - 1);
  return (
    <DashboardLayout title={simulation.job_title} currentPage="coach">
      <Head title={simulation.job_title} />
      <div className="mx-auto max-w-3xl space-y-5">
        <p>
          Progression : {progress}% · Langue : {simulation.language.toUpperCase()}
        </p>
        {flash?.error && (
          <div className="rounded border border-red-300 bg-red-50 p-3 text-red-800">
            {flash.error}
          </div>
        )}
        {simulation.status === 'draft' ? (
          <Card className="p-5">
            <p className="mb-3">La préparation doit être relancée.</p>
            <Button onClick={() => router.post(route('coach.interviews.retry', simulation.id))}>
              Réessayer
            </Button>
          </Card>
        ) : (
          <>
            {previous?.feedback && (
              <Card className="p-4">
                <strong>Feedback précédent</strong>
                <p>{previous.feedback}</p>
                <small>Appréciation : {previous.score}/5</small>
              </Card>
            )}
            {currentTurn && (
              <Card className="space-y-4 p-5">
                <p className="text-sm">
                  Question {currentTurn.position}/{simulation.turns.length}
                </p>
                <h2 className="text-xl font-semibold">{currentTurn.question}</h2>
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    form.post(route('coach.interviews.answers.store', simulation.id), {
                      onSuccess: () =>
                        form.setData({ answer: '', submission_token: crypto.randomUUID() }),
                    });
                  }}
                >
                  <Textarea
                    value={form.data.answer}
                    onChange={(e) => form.setData('answer', e.target.value)}
                    required
                  />
                  <Button className="mt-3" disabled={form.processing}>
                    {form.processing ? 'Évaluation…' : 'Continuer'}
                  </Button>
                </form>
              </Card>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
