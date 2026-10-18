import React, { useEffect, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import PostCommentsTable, {
  ModerationComment,
  statusLabels,
} from '@/components/partials/post-comments-table';

interface Props {
  comments: {
    data: ModerationComment[];
    current_page: number;
    last_page: number;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
  };
  filters: { status: string; post_id: string };
  posts: { id: number; title: string }[];
  flash?: { success?: string };
  errors?: Record<string, string>;
}

export default function CommentsIndex({ comments, filters, posts, flash, errors }: Props) {
  const [selection, setSelection] = useState(filters);
  useEffect(() => setSelection(filters), [filters]);
  const filter = (event: React.FormEvent) => {
    event.preventDefault();
    router.get(route('post-comments.index'), selection, {
      preserveState: true,
      preserveScroll: true,
    });
  };

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <Head title="Commentaires du blog" />
      <div className="rounded-2xl border bg-card p-6">
        <h1 className="text-2xl font-semibold">Commentaires du blog</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Examinez les contributions avant leur publication.
        </p>
      </div>
      {flash?.success && (
        <p
          role="status"
          className="rounded-xl border border-green-300 p-4 text-green-700 dark:text-green-400"
        >
          {flash.success}
        </p>
      )}
      {Object.entries(errors ?? {})
        .filter(([key]) => ['status', 'post_id', 'page'].includes(key))
        .map(([key, message]) => (
          <p key={key} role="alert" className="text-red-600">
            {message}
          </p>
        ))}
      <form
        onSubmit={filter}
        className="flex flex-col gap-4 rounded-xl border bg-card p-4 sm:flex-row sm:items-end"
      >
        <div className="space-y-2">
          <Label htmlFor="comment-status-filter">Statut</Label>
          <select
            id="comment-status-filter"
            className="block w-full rounded-md border bg-background p-2"
            value={selection.status}
            onChange={(event) => setSelection({ ...selection, status: event.target.value })}
          >
            <option value="">Tous les statuts</option>
            {Object.entries(statusLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <Label htmlFor="comment-post-filter">Article</Label>
          <select
            id="comment-post-filter"
            className="block w-full rounded-md border bg-background p-2"
            value={selection.post_id}
            onChange={(event) => setSelection({ ...selection, post_id: event.target.value })}
          >
            <option value="">Tous les articles</option>
            {posts.map((post) => (
              <option key={post.id} value={post.id}>
                {post.title}
              </option>
            ))}
          </select>
        </div>
        <Button type="submit" className="bg-[#da2e29] text-white hover:bg-[#b82320]">
          Filtrer
        </Button>
        <Link href={route('post-comments.index')} className="p-2 text-sm underline">
          Réinitialiser
        </Link>
      </form>
      <p className="text-sm text-muted-foreground">{comments.total} commentaire(s)</p>
      <PostCommentsTable comments={comments.data} />
      <nav
        aria-label="Pagination des commentaires"
        className="flex flex-wrap items-center justify-between gap-3"
      >
        <Button
          variant="outline"
          disabled={!comments.prev_page_url}
          onClick={() =>
            comments.prev_page_url &&
            router.get(comments.prev_page_url, {}, { preserveScroll: true })
          }
        >
          Précédent
        </Button>
        <span className="text-sm">
          Page {comments.current_page} sur {comments.last_page}
        </span>
        <Button
          variant="outline"
          disabled={!comments.next_page_url}
          onClick={() =>
            comments.next_page_url &&
            router.get(comments.next_page_url, {}, { preserveScroll: true })
          }
        >
          Suivant
        </Button>
      </nav>
    </div>
  );
}
