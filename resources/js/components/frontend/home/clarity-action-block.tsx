import React, { useState } from 'react';
import { XCircle, CheckCircle, Send } from 'lucide-react';
import { useForm } from '@inertiajs/react';

type BlockItem = {
  text: string;
};

type ClarityActionBlockProps = {
  enabled?: boolean;
  badge?: string;
  title?: string;
  subtitle?: string;
  leftEyebrow?: string;
  leftTitle?: string;
  leftItems?: BlockItem[];
  rightEyebrow?: string;
  rightTitle?: string;
  rightItems?: BlockItem[];
  finalCtaTitle?: string;
  finalCtaSubtitle?: string;
  finalCtaButtonText?: string;
  finalCtaDisclaimer?: string;
  submitUrl?: string;
  finalCtaSocialProofText?: string;
  finalCtaUrgencyText?: string;
};

export default function ClarityActionBlock({
  enabled = true,
  title,
  subtitle = 'Identifiez ce qui freine votre progression et découvrez le cadre concret pour avancer avec plus de clarté, de constance et de résultats.',
  leftItems = [],
  rightItems = [],
  finalCtaTitle = 'Faisons le point sur votre situation',
  finalCtaSubtitle = 'Profitez d’un premier échange pour clarifier vos priorités, prendre du recul et identifier les prochaines étapes à mettre en place.',
  finalCtaButtonText = 'Réserver mon appel découverte',
  submitUrl = '/contact',
  finalCtaSocialProofText = 'Un accompagnement structuré et orienté résultats',
  finalCtaUrgencyText = 'Je limite le nombre d’accompagnements chaque semaine pour garantir un suivi de qualité.',
}: ClarityActionBlockProps) {
  const filteredLeftItems = leftItems.filter((item) => item?.text?.trim());
  const filteredRightItems = rightItems.filter((item) => item?.text?.trim());

  const hasContent =
    title?.trim() || filteredLeftItems.length || filteredRightItems.length || finalCtaTitle?.trim();

  const [clientErrors, setClientErrors] = useState<Record<string, string>>({});

  const { data, setData, post, processing, errors, wasSuccessful, reset, clearErrors } = useForm({
    name: '',
    email: '',
    phone: '',
  });

  if (!enabled || !hasContent) return null;

  const validateBeforeSubmit = () => {
    const nextErrors: Record<string, string> = {};

    if (!data.name.trim()) {
      nextErrors.name = 'Le nom est requis.';
    }

    if (!data.email.trim()) {
      nextErrors.email = 'L’adresse e-mail est requise.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      nextErrors.email = 'Veuillez renseigner une adresse e-mail valide.';
    }

    if (!data.phone.trim()) {
      nextErrors.phone = 'Le téléphone est requis.';
    }

    return nextErrors;
  };

  const mergedErrors = {
    ...errors,
    ...clientErrors,
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    clearErrors();
    const validationErrors = validateBeforeSubmit();
    setClientErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    post(submitUrl, {
      preserveScroll: true,
      onSuccess: () => {
        reset();
        setClientErrors({});
      },
    });
  };

  const handleFieldChange = (field: 'name' | 'email' | 'phone', value: string) => {
    setData(field, value);

    if (clientErrors[field]) {
      setClientErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const inputClass = (hasError: boolean) =>
    `w-full rounded-2xl border px-4 py-4 text-white placeholder:text-slate-500 focus:outline-none ${
      hasError
        ? 'border-red-500 bg-[#081226]'
        : 'border-white/10 bg-[#081226] focus:border-[#EF3B36]'
    }`;

  return (
    <section className="py-20 md:py-24 bg-white dark:bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-start gap-10 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-7">
            <span className="inline-flex rounded-full bg-red-50 px-3 py-1 text-sm font-medium text-[#DA2E29] dark:bg-red-500/10">
              Transformation
            </span>

            {title ? (
              <h2 className="mt-5 text-4xl font-bold tracking-tight text-gray-900 dark:text-white md:text-5xl">
                {title}
              </h2>
            ) : null}

            {subtitle ? (
              <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">{subtitle}</p>
            ) : null}

            <div className="mt-10 grid gap-6 md:grid-cols-2">
              {/* PROBLÈME */}
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                <div className="mb-3 text-sm text-red-400">Situation actuelle</div>

                <h3 className="text-xl font-semibold text-white">
                  Vous avancez… mais sans direction vraiment claire
                </h3>

                <ul className="mt-4 space-y-3">
                  {filteredLeftItems.map((item, index) => (
                    <li key={index} className="flex items-start gap-3 text-sm text-slate-300">
                      <XCircle className="mt-0.5 h-5 w-5 text-red-500 flex-shrink-0" />
                      <span>{item.text}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* SOLUTION */}
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                <div className="mb-3 text-sm text-green-400">Résultat attendu</div>

                <h3 className="text-xl font-semibold text-white">
                  Ce que vous obtenez concrètement :
                </h3>

                <ul className="mt-4 space-y-3">
                  {filteredRightItems.map((item, index) => (
                    <li key={index} className="flex items-start gap-3 text-sm text-slate-300">
                      <CheckCircle className="mt-0.5 h-5 w-5 text-green-500 flex-shrink-0" />
                      <span>{item.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Phrase pivot */}
            <p className="mt-8 text-center text-sm text-slate-400">
              Et si vous pouviez avancer avec plus de clarté et de constance ?
            </p>
          </div>
          <div className="lg:col-span-5">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white md:text-3xl">
                {finalCtaTitle ?? 'Réservez un échange pour clarifier vos prochaines étapes'}
              </h3>

              <p className="mt-4 text-base leading-7 text-slate-300">
                {finalCtaSubtitle ??
                  'En 30 minutes, nous faisons le point sur votre situation, vos priorités et les actions les plus utiles pour avancer.'}
              </p>

              <form onSubmit={handleSubmit} className="mt-8 space-y-4" noValidate>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">Nom</label>
                  <input
                    type="text"
                    name="name"
                    value={data.name}
                    onChange={(e) => handleFieldChange('name', e.target.value)}
                    placeholder="Nom et prénom"
                    className={inputClass(!!mergedErrors.name)}
                  />
                  {mergedErrors.name ? (
                    <p className="mt-2 text-sm text-red-400">{mergedErrors.name}</p>
                  ) : null}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">E-mail</label>
                  <input
                    type="email"
                    name="email"
                    value={data.email}
                    onChange={(e) => handleFieldChange('email', e.target.value)}
                    placeholder="Votre adresse e-mail"
                    className={inputClass(!!mergedErrors.email)}
                  />
                  {mergedErrors.email ? (
                    <p className="mt-2 text-sm text-red-400">{mergedErrors.email}</p>
                  ) : null}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">Téléphone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={data.phone}
                    onChange={(e) => handleFieldChange('phone', e.target.value)}
                    placeholder="Votre numéro de téléphone"
                    className={inputClass(!!mergedErrors.phone)}
                  />
                  {mergedErrors.phone ? (
                    <p className="mt-2 text-sm text-red-400">{mergedErrors.phone}</p>
                  ) : null}
                </div>

                <button
                  type="submit"
                  disabled={processing}
                  className={`w-full flex items-center justify-center py-3 px-6 rounded-lg text-white font-medium text-lg transition-all duration-300 ${
                    processing
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-[#DA2E29] to-rose-600 hover:shadow-lg hover:shadow-[#DA2E29]/20'
                  }`}
                >
                  {processing ? (
                    <>
                      <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="white"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <Send size={20} className="mr-2" />
                      {finalCtaButtonText ?? 'Réserver mon appel découverte'}
                    </>
                  )}
                </button>

                {wasSuccessful ? (
                  <p className="text-center text-sm text-green-400">
                    Merci, votre demande a bien été envoyée.
                  </p>
                ) : (
                  <div className="space-y-2 text-center">
                    <p className="text-sm text-slate-400">30 minutes • Sans engagement</p>

                    <p className="text-sm font-medium text-white">{finalCtaSocialProofText}</p>

                    <p className="text-xs leading-6 text-slate-500">{finalCtaUrgencyText}</p>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
