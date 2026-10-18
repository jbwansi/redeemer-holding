import React, { useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';

export type CommentStatus = 'pending' | 'approved' | 'rejected' | 'spam';
export const statusLabels: Record<CommentStatus, string> = {
  pending: 'En attente',
  approved: 'Approuvé',
  rejected: 'Refusé',
  spam: 'Spam',
};
const actionLabels: Record<CommentStatus, string> = {
  pending: 'Remettre en attente',
  approved: 'Approuver',
  rejected: 'Refuser',
  spam: 'Marquer comme spam',
};
export interface ModerationComment {
  id: number;
  display_name: string;
  body: string;
  status: CommentStatus;
  created_at: string;
  version: number;
  allowed_statuses: CommentStatus[];
  post: { id: number; title: string; deleted: boolean };
}

export default function PostCommentsTable({ comments }: { comments: ModerationComment[] }) {
  const [selected, setSelected] = useState<ModerationComment | null>(null);
  const form = useForm({ status: 'pending' as CommentStatus, expected_version: 0, reason: '' });
  const errors = form.errors as Record<string, string | undefined>;

  const select = (comment: ModerationComment, status: CommentStatus) => {
    form.clearErrors();
    form.setData({ status, expected_version: comment.version, reason: '' });
    setSelected(comment);
  };
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!selected || form.processing) return;
    form.patch(route('post-comments.status', selected.id), {
      preserveScroll: true,
      onSuccess: () => {
        setSelected(null);
        form.reset();
      },
    });
  };

  return (
    <>
      {comments.length === 0 && (
        <p className="rounded-xl border p-8 text-center text-muted-foreground">
          Aucun commentaire pour ces filtres.
        </p>
      )}
      <ul className="space-y-4" aria-label="Commentaires à modérer">
        {comments.map((comment) => (
          <li key={comment.id} className="rounded-2xl border bg-card p-4 sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="break-words font-semibold">{comment.display_name}</p>
                <p className="break-words text-sm text-muted-foreground">
                  {comment.post.title}
                  {comment.post.deleted ? ' · Article dans la corbeille' : ''}
                </p>
                <time className="text-xs text-muted-foreground" dateTime={comment.created_at}>
                  {new Date(comment.created_at).toLocaleString('fr-FR')}
                </time>
              </div>
              <Badge variant="outline" className="self-start">
                {statusLabels[comment.status]}
              </Badge>
            </div>
            <p className="my-4 whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
              {comment.body}
            </p>
            <div className="flex flex-wrap gap-2">
              {comment.allowed_statuses.map((status) => (
                <Button key={status} variant="outline" onClick={() => select(comment, status)}>
                  {actionLabels[status]}
                </Button>
              ))}
            </div>
          </li>
        ))}
      </ul>
      <AlertDialog
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open && !form.processing) setSelected(null);
        }}
      >
        <AlertDialogContent className="max-h-[90vh] overflow-y-auto">
          <form onSubmit={submit} className="space-y-4">
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmer : {actionLabels[form.data.status]}</AlertDialogTitle>
              <AlertDialogDescription>
                Cette décision sera enregistrée dans l’historique de modération.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <p className="max-h-40 overflow-y-auto whitespace-pre-wrap break-words [overflow-wrap:anywhere] text-sm">
              {selected?.body}
            </p>
            <Label htmlFor="moderation-reason">Motif interne (facultatif)</Label>
            <Textarea
              id="moderation-reason"
              maxLength={2000}
              value={form.data.reason}
              onChange={(event) => form.setData('reason', event.target.value)}
              disabled={form.processing}
            />
            {Object.entries(errors).map(
              ([key, message]) =>
                message && (
                  <p key={key} role="alert" className="text-sm text-red-600">
                    {message}
                  </p>
                )
            )}
            {errors.conflict && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setSelected(null);
                  router.reload();
                }}
              >
                Recharger la liste
              </Button>
            )}
            <AlertDialogFooter>
              <AlertDialogCancel disabled={form.processing}>Annuler</AlertDialogCancel>
              <Button
                type="submit"
                className="bg-[#da2e29] text-white hover:bg-[#b82320]"
                disabled={form.processing || Boolean(errors.conflict)}
              >
                {form.processing ? 'Enregistrement…' : 'Confirmer'}
              </Button>
            </AlertDialogFooter>
          </form>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
