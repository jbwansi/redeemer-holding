import { Head, Link, useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';
import DashboardLayout from '@/components/frontend/layouts/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface Props {
  profileComplete: boolean;
  documentCount: number;
  monthlyUsage: number;
  conversations: { id: number; title: string; language: string }[];
  settings: {
    languages: string[];
    defaultLanguage: string;
    monthlyLimit: number;
    modules: Record<string, boolean>;
  };
}

export default function Dashboard({
  profileComplete,
  documentCount,
  monthlyUsage,
  conversations,
  settings,
}: Props) {
  const form = useForm({
    title: 'Ma conversation Coach',
    language: settings.defaultLanguage,
    module: 'general',
  });

  return (
    <DashboardLayout title="Coach numérique" currentPage="coach">
      <Head title="Coach numérique" />
      <div className="space-y-6">
        {!profileComplete && (
          <Card className="border-amber-300 bg-amber-50 p-4 text-amber-950">
            Complétez votre profil professionnel pour obtenir un accompagnement plus personnalisé.{' '}
            <Link className="font-medium underline" href={route('coach.profile.edit')}>
              Compléter mon profil
            </Link>
          </Card>
        )}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="p-4">Profil {profileComplete ? 'complété' : 'à compléter'}</Card>
          <Card className="p-4">{documentCount} document(s)</Card>
          <Card className="p-4">
            {monthlyUsage} / {settings.monthlyLimit} message(s) ce mois
          </Card>
        </div>
        <Card className="p-4">
          <h2 className="mb-2 font-semibold">Modules à venir</h2>
          <div className="grid gap-2 text-sm sm:grid-cols-2">
            {Object.entries(settings.modules).map(([module, enabled]) => (
              <span key={module}>
                {module}: {enabled ? 'activé (prochainement)' : 'désactivé'}
              </span>
            ))}
          </div>
        </Card>
        {settings.modules.interview && (
          <Card className="p-5">
            <h2 className="font-semibold">Préparation aux entretiens</h2>
            <p className="mb-3 text-sm text-muted-foreground">
              Préparez un poste puis entraînez-vous question par question.
            </p>
            <Button asChild>
              <Link href={route('coach.interviews.index')}>Ouvrir le module Entretiens</Link>
            </Button>
          </Card>
        )}
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href={route('coach.profile.edit')}>Profil professionnel</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={route('coach.documents.index')}>Documents privés</Link>
          </Button>
          <Button
            disabled={form.processing}
            onClick={() => form.post(route('coach.conversations.store'))}
          >
            Nouvelle conversation
          </Button>
        </div>
        <section>
          <h2 className="mb-3 text-lg font-semibold">Conversations récentes</h2>
          <div className="flex flex-col gap-2">
            {conversations.map((conversation) => (
              <Link
                className="text-red-700 underline"
                href={route('coach.conversations.show', conversation.id)}
                key={conversation.id}
              >
                {conversation.title} ({conversation.language})
              </Link>
            ))}
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
