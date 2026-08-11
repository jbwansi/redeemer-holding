import { Head, Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import DashboardLayout from '@/components/frontend/layouts/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
interface Simulation {
  job_title: string;
  summary: string;
  score?: number;
  strengths: string[];
  improvements: string[];
  recommended_actions: string[];
  questions_to_rehearse: string[];
  candidate_questions: string[];
}
const List = ({ title, items }: { title: string; items: string[] }) => (
  <Card className="p-4">
    <h2 className="mb-2 font-semibold">{title}</h2>
    <ul className="list-disc pl-5">
      {(items ?? []).map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  </Card>
);
export default function Debrief({ simulation }: { simulation: Simulation }) {
  return (
    <DashboardLayout title="Débriefing" currentPage="coach">
      <Head title="Débriefing entretien" />
      <div className="mx-auto max-w-4xl space-y-4">
        <Card className="p-5">
          <h1 className="text-2xl font-bold">{simulation.job_title}</h1>
          <p>{simulation.summary}</p>
          {simulation.score && (
            <p className="mt-2 text-sm text-muted-foreground">
              Appréciation indicative : {simulation.score}/5
            </p>
          )}
        </Card>
        <div className="grid gap-4 md:grid-cols-2">
          <List title="Forces" items={simulation.strengths} />
          <List title="Axes d’amélioration" items={simulation.improvements} />
          <List title="Actions recommandées" items={simulation.recommended_actions} />
          <List title="Questions à retravailler" items={simulation.questions_to_rehearse} />
          <List title="Questions à poser au recruteur" items={simulation.candidate_questions} />
        </div>
        <Button asChild>
          <Link href={route('coach.interviews.index')}>Retour aux simulations</Link>
        </Button>
      </div>
    </DashboardLayout>
  );
}
