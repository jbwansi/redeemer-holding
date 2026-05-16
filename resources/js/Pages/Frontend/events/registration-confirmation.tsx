import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { formatDate, formatTime, formatCurrency } from '@/lib/utils';
import RegistrationConfirmation from '@/components/frontend/confirmation/registration-confirmation';
import { Calendar, Clock, Mail, MapPin, Ticket } from 'lucide-react';

const EventRegistrationConfirmationPage = ({ event, registration }: any) => {
  const isEventFree = event?.price <= 0;

  const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    event.title
  )}&dates=${new Date(event.start_date).toISOString().replace(/-|:|\.\d+/g, '')}/${new Date(
    event.end_date
  )
    .toISOString()
    .replace(/-|:|\.\d+/g, '')}&location=${encodeURIComponent(event.location)}`;

  const qrCodeValue = `${window.location.origin}/tickets/${registration.reference}`;

  const paymentSummary = !isEventFree
    ? {
        rows: [
          {
            label: 'Sous-total',
            amount: formatCurrency(event.price * registration.qty),
          },
          {
            label: 'Frais',
            amount: formatCurrency(event.price * registration.qty * 0.05),
          },
        ],
        total: formatCurrency(event.price * registration.qty * 1.05),
      }
    : undefined;

  const cancelSection = registration?.can_be_cancelled ? (
    <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
      <p className="text-sm">
        Vous pouvez annuler cette reservation jusqu a 24h avant le debut.
      </p>
      <Link
        href={route('events.registration.cancel', {
          slug: event.slug,
          participant_id: registration.id,
        })}
        method="delete"
        as="button"
        className="mt-3 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white"
      >
        Annuler ma reservation
      </Link>
    </div>
  ) : null;

  return (
    <RegistrationConfirmation
      pageTitle={`Confirmation - ${event?.title || 'Evenement'}`}
      eventTypeLabel="Reservation"
      backHref={route('evenements.details', event.slug)}
      backLabel="Retour evenement"
      itemTitle={event?.title}
      itemImage={event?.featured_image}
      placeholderImage="/assets/images/event-placeholder.jpg"
      fields={[
        {
          icon: <Calendar className="h-4 w-4" />,
          label: 'Date',
          value: `${formatDate(event?.start_date)} - ${formatDate(event?.end_date)}`,
        },
        {
          icon: <Clock className="h-4 w-4" />,
          label: 'Horaire',
          value: `${formatTime(event?.start_date)} - ${formatTime(event?.end_date)}`,
        },
        {
          icon: <MapPin className="h-4 w-4" />,
          label: 'Lieu',
          value: event?.location,
        },
        {
          icon: <Ticket className="h-4 w-4" />,
          label: 'Reference',
          value: registration?.reference,
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
      invoiceHref={!isEventFree
        ? route('evenements.facture.download', {
            slug: event.slug,
            reference: registration.reference,
          })
        : undefined}
      isFree={isEventFree}
      paymentSummary={paymentSummary}
      cancelSection={cancelSection}
    />
  );
};

export default EventRegistrationConfirmationPage;
