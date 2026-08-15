import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import {
  AlertTriangle,
  Calendar,
  CheckCircle,
  Clock,
  MapPin,
  Ticket,
  Users,
  XCircle,
} from 'lucide-react';
import FrontLayout from '@/components/frontend/layouts/front-layout';
import { formatDate, formatTime } from '@/lib/utils';

interface EventTicketPageProps {
  event: {
    title: string;
    start_date: string;
    end_date: string;
    location: string;
  };
  ticket: {
    reference: string;
    participant_name: string;
    quantity: number;
    state: 'valid' | 'cancelled' | 'expired' | 'invalid';
    is_valid: boolean;
  };
}

const stateContent = {
  valid: {
    title: 'Billet valide',
    message: 'Cette inscription est confirmée et ce billet peut être présenté à l’entrée.',
    icon: CheckCircle,
    classes:
      'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  },
  cancelled: {
    title: 'Billet annulé',
    message: 'Cette inscription a été annulée. Ce billet ne permet plus l’accès à l’événement.',
    icon: XCircle,
    classes:
      'border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-900/30 dark:text-red-300',
  },
  expired: {
    title: 'Billet expiré',
    message: 'Cet événement est terminé. Ce billet n’est plus valable.',
    icon: AlertTriangle,
    classes:
      'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  },
  invalid: {
    title: 'Billet non valide',
    message: 'Cette inscription n’est pas confirmée ou son paiement reste à valider.',
    icon: XCircle,
    classes:
      'border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-900/30 dark:text-red-300',
  },
} as const;

const EventTicketPage = ({ event, ticket }: EventTicketPageProps) => {
  const status = stateContent[ticket.state];
  const StatusIcon = status.icon;

  return (
    <FrontLayout>
      <Head title={`${status.title} - ${event.title}`}>
        <meta name="robots" content="noindex,nofollow" />
      </Head>

      <main className="min-h-screen bg-[#f7f6f2] pt-24 pb-20 dark:bg-slate-950">
        <section className="mx-auto max-w-2xl px-6 md:px-8">
          <div className={`rounded-2xl border p-5 ${status.classes}`}>
            <p className="inline-flex items-center gap-2 text-xl font-semibold">
              <StatusIcon className="h-6 w-6" />
              {status.title}
            </p>
            <p className="mt-2 text-sm">{status.message}</p>
          </div>

          <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-5 dark:border-slate-700">
              <div>
                <p className="text-sm text-slate-500">Événement</p>
                <h1 className="mt-1 text-2xl font-semibold text-slate-900 dark:text-white">
                  {event.title}
                </h1>
              </div>
              <Ticket className="h-8 w-8 shrink-0 text-[#da2e29]" />
            </div>

            <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="inline-flex items-center gap-2 font-medium text-slate-500">
                  <Calendar className="h-4 w-4" /> Date
                </dt>
                <dd className="mt-1 text-slate-900 dark:text-white">
                  {formatDate(event.start_date)} - {formatDate(event.end_date)}
                </dd>
              </div>
              <div>
                <dt className="inline-flex items-center gap-2 font-medium text-slate-500">
                  <Clock className="h-4 w-4" /> Horaire
                </dt>
                <dd className="mt-1 text-slate-900 dark:text-white">
                  {formatTime(event.start_date)} - {formatTime(event.end_date)}
                </dd>
              </div>
              <div>
                <dt className="inline-flex items-center gap-2 font-medium text-slate-500">
                  <MapPin className="h-4 w-4" /> Lieu
                </dt>
                <dd className="mt-1 text-slate-900 dark:text-white">{event.location}</dd>
              </div>
              <div>
                <dt className="inline-flex items-center gap-2 font-medium text-slate-500">
                  <Users className="h-4 w-4" /> Participant
                </dt>
                <dd className="mt-1 text-slate-900 dark:text-white">
                  {ticket.participant_name} · {ticket.quantity} place(s)
                </dd>
              </div>
            </dl>

            <div className="mt-6 rounded-xl bg-slate-100 p-4 text-center dark:bg-slate-800">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Référence
              </p>
              <p className="mt-1 font-mono text-lg font-semibold text-slate-900 dark:text-white">
                {ticket.reference}
              </p>
            </div>
          </div>

          <div className="mt-6 text-center">
            <Link
              href={route('evenements')}
              className="text-sm font-semibold text-[#da2e29] hover:underline"
            >
              Retour aux événements
            </Link>
          </div>
        </section>
      </main>
    </FrontLayout>
  );
};

export default EventTicketPage;
