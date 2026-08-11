import { Head, Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import DashboardLayout from '@/components/frontend/layouts/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CoachPagination, type Paginated } from '../Pagination';

interface Simulation {
  id: number;
  job_title: string;
  status: string;
  language: string;
  created_at: string;
  turns_count: number;
  answered_turns_count: number;
}
export default function Index({ simulations }: { simulations: Paginated<Simulation> }) {
  return (
    <DashboardLayout title="Préparation aux entretiens" currentPage="coach">
      <Head title="Entretiens" />
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <p>Simulations récentes</p>
          <Button asChild>
            <Link href={route('coach.interviews.create')}>Nouvelle simulation</Link>
          </Button>
        </div>
        <div className="grid gap-3">
          {simulations.data.length === 0 && <Card className="p-5">Aucune simulation.</Card>}
          {simulations.data.map((simulation) => (
            <Card
              className="flex flex-wrap items-center justify-between gap-3 p-4"
              key={simulation.id}
            >
              <div>
                <h2 className="font-semibold">{simulation.job_title}</h2>
                <p className="text-sm text-muted-foreground">
                  {simulation.status} · {simulation.language.toUpperCase()} ·{' '}
                  {simulation.answered_turns_count}/{simulation.turns_count}
                </p>
              </div>
              <Button asChild variant="outline">
                <Link
                  href={
                    simulation.status === 'completed'
                      ? route('coach.interviews.debrief', simulation.id)
                      : route('coach.interviews.show', simulation.id)
                  }
                >
                  {simulation.status === 'completed' ? 'Voir le débriefing' : 'Reprendre'}
                </Link>
              </Button>
            </Card>
          ))}
        </div>
        <CoachPagination page={simulations} />
      </div>
    </DashboardLayout>
  );
}
