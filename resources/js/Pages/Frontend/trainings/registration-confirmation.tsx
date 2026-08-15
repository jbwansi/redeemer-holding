import React from 'react';
import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { formatCurrency, formatDate } from '@/lib/utils';
import RegistrationConfirmation from '@/components/frontend/confirmation/registration-confirmation';
import { ArrowRight, Calendar, Clock, GraduationCap, Mail, Monitor } from 'lucide-react';

const TrainingRegistrationConfirmationPage = ({ training, registration, trainingAccess }: any) => {
  const formation = training;
  const isTrainingFree = formation?.price <= 0;

  const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    formation.title
  )}&dates=${new Date(formation.start_date).toISOString().replace(/-|:|\.\d+/g, '')}/${new Date(
    formation.end_date
  )
    .toISOString()
    .replace(/-|:|\.\d+/g, '')}`;

  const qrCodeValue = `${window.location.origin}/trainings/${registration.reference}`;

  const paymentSummary = !isTrainingFree
    ? {
        rows: [
          {
            label: 'Formation',
            amount: formatCurrency(formation.price),
          },
          {
            label: 'Frais',
            amount: formatCurrency(formation.price * 0.05),
          },
        ],
        total: formatCurrency(formation.price * 1.05),
      }
    : undefined;

  const bottomSection = (
    <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Actions rapides</h3>
      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
        <button
          onClick={() => window.print()}
          className="rounded-lg bg-slate-100 px-4 py-2 text-sm dark:bg-slate-800"
        >
          Imprimer
        </button>
        <button
          onClick={() => {
            const subject = `Confirmation - ${formation.title}`;
            const body = `Reference: ${registration.reference}\n${window.location.href}`;
            window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
          }}
          className="rounded-lg bg-slate-100 px-4 py-2 text-sm dark:bg-slate-800"
        >
          Envoyer par email
        </button>
        <button
          onClick={async () => {
            if (navigator.share) {
              await navigator.share({
                title: `Inscription - ${formation.title}`,
                url: window.location.href,
              });
              return;
            }
            await navigator.clipboard.writeText(window.location.href);
          }}
          className="rounded-lg bg-slate-100 px-4 py-2 text-sm dark:bg-slate-800"
        >
          Partager
        </button>
      </div>
    </div>
  );

  return (
    <RegistrationConfirmation
      pageTitle={`Confirmation - ${formation?.title || 'Formation'}`}
      eventTypeLabel="Inscription"
      backHref={route('formations.details', formation.slug)}
      backLabel="Retour formation"
      itemTitle={formation?.title}
      itemImage={formation?.featured_image}
      placeholderImage="/assets/images/services-bg.jpg"
      fields={[
        {
          icon: <Calendar className="h-4 w-4" />,
          label: 'Debut',
          value: formatDate(formation?.start_date),
        },
        {
          icon: <Clock className="h-4 w-4" />,
          label: 'Durée',
          value: `${formation?.duration || '-'} heures`,
        },
        {
          icon: <Monitor className="h-4 w-4" />,
          label: 'Format',
          value: formation?.format || 'Format standard',
        },
        {
          icon: <GraduationCap className="h-4 w-4" />,
          label: 'Niveau',
          value: formation?.level || 'Tous niveaux',
        },
        {
          icon: <Mail className="h-4 w-4" />,
          label: 'Participant',
          value: `${registration?.name} - ${registration?.email}`,
        },
      ]}
      registration={registration}
      qrCodeValue={qrCodeValue}
      calendarHref={calendarUrl}
      invoiceHref={
        !isTrainingFree
          ? route('trainings.facture.download', {
              slug: formation.slug,
              reference: registration.reference,
            })
          : undefined
      }
      isFree={isTrainingFree}
      paymentSummary={paymentSummary}
      primaryAction={
        trainingAccess?.can_access ? (
          <Link
            href={trainingAccess.url}
            className="inline-flex w-full items-center justify-center gap-3 rounded-xl bg-[#0f766e] px-6 py-4 text-base font-semibold text-white shadow-lg shadow-emerald-900/20 transition hover:bg-[#115e59] sm:w-auto"
          >
            {trainingAccess.label}
            <ArrowRight className="h-5 w-5" />
          </Link>
        ) : trainingAccess?.requires_account_link ? (
          <div className="flex flex-col items-start gap-3">
            <Link
              href={trainingAccess.register_url}
              className="inline-flex w-full items-center justify-center gap-3 rounded-xl bg-[#0f766e] px-6 py-4 text-base font-semibold text-white shadow-lg shadow-emerald-900/20 transition hover:bg-[#115e59] sm:w-auto"
            >
              Créer mon compte pour accéder à la formation
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href={trainingAccess.login_url}
              className="text-sm font-semibold text-[#0f766e] underline-offset-4 hover:underline dark:text-emerald-400"
            >
              J&apos;ai déjà un compte
            </Link>
          </div>
        ) : undefined
      }
      bottomSection={bottomSection}
    />
  );
};

export default TrainingRegistrationConfirmationPage;
