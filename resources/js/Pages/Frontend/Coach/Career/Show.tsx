import { Head, Link, router, useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';
import DashboardLayout from '@/components/frontend/layouts/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
interface Goal {
  id: number;
  title: string;
  target_role: string | null;
  target_sector: string | null;
  progress: number;
  status: string;
  current_situation: string | null;
  target_description: string | null;
  language: string;
  target_date: string | null;
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
  const edit = useForm({
    title: goal.title,
    current_situation: goal.current_situation || '',
    target_role: goal.target_role || '',
    target_sector: goal.target_sector || '',
    target_description: goal.target_description || '',
    language: goal.language,
    target_date: goal.target_date?.slice(0, 10) || '',
  });
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
        <Card className="p-5">
          <h2 className="mb-3 font-semibold">Réviser mon objectif</h2>
          <form
            className="grid gap-3 md:grid-cols-2"
            onSubmit={(event) => {
              event.preventDefault();
              edit.patch(route('coach.career.update', goal.id), { preserveScroll: true });
            }}
          >
            <Input
              className="rounded-md border p-2"
              required
              value={edit.data.title}
              onChange={(event) => edit.setData('title', event.target.value)}
            />
            <Input
              className="rounded-md border p-2"
              placeholder="Poste cible"
              value={edit.data.target_role}
              onChange={(event) => edit.setData('target_role', event.target.value)}
            />
            <Input
              className="rounded-md border p-2"
              placeholder="Secteur cible"
              value={edit.data.target_sector}
              onChange={(event) => edit.setData('target_sector', event.target.value)}
            />
            <Input
              className="rounded-md border p-2"
              type="date"
              value={edit.data.target_date}
              onChange={(event) => edit.setData('target_date', event.target.value)}
            />
            <Textarea
              className="rounded-md border p-2 md:col-span-2"
              placeholder="Situation actuelle"
              value={edit.data.current_situation}
              onChange={(event) => edit.setData('current_situation', event.target.value)}
            />
            <Textarea
              className="rounded-md border p-2 md:col-span-2"
              placeholder="Description de la cible"
              value={edit.data.target_description}
              onChange={(event) => edit.setData('target_description', event.target.value)}
            />
            <Button className="w-fit" disabled={edit.processing}>
              Enregistrer sans relancer l’IA
            </Button>
          </form>
        </Card>
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
