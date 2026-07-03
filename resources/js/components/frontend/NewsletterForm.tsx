import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { ArrowUpRight } from 'lucide-react';
import { route } from 'ziggy-js';

interface NewsletterFormProps {
  source?: string;
  buttonText?: string;
  showIcon?: boolean;
  className?: string;
}

export default function NewsletterForm({
  source = 'website',
  buttonText = "S'abonner",
  showIcon = true,
  className = '',
}: NewsletterFormProps) {
  const [success, setSuccess] = useState(false);

  const { data, setData, post, processing, errors, reset } = useForm({
    email: '',
    source,
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    post(route('newsletter.subscribe'), {
      preserveScroll: true,
      onSuccess: () => {
        reset('email');
        setSuccess(true);
      },
      onError: () => {
        setSuccess(false);
      },
    });
  };

  return (
    <div className={className}>
      <form onSubmit={handleSubmit} className="flex max-w-md">
        <input
          type="email"
          placeholder="Votre adresse email"
          value={data.email}
          onChange={(e) => {
            setData('email', e.target.value);
            setSuccess(false);
          }}
          required
          className="flex-1 rounded-l-lg border border-gray-200 bg-white px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#DA2E29]/50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
        />

        <button
          type="submit"
          disabled={processing}
          className="flex items-center justify-center rounded-r-lg bg-[#DA2E29] px-4 py-3 text-white transition-colors duration-300 hover:bg-[#c02824] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span className={showIcon ? 'hidden sm:inline mr-2' : ''}>
            {processing ? 'En cours...' : buttonText}
          </span>

          {showIcon && <ArrowUpRight size={18} />}
        </button>
      </form>

      {errors.email && <p className="mt-2 text-xs text-red-500">{errors.email}</p>}

      {success && !errors.email && (
        <p className="mt-2 text-xs text-green-600">
          Merci ! Vérifiez votre boîte mail pour confirmer votre abonnement.
        </p>
      )}

      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
        Je respecte votre vie privée. Désabonnez-vous à tout moment.
      </p>
    </div>
  );
}
