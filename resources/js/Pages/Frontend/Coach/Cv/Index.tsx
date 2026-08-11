import { Head, Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import DashboardLayout from '@/components/frontend/layouts/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface Analysis {
  id: number;
  job_title: string;
  company_name: string | null;
  status: string;
  created_at: string;
  cv_document: { original_name: string };
  job_document: { original_name: string } | null;
}

export default function Index({ analyses }: { analyses: Analysis[] }) {
  return (
    <DashboardLayout title="CV & candidatures" currentPage="coach">
      <Head title="CV & candidatures" />
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Mes analyses CV</h1>
            <p className="text-sm text-muted-foreground">Vos documents restent privés.</p>
          </div>
          <Button asChild>
            <Link href={route('coach.cv.create')}>Nouvelle analyse</Link>
          </Button>
        </div>
        {analyses.length === 0 && <Card className="p-5">Aucune analyse pour le moment.</Card>}
        {analyses.map((analysis) => (
          <Card className="flex flex-wrap items-center justify-between gap-4 p-5" key={analysis.id}>
            <div>
              <h2 className="font-semibold">{analysis.job_title}</h2>
              <p className="text-sm text-muted-foreground">
                {analysis.company_name || 'Entreprise non précisée'} ·{' '}
                {analysis.cv_document.original_name} ·{' '}
                {new Date(analysis.created_at).toLocaleDateString()}
              </p>
              <p className="text-xs uppercase">{analysis.status}</p>
            </div>
            <Button asChild variant="outline">
              <Link href={route('coach.cv.show', analysis.id)}>Consulter</Link>
            </Button>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );
}
