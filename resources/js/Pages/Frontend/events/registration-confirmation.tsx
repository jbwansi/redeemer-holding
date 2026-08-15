import React from 'react';
import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { formatCurrency, formatDate, formatTime } from '@/lib/utils';
import RegistrationConfirmation from '@/components/frontend/confirmation/registration-confirmation';
import { Calendar, Clock, CreditCard, Mail, MapPin, Ticket } from 'lucide-react';

interface EventData {
  title: string;
  slug: string;
  price: number | string;
  start_date: string;
  end_date: string;
  location: string;
  featured_image?: unknown;
}

interface RegistrationData {
  id: number;
  name: string;
  email: string;
  qty: number;
  reference: string;
}

interface ConfirmationData {
  state: 'confirmed' | 'cancelled' | 'payment_processing' | 'awaiting_payment' | 'not_confirmed';
  title: string;
  message: string;
  is_confirmed: boolean;
  is_free: boolean;
  can_show_calendar: boolean;
  can_cancel: boolean;
  can_download_invoice: boolean;
  invoice_url: string | null;
  can_resume_payment: boolean;
  resume_payment_url: string | null;
  ticket_url: string | null;
  amounts: {
    subtotal: number;
    serviceFee: number;
    total: number;
  };
}

interface EventRegistrationConfirmationPageProps {
  event: EventData;
  registration: RegistrationData;
  confirmation: ConfirmationData;
}

const calendarUrl = (event: EventData): string => {
  const start = new Date(event.start_date).toISOString().replace(/-|:|\.\d+/g, '');
  const end = new Date(event.end_date).toISOString().replace(/-|:|\.\d+/g, '');

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    event.title
  )}&dates=${start}/${end}&location=${encodeURIComponent(event.location)}`;
};

const EventRegistrationConfirmationPage = ({
  event,
  registration,
  confirmation,
}: EventRegistrationConfirmationPageProps) => {
  const paymentSummary = !confirmation.is_free
    ? {
        rows: [
          {
            label: 'Sous-total',
            amount: formatCurrency(confirmation.amounts.subtotal),
          },
          {
            label: 'Frais',
            amount: formatCurrency(confirmation.amounts.serviceFee),
          },
        ],
        total: formatCurrency(confirmation.amounts.total),
      }
    : undefined;

  const primaryAction =
    confirmation.can_resume_payment && confirmation.resume_payment_url ? (
      <Link
        href={confirmation.resume_payment_url}
        className="inline-flex w-full items-center justify-center gap-3 rounded-xl bg-[#da2e29] px-6 py-4 text-base font-semibold text-white shadow-lg transition hover:bg-[#c62823] sm:w-auto"
      >
        <CreditCard className="h-5 w-5" />
        Finaliser le paiement
      </Link>
    ) : undefined;

  const cancelSection = confirmation.can_cancel ? (
    <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
      <p className="text-sm">Vous pouvez annuler cette réservation jusqu’à 24 h avant le début.</p>
      <Link
        href={route('events.registration.cancel', {
          slug: event.slug,
          participant_id: registration.id,
        })}
        method="delete"
        as="button"
        className="mt-3 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white"
      >
        Annuler ma réservation
      </Link>
    </div>
  ) : undefined;

  return (
    <RegistrationConfirmation
      pageTitle={`${confirmation.title} - ${event.title}`}
      eventTypeLabel="Réservation"
      confirmationTitle={confirmation.title}
      confirmationMessage={confirmation.message}
      isConfirmed={confirmation.is_confirmed}
      backHref={route('evenements.details', event.slug)}
      backLabel="Retour à l’événement"
      itemTitle={event.title}
      itemImage={event.featured_image}
      placeholderImage="/assets/images/services-bg.jpg"
      fields={[
        {
          icon: <Calendar className="h-4 w-4" />,
          label: 'Date',
          value: `${formatDate(event.start_date)} - ${formatDate(event.end_date)}`,
        },
        {
          icon: <Clock className="h-4 w-4" />,
          label: 'Horaire',
          value: `${formatTime(event.start_date)} - ${formatTime(event.end_date)}`,
        },
        {
          icon: <MapPin className="h-4 w-4" />,
          label: 'Lieu',
          value: event.location,
        },
        {
          icon: <Ticket className="h-4 w-4" />,
          label: 'Référence',
          value: registration.reference,
        },
        {
          icon: <Mail className="h-4 w-4" />,
          label: 'Participant',
          value: `${registration.name} - ${registration.email}`,
        },
      ]}
      registration={registration}
      qrCodeValue={confirmation.ticket_url ?? undefined}
      calendarHref={confirmation.can_show_calendar ? calendarUrl(event) : undefined}
      invoiceHref={
        confirmation.can_download_invoice ? (confirmation.invoice_url ?? undefined) : undefined
      }
      isFree={confirmation.is_free}
      paymentSummary={paymentSummary}
      primaryAction={primaryAction}
      cancelSection={cancelSection}
    />
  );
};

export default EventRegistrationConfirmationPage;
