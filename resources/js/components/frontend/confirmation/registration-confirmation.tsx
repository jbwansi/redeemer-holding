import React from 'react';
import { Head, Link } from '@inertiajs/react';
import FrontLayout from '@/components/frontend/layouts/front-layout';
import { AlertCircle, CalendarDays, CheckCircle, FileText, Printer } from 'lucide-react';
import QRCode from 'react-qr-code';

interface FieldItem {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}

interface PaymentSummaryRow {
  label: string;
  amount: string;
}

interface RegistrationConfirmationProps {
  pageTitle: string;
  eventTypeLabel: string;
  backHref: string;
  backLabel: string;
  itemTitle: string;
  itemImage: unknown;
  fields: FieldItem[];
  registration: { email: string; reference: string };
  qrCodeValue?: string;
  calendarHref?: string;
  invoiceHref?: string;
  isFree?: boolean;
  paymentSummary?: {
    rows: PaymentSummaryRow[];
    total: string;
  };
  primaryAction?: React.ReactNode;
  actionButtons?: React.ReactNode;
  bottomSection?: React.ReactNode;
  cancelSection?: React.ReactNode;
  placeholderImage?: string;
  confirmationTitle?: string;
  confirmationMessage?: string;
  isConfirmed?: boolean;
}

const resolveImage = (image: unknown, placeholder: string): string => {
  if (!image) return placeholder;
  if (typeof image === 'string') return image;
  if (typeof image !== 'object') return placeholder;

  const candidate = image as Record<string, unknown>;
  const resolved =
    candidate.large || candidate.medium || candidate.original || candidate.thumbnail || placeholder;

  return typeof resolved === 'string' ? resolved : placeholder;
};

const RegistrationConfirmation = ({
  pageTitle,
  eventTypeLabel,
  backHref,
  backLabel,
  itemTitle,
  itemImage,
  fields,
  registration,
  qrCodeValue,
  calendarHref,
  invoiceHref,
  isFree = false,
  paymentSummary,
  primaryAction,
  actionButtons,
  bottomSection,
  cancelSection,
  placeholderImage,
  confirmationTitle,
  confirmationMessage,
  isConfirmed = true,
}: RegistrationConfirmationProps) => {
  return (
    <FrontLayout>
      <Head title={pageTitle} />

      <main className="relative min-h-screen overflow-hidden bg-[#f7f6f2] pt-24 pb-20 dark:bg-slate-950">
        <div className="pointer-events-none absolute -top-20 -left-16 h-72 w-72 rounded-full bg-[#0f766e]/15 blur-3xl" />

        <section className="mx-auto max-w-[1200px] px-6 md:px-8">
          <div
            className={`rounded-2xl border p-5 ${
              isConfirmed
                ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
                : 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
            }`}
          >
            <p className="inline-flex items-center gap-2 text-lg font-semibold">
              {isConfirmed ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <AlertCircle className="h-5 w-5" />
              )}
              {confirmationTitle ?? `${eventTypeLabel} confirmé`}
            </p>
            <p className="mt-1 text-sm">
              {confirmationMessage ??
                `Un email de confirmation a été envoyé à ${registration.email}.`}
            </p>
          </div>

          {primaryAction && <div className="mt-6">{primaryAction}</div>}

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={backHref}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
            >
              <span className="text-sm">←</span>
              {backLabel}
            </Link>

            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-700"
            >
              <Printer className="h-4 w-4" />
              Imprimer
            </button>

            {calendarHref && (
              <a
                href={calendarHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-700"
              >
                <CalendarDays className="h-4 w-4" />
                Calendrier
              </a>
            )}

            {invoiceHref && !isFree && (
              <a
                href={invoiceHref}
                className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-700"
              >
                <FileText className="h-4 w-4" />
                Facture
              </a>
            )}

            {actionButtons}
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-5">
            <div className="lg:col-span-3 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <div className="flex flex-col gap-5 md:flex-row">
                <img
                  src={resolveImage(
                    itemImage,
                    placeholderImage ?? '/assets/images/coaching-session.jpg'
                  )}
                  alt={itemTitle}
                  className="h-44 w-full rounded-xl object-cover md:w-56"
                />
                <div>
                  <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
                    {itemTitle}
                  </h2>
                  <div className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                    {fields.map((field) => (
                      <p key={field.label} className="inline-flex items-center gap-2">
                        {field.icon}
                        <span className="font-medium">{field.label}:</span>
                        <span>{field.value}</span>
                      </p>
                    ))}
                  </div>
                </div>
              </div>

              {paymentSummary && !isFree && (
                <div className="mt-6 rounded-2xl bg-slate-50 p-5 dark:bg-slate-800/50">
                  <h3 className="text-sm font-medium uppercase tracking-wide text-slate-500">
                    Paiement
                  </h3>
                  <div className="mt-3 space-y-2 text-sm">
                    {paymentSummary.rows.map((row) => (
                      <div key={row.label} className="flex justify-between">
                        <span>{row.label}</span>
                        <span>{row.amount}</span>
                      </div>
                    ))}
                    <div className="mt-2 flex justify-between border-t border-slate-200 pt-3 font-semibold dark:border-slate-700">
                      <span>Total</span>
                      <span>{paymentSummary.total}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {qrCodeValue && (
              <div className="lg:col-span-2 rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900">
                <p className="text-sm text-slate-500">Code de vérification</p>
                <div className="mx-auto mt-4 inline-block rounded-xl bg-white p-3">
                  <QRCode value={qrCodeValue} size={150} />
                </div>
                <p className="mt-3 font-mono text-sm text-slate-700 dark:text-slate-300">
                  {registration.reference}
                </p>
              </div>
            )}
          </div>

          {cancelSection}
          {bottomSection}
        </section>
      </main>
    </FrontLayout>
  );
};

export default RegistrationConfirmation;
