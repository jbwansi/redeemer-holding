import React, { useMemo } from 'react';
import { Head, Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import {
  ArrowLeft,
  ExternalLink,
  GraduationCap,
  ShieldCheck,
} from 'lucide-react';
import DashboardLayout from '@/components/frontend/layouts/dashboard-layout';
import DOMPurify from 'dompurify';

const ClientTrainingAccess = ({ training, participant }: any) => {
  const safeContent = useMemo(() => {
    return DOMPurify.sanitize(training?.content || '');
  }, [training?.content]);

  return (
    <DashboardLayout title="Accès e-learning" currentPage="trainings">
      <Head title={`${training.title} - Accès e-learning`} />

      <div className="space-y-6 py-8">
        <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900/80 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
              Formation réservée
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-900 dark:text-white">
              {training.title}
            </h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 max-w-2xl">
              Accédez à votre espace e-learning personnel et à toutes les ressources liées à cette formation.
            </p>
          </div>

          <Link
            href={route('dashboard.client.trainings')}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour à mes formations
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900/80">
            <div className="rounded-2xl bg-slate-50 p-5 dark:bg-slate-950/70">
              <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                <GraduationCap className="h-5 w-5" />
                <span className="text-sm font-semibold">Statut de l'inscription</span>
              </div>
              <p className="mt-3 text-lg font-medium text-slate-900 dark:text-white">
                {participant.status === 'completed'
                  ? 'Inscription confirmée'
                  : 'Inscription enregistrée'}
              </p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Référence : <strong>{participant.reference}</strong>
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                Programme de la formation
              </h2>
              <div
                className="prose max-w-none text-slate-600 dark:prose-invert dark:text-slate-300"
                dangerouslySetInnerHTML={{ __html: safeContent }}
              />
            </div>

            <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-950/60">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white">
                <ShieldCheck className="h-5 w-5 text-emerald-600" />
                <span className="font-semibold">Accès e-learning sécurisé</span>
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-300">
                Vous pouvez revenir ici à tout moment pour retrouver la session en ligne et les ressources liées à cette formation.
              </p>
              {training.meeting_link ? (
                <a
                  href={training.meeting_link}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-[#0f766e] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#115e59]"
                >
                  <ExternalLink className="h-4 w-4" />
                  Rejoindre la session
                </a>
              ) : (
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Aucun lien de session en ligne n'a été configuré pour cette formation.
                  Contactez-nous si vous avez besoin d'aide.
                </p>
              )}
            </div>
          </div>

          <aside className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900/80">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                Détails
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Début : {new Date(training.start_date).toLocaleString('fr-FR')}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Fin : {new Date(training.end_date).toLocaleString('fr-FR')}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Lieu : {training.location || 'En ligne'}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Prix : {training.price > 0 ? `${training.price} CHF` : 'Gratuit'}
              </p>
            </div>
          </aside>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ClientTrainingAccess;
