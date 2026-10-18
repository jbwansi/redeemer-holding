import React, { useRef } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  average: number | null;
  count: number;
  personal: number | null;
  busy: boolean;
  disabled?: boolean;
  onRate: (rating: number | null) => void;
}
export default function PostRating({ average, count, personal, busy, disabled, onRate }: Props) {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const keyboard = (event: React.KeyboardEvent<HTMLInputElement>, value: number) => {
    const next =
      event.key === 'ArrowRight' || event.key === 'ArrowDown'
        ? (value % 5) + 1
        : event.key === 'ArrowLeft' || event.key === 'ArrowUp'
          ? ((value + 3) % 5) + 1
          : event.key === 'Home'
            ? 1
            : event.key === 'End'
              ? 5
              : null;
    if (next !== null) {
      event.preventDefault();
      inputs.current[next - 1]?.focus();
      onRate(next);
    }
  };
  return (
    <div className="min-w-0 space-y-2">
      <fieldset disabled={busy || disabled} aria-busy={busy}>
        <legend className="mb-2 font-semibold">Votre évaluation</legend>
        <div className="flex gap-0.5">
          {[1, 2, 3, 4, 5].map((value) => (
            <label
              key={value}
              className="relative inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg transition-colors hover:bg-amber-100/70 has-[:disabled]:cursor-wait has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[#da2e29] dark:hover:bg-amber-400/10"
            >
              <input
                ref={(input) => {
                  inputs.current[value - 1] = input;
                }}
                type="radio"
                name="blog-rating"
                value={value}
                checked={personal === value}
                aria-label={`${value} étoile${value > 1 ? 's' : ''}`}
                className="peer sr-only"
                onChange={() => onRate(value)}
                onKeyDown={(event) => keyboard(event, value)}
              />
              <Star
                aria-hidden="true"
                className={`h-7 w-7 text-amber-600 dark:text-amber-400 ${value <= (personal ?? 0) ? 'fill-current' : ''} peer-disabled:opacity-50`}
              />
            </label>
          ))}
        </div>
      </fieldset>
      <p className="text-sm text-slate-600 dark:text-slate-300" aria-live="polite">
        {average === null
          ? 'Aucune évaluation pour le moment.'
          : `${average.toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} / 5 · ${count} évaluation${count > 1 ? 's' : ''}`}
      </p>
      <p className="text-sm" aria-live="polite">
        {personal === null
          ? 'Vous n’avez pas encore noté cet article.'
          : `Votre note : ${personal} / 5`}
      </p>
      {personal !== null && (
        <Button
          type="button"
          variant="ghost"
          className="min-h-11 px-0 text-sm text-slate-600 underline underline-offset-4 hover:bg-transparent hover:text-[#da2e29] dark:text-slate-300 dark:hover:text-red-400"
          disabled={busy || disabled}
          onClick={() => onRate(null)}
        >
          Retirer ma note
        </Button>
      )}
    </div>
  );
}
