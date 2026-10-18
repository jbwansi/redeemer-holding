import React from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  count: number;
  liked: boolean;
  busy: boolean;
  disabled?: boolean;
  onToggle: () => void;
}
export default function PostLikeButton({ count, liked, busy, disabled, onToggle }: Props) {
  return (
    <Button
      type="button"
      variant="outline"
      onClick={onToggle}
      disabled={busy || disabled}
      aria-pressed={liked}
      aria-busy={busy}
      className={`min-h-11 w-full gap-2 rounded-xl border-[#da2e29]/30 px-4 sm:w-auto ${liked ? 'bg-[#da2e29] text-white hover:bg-[#b82320] hover:text-white' : 'bg-white text-[#da2e29] hover:bg-red-50 hover:text-[#b82320] dark:bg-slate-900 dark:text-red-400 dark:hover:bg-slate-800'}`}
    >
      <Heart aria-hidden="true" className={liked ? 'fill-current' : ''} />
      {busy ? 'Envoi…' : liked ? 'Vous aimez' : 'J’aime'}
      <span
        className="rounded-md bg-black/5 px-2 py-0.5 tabular-nums dark:bg-white/10"
        aria-label={`${count} mention${count > 1 ? 's' : ''} J’aime`}
      >
        {count}
      </span>
    </Button>
  );
}
