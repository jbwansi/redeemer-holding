import { Head, Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import DashboardLayout from '@/components/frontend/layouts/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CoachPagination, type Paginated } from '../Pagination';
interface Analysis {
  id: number;
  target_role: string;
  status: string;
  created_at: string;
  result: { skills?: { priority_skills: { priority: string }[] } } | null;
}
export default function Index({ analyses }: { analyses: Paginated<Analysis> }) {
  return (
    <DashboardLayout title="Compétences & certifications" currentPage="coach">
      <Head title="Compétences & certifications" />
      <div className="space-y-5">
        <div className="flex justify-between gap-3">
          <h1 className="text-2xl font-semibold">Mes analyses de compétences</h1>
          <Button asChild>
            <Link href={route('coach.certifications.create')}>Nouvelle analyse</Link>
          </Button>
        </div>
        {analyses.data.length === 0 && <Card className="p-5">Aucune analyse.</Card>}
        {analyses.data.map((a) => (
          <Card className="flex items-center justify-between p-5" key={a.id}>
            <div>
              <h2 className="font-semibold">{a.target_role}</h2>
              <p className="text-sm">
                {a.status} · {new Date(a.created_at).toLocaleDateString()} · priorité{' '}
                {a.result?.skills?.priority_skills?.[0]?.priority || 'non définie'}
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href={route('coach.certifications.show', a.id)}>Consulter</Link>
            </Button>
          </Card>
        ))}
        <CoachPagination page={analyses} />
      </div>
    </DashboardLayout>
  );
}
