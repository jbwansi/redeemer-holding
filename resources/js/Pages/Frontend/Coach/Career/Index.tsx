import { Head, Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import DashboardLayout from '@/components/frontend/layouts/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CoachPagination, type Paginated } from '../Pagination';
interface Goal {
  id: number;
  title: string;
  status: string;
  progress: number;
  target_date: string | null;
  updated_at: string;
}
export default function Index({ goals }: { goals: Paginated<Goal> }) {
  return (
    <DashboardLayout title="Orientation & carrière" currentPage="coach">
      <Head title="Orientation & carrière" />
      <div className="space-y-5">
        <div className="flex justify-between">
          <h1 className="text-2xl font-semibold">Mes objectifs professionnels</h1>
          <Button asChild>
            <Link href={route('coach.career.create')}>Nouvel objectif</Link>
          </Button>
        </div>
        {goals.data.length === 0 && <Card className="p-5">Aucun objectif.</Card>}
        {goals.data.map((g) => (
          <Card className="flex items-center justify-between p-5" key={g.id}>
            <div>
              <h2 className="font-semibold">{g.title}</h2>
              <p className="text-sm">
                {g.status} · {g.progress}% ·{' '}
                {g.target_date ? new Date(g.target_date).toLocaleDateString() : 'Sans échéance'}
              </p>
              <p className="text-xs text-muted-foreground">
                Actualisé le {new Date(g.updated_at).toLocaleDateString()}
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href={route('coach.career.show', g.id)}>Consulter</Link>
            </Button>
          </Card>
        ))}
        <CoachPagination page={goals} />
      </div>
    </DashboardLayout>
  );
}
