import { Head, Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import DashboardLayout from '@/components/frontend/layouts/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
interface Result {
  skills: {
    current_strengths: string[];
    missing_skills: string[];
    skills_to_improve: string[];
    priority_skills: { skill: string; priority: string; reason: string }[];
    evidence_from_profile: string[];
  };
  recommendations: {
    recommendations: {
      name: string;
      provider: string;
      why_relevant: string;
      skills_addressed: string[];
      priority: string;
      prerequisites: string[];
      notes: string;
    }[];
    training_suggestions: string[];
  };
  plan: {
    goal: string;
    steps: {
      title: string;
      skills: string[];
      priority: string;
      suggested_duration: string;
      recommended_resources: string[];
    }[];
  };
}
interface Analysis {
  target_role: string;
  target_sector: string | null;
  status: string;
  result: Result | null;
  career_goal: { title: string } | null;
}
const List = ({ items }: { items: string[] }) => (
  <ul className="list-disc pl-5">
    {items.map((x, i) => (
      <li key={`${i}-${x}`}>{x}</li>
    ))}
  </ul>
);
export default function Show({ analysis }: { analysis: Analysis }) {
  const r = analysis.result;
  return (
    <DashboardLayout title={analysis.target_role} currentPage="coach">
      <Head title={`Compétences — ${analysis.target_role}`} />
      <div className="space-y-4">
        <div className="flex justify-between">
          <div>
            <h1 className="text-2xl font-semibold">{analysis.target_role}</h1>
            <p>
              {analysis.target_sector}
              {analysis.career_goal && ` · Objectif: ${analysis.career_goal.title}`}
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href={route('coach.certifications.index')}>Historique</Link>
          </Button>
        </div>
        <Card className="border-amber-300 bg-amber-50 p-4">
          <strong>Suggestions à vérifier</strong>
          <p>
            Aucune certification externe n’est vérifiée ou garantie comme actuelle. Ce module n’émet
            aucun certificat LMS.
          </p>
        </Card>
        {analysis.status !== 'completed' || !r ? (
          <Card className="p-5">Analyse indisponible ou incomplète.</Card>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="p-5">
                <h2 className="font-semibold">Forces actuelles documentées</h2>
                <List items={r.skills.current_strengths} />
              </Card>
              <Card className="p-5">
                <h2 className="font-semibold">Écarts suggérés</h2>
                <List items={r.skills.missing_skills} />
              </Card>
            </div>
            <Card className="p-5">
              <h2 className="font-semibold">Compétences prioritaires</h2>
              {r.skills.priority_skills.map((s) => (
                <p key={s.skill}>
                  <strong>
                    {s.priority}: {s.skill}
                  </strong>{' '}
                  — {s.reason}
                </p>
              ))}
            </Card>
            <Card className="p-5">
              <h2 className="font-semibold">Certifications suggérées à vérifier</h2>
              {r.recommendations.recommendations.map((c) => (
                <div className="mt-3 border-t pt-3" key={c.name}>
                  <strong>
                    {c.name} — {c.provider}
                  </strong>
                  <p>{c.why_relevant}</p>
                  <p className="text-sm">
                    Priorité {c.priority}. {c.notes}
                  </p>
                </div>
              ))}
            </Card>
            <Card className="p-5">
              <h2 className="font-semibold">Types de formations suggérés</h2>
              <List items={r.recommendations.training_suggestions} />
            </Card>
            <Card className="p-5">
              <h2 className="font-semibold">Plan d’apprentissage</h2>
              <p>{r.plan.goal}</p>
              {r.plan.steps.map((s) => (
                <div className="mt-3" key={s.title}>
                  <strong>
                    {s.priority}: {s.title}
                  </strong>
                  <p>{s.suggested_duration}</p>
                  <List items={s.recommended_resources} />
                </div>
              ))}
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
