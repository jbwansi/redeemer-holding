import { Head, Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import DashboardLayout from '@/components/frontend/layouts/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface CvResult {
  comparison: {
    match_level: string;
    match_summary: string;
    strengths: string[];
    missing_or_weak_skills: string[];
    important_keywords: string[];
    improvement_recommendations: string[];
  };
  improvement: { summary_recommendation: string };
  adapted: { adapted_cv_draft: string };
  letter: { cover_letter: string };
  message: { application_message: string };
}

interface Analysis {
  job_title: string;
  company_name: string | null;
  status: string;
  result: CvResult | null;
  cv_document: { original_name: string };
  job_document: { original_name: string } | null;
}
const List = ({ values }: { values: string[] }) => (
  <ul className="list-disc space-y-1 pl-5">
    {values.map((value, index) => (
      <li key={`${index}-${value}`}>{value}</li>
    ))}
  </ul>
);

export default function Show({ analysis }: { analysis: Analysis }) {
  const result = analysis.result;
  return (
    <DashboardLayout title={analysis.job_title} currentPage="coach">
      <Head title={`Analyse CV — ${analysis.job_title}`} />
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">{analysis.job_title}</h1>
            <p className="text-sm text-muted-foreground">
              {analysis.company_name || 'Entreprise non précisée'} ·{' '}
              {analysis.cv_document.original_name}
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href={route('coach.cv.index')}>Historique</Link>
          </Button>
        </div>
        {analysis.status !== 'completed' || !result ? (
          <Card className="p-5">Analyse indisponible ou incomplète.</Card>
        ) : (
          <>
            <Card className="p-5">
              <h2 className="font-semibold">
                Synthèse — correspondance indicative : {result.comparison.match_level}
              </h2>
              <p>{result.comparison.match_summary}</p>
            </Card>
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="p-5">
                <h2 className="mb-2 font-semibold">Points forts</h2>
                <List values={result.comparison.strengths} />
              </Card>
              <Card className="p-5">
                <h2 className="mb-2 font-semibold">Écarts</h2>
                <List values={result.comparison.missing_or_weak_skills} />
              </Card>
            </div>
            <Card className="p-5">
              <h2 className="mb-2 font-semibold">Mots-clés importants</h2>
              <List values={result.comparison.important_keywords} />
            </Card>
            <Card className="p-5">
              <h2 className="mb-2 font-semibold">Recommandations</h2>
              <p className="mb-2">{result.improvement.summary_recommendation}</p>
              <List values={result.comparison.improvement_recommendations} />
            </Card>
            <Card className="p-5">
              <h2 className="mb-2 font-semibold">Brouillon de CV adapté</h2>
              <p className="mb-3 text-sm text-amber-700">
                Proposition éditable à relire — votre CV original reste intact.
              </p>
              <textarea
                className="min-h-64 w-full rounded-md border p-3"
                defaultValue={result.adapted.adapted_cv_draft}
              />
            </Card>
            <Card className="p-5">
              <h2 className="mb-2 font-semibold">Lettre de motivation</h2>
              <textarea
                className="min-h-64 w-full rounded-md border p-3"
                defaultValue={result.letter.cover_letter}
              />
            </Card>
            <Card className="p-5">
              <h2 className="mb-2 font-semibold">Message court</h2>
              <textarea
                className="min-h-32 w-full rounded-md border p-3"
                defaultValue={result.message.application_message}
              />
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
