import React from 'react';
import { Button } from '@/components/ui/button';
import type { BlogCommentsPage } from '@/types/blog-interactions';

interface Props {
  page: BlogCommentsPage | null;
  busy: boolean;
  error: string;
  onPage: (page: number) => void;
}
export default function PostComments({ page, busy, error, onPage }: Props) {
  return (
    <section aria-label="Commentaires publiés" aria-busy={busy} className="space-y-4">
      <h3 className="text-xl font-semibold">Commentaires{page ? ` (${page.meta.total})` : ''}</h3>
      {busy && (
        <p role="status" className="text-sm text-slate-600 dark:text-slate-400">
          Chargement des commentaires…
        </p>
      )}
      {error && (
        <div role="alert" className="space-y-2 text-sm text-red-600 dark:text-red-400">
          <p>{error}</p>
          <Button
            variant="outline"
            disabled={busy}
            onClick={() => onPage(page?.meta.current_page ?? 1)}
          >
            Réessayer les commentaires
          </Button>
        </div>
      )}
      {page && page.data.length === 0 && !busy && (
        <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm leading-relaxed text-slate-600 dark:border-slate-700 dark:bg-slate-800/40 dark:text-slate-300">
          Soyez le premier à partager votre avis sur cet article !
        </p>
      )}
      <ul className="space-y-4">
        {page?.data.map((comment) => (
          <li
            key={comment.id}
            className="rounded-2xl border border-slate-100 bg-slate-50/80 p-5 dark:border-slate-700 dark:bg-slate-800/40"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="min-w-0 font-semibold [overflow-wrap:anywhere]">
                {comment.display_name}
              </p>
              <time
                dateTime={comment.created_at}
                className="text-xs text-slate-500 dark:text-slate-400"
              >
                {new Date(comment.created_at).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </time>
            </div>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700 [overflow-wrap:anywhere] dark:text-slate-200">
              {comment.body}
            </p>
          </li>
        ))}
      </ul>
      {page && page.meta.last_page > 1 && (
        <nav
          aria-label="Pagination des commentaires"
          className="flex flex-wrap items-center justify-between gap-3"
        >
          <Button
            variant="outline"
            disabled={busy || page.meta.current_page <= 1}
            onClick={() => onPage(page.meta.current_page - 1)}
          >
            Précédent
          </Button>
          <span className="text-sm" aria-live="polite">
            Page {page.meta.current_page} sur {page.meta.last_page}
          </span>
          <Button
            variant="outline"
            disabled={busy || page.meta.current_page >= page.meta.last_page}
            onClick={() => onPage(page.meta.current_page + 1)}
          >
            Suivant
          </Button>
        </nav>
      )}
    </section>
  );
}
