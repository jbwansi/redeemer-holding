import { Head, Link, router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import DashboardLayout from '@/components/frontend/layouts/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
interface Goal {
  id: number;
  title: string;
  target_role: string | null;
  target_sector: string | null;
  progress: number;
  status: string;
  analysis: {
    situation: {
      current_position_summary: string;
      strengths: string[];
      transferable_skills: string[];
    };
    gaps: { missing_skills: string[]; priority_gaps: string[] };
    roles: { recommended_roles: { title: string; why_it_fits: string }[] };
  } | null;
}
const List = ({ items }: { items: string[] }) => (
  <ul className="list-disc pl-5">
    {items.map((x, i) => (
      <li key={`${i}-${x}`}>{x}</li>
    ))}
  </ul>
);
export default function Show({ goal }: { goal: Goal }) {
  const a = goal.analysis;
  return (
    <DashboardLayout title={goal.title} currentPage="coach">
      <Head title={goal.title} />
      <div className="space-y-4">
        <div className="flex flex-wrap justify-between gap-2">
          <div>
            <h1 className="text-2xl font-semibold">{goal.title}</h1>
            <p>
              {goal.target_role} {goal.target_sector && `· ${goal.target_sector}`} · {goal.progress}
              %
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild>
              <Link href={route('coach.career.plan', goal.id)}>Plan d’action</Link>
            </Button>
            <Button
              variant="outline"
              onClick={() => router.patch(route('coach.career.archive', goal.id))}
            >
              Archiver
            </Button>
          </div>
        </div>
        {!a ? (
          <Card className="p-5">Analyse indisponible. L’objectif reste en brouillon.</Card>
        ) : (
          <>
            <Card className="p-5">
              <h2 className="font-semibold">Synthèse indicative</h2>
              <p>{a.situation.current_position_summary}</p>
            </Card>
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="p-5">
                <h2 className="font-semibold">Forces</h2>
                <List items={a.situation.strengths} />
              </Card>
              <Card className="p-5">
                <h2 className="font-semibold">Compétences transférables suggérées</h2>
                <List items={a.situation.transferable_skills} />
              </Card>
              <Card className="p-5">
                <h2 className="font-semibold">Écarts à vérifier</h2>
                <List items={a.gaps.missing_skills} />
              </Card>
              <Card className="p-5">
                <h2 className="font-semibold">Priorités</h2>
                <List items={a.gaps.priority_gaps} />
              </Card>
            </div>
            <Card className="p-5">
              <h2 className="font-semibold">Pistes professionnelles non définitives</h2>
              {a.roles.recommended_roles.map((r) => (
                <div className="mt-2" key={r.title}>
                  <strong>{r.title}</strong>
                  <p>{r.why_it_fits}</p>
                </div>
              ))}
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
