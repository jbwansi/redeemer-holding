import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { blogError, blogRequest } from '@/lib/blog-interactions';
import type { BlogApiError, BlogFormSession } from '@/types/blog-interactions';

interface Props {
  slug: string;
  initialize: (fresh?: boolean) => Promise<BlogFormSession>;
  invalidate: () => void;
}
export default function PostCommentForm({ slug, initialize, invalidate }: Props) {
  const [name, setName] = useState('');
  const [body, setBody] = useState('');
  const [website, setWebsite] = useState('');
  const [session, setSession] = useState<BlogFormSession | null>(null);
  const [preparing, setPreparing] = useState(false);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<BlogApiError | null>(null);
  const preparingRef = useRef(false);
  const submitting = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      clearTimeout(timer.current);
    };
  }, []);

  const prepare = async (fresh = false) => {
    if (preparingRef.current || (session && !fresh && Date.now() - session.receivedAt < 3540000))
      return;
    preparingRef.current = true;
    setPreparing(true);
    setReady(false);
    try {
      const next = await initialize(fresh);
      if (!mounted.current) return;
      setSession(next);
      if (!session) setError(null);
      clearTimeout(timer.current);
      timer.current = setTimeout(
        () => {
          if (mounted.current) setReady(true);
        },
        Math.max(0, 3100 - (Date.now() - next.receivedAt))
      );
    } catch (failure) {
      if (mounted.current) setError(blogError(failure));
    } finally {
      preparingRef.current = false;
      if (mounted.current) setPreparing(false);
    }
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (submitting.current || !ready || !session) return;
    if (Date.now() - session.receivedAt >= 3540000) {
      setError({
        message:
          'Le formulaire a été actualisé. Patientez quelques secondes puis renvoyez votre commentaire.',
        fields: {},
      });
      await prepare(true);
      return;
    }
    submitting.current = true;
    setBusy(true);
    setError(null);
    setSuccess(false);
    try {
      await blogRequest('blogs.comments.store', slug, 'post', {
        comment_form_token: session.token,
        display_name: name,
        body,
        website,
      });
      if (!mounted.current) return;
      setSuccess(true);
      setBody('');
      setWebsite('');
      setSession(null);
      setReady(false);
      invalidate();
    } catch (failure) {
      if (!mounted.current) return;
      const parsed = blogError(failure);
      setError(parsed);
      if (parsed.fields.comment_form_token) {
        setSession(null);
        setReady(false);
        invalidate();
      }
    } finally {
      submitting.current = false;
      if (mounted.current) setBusy(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      onFocus={() => {
        void prepare();
      }}
      className="space-y-5 rounded-2xl bg-slate-50 p-4 sm:p-6 dark:bg-slate-800/40"
      aria-label="Laisser un commentaire"
      aria-busy={busy}
    >
      <h3 className="text-xl font-semibold">Laisser un commentaire</h3>
      <p className="text-sm text-slate-600 dark:text-slate-300">
        Partagez votre expérience ou posez une question. Votre commentaire sera publié après
        validation par notre équipe.
      </p>
      <div className="space-y-2">
        <Label htmlFor="blog-comment-name">Votre prénom *</Label>
        <Input
          id="blog-comment-name"
          autoComplete="given-name"
          required
          maxLength={80}
          placeholder="Entrez votre prénom"
          className="h-12 rounded-xl border-slate-300 bg-white text-slate-900 placeholder:text-slate-500 focus-visible:ring-[#da2e29] dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-400"
          value={name}
          disabled={busy}
          aria-invalid={Boolean(error?.fields.display_name)}
          aria-describedby={error?.fields.display_name ? 'blog-name-error' : undefined}
          onChange={(event) => setName(event.target.value)}
        />
        {error?.fields.display_name && (
          <p id="blog-name-error" role="alert" className="text-sm text-red-600 dark:text-red-400">
            {error.fields.display_name}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="blog-comment-body">Votre commentaire *</Label>
        <Textarea
          id="blog-comment-body"
          required
          maxLength={3000}
          rows={5}
          placeholder="Une expérience à partager, une question à poser ? Écrivez votre commentaire ici…"
          className="min-h-36 resize-y rounded-xl border-slate-300 bg-white p-3 text-slate-900 placeholder:text-slate-500 focus-visible:ring-[#da2e29] dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-400"
          value={body}
          disabled={busy}
          aria-invalid={Boolean(error?.fields.body)}
          aria-describedby="blog-body-help blog-body-error"
          onChange={(event) => {
            setBody(event.target.value);
            setSuccess(false);
            void prepare();
          }}
        />
        <p id="blog-body-help" className="text-xs text-slate-600 dark:text-slate-400">
          {body.length} / 3 000 caractères · Texte brut uniquement
        </p>
        <p
          id="blog-body-error"
          role={error?.fields.body ? 'alert' : undefined}
          className="text-sm text-red-600 dark:text-red-400"
        >
          {error?.fields.body}
        </p>
      </div>
      <div className="hidden" aria-hidden="true">
        <label htmlFor="blog-comment-website">Site web</label>
        <input
          id="blog-comment-website"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(event) => setWebsite(event.target.value)}
        />
      </div>
      {error && (
        <div role="alert" className="space-y-1 text-sm text-red-600 dark:text-red-400">
          <p>{error.message}</p>
          {Object.entries(error.fields)
            .filter(([key]) => !['body', 'display_name'].includes(key))
            .map(([key, message]) => (
              <p key={key}>{message}</p>
            ))}
        </div>
      )}
      {!ready && !success && !error && (
        <p role="status" className="text-sm text-slate-600 dark:text-slate-300">
          {preparing || session
            ? 'Vérification en cours… L’envoi sera disponible dans quelques instants.'
            : 'Le formulaire se prépare automatiquement dès que vous commencez à le remplir.'}
        </p>
      )}
      {!session && !preparing && error && (
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            void prepare();
          }}
        >
          Réessayer la préparation
        </Button>
      )}
      <Button
        type="submit"
        disabled={busy || !ready || preparing}
        className="min-h-12 w-full rounded-xl bg-[#da2e29] px-6 text-white shadow-sm hover:bg-[#b82320] focus-visible:ring-[#da2e29] sm:w-auto"
      >
        {busy
          ? 'Envoi…'
          : preparing || (session && !ready)
            ? 'Préparation…'
            : 'Envoyer mon commentaire'}
      </Button>
      {success && (
        <p role="status" className="text-sm text-green-700 dark:text-green-400">
          Merci ! Votre commentaire a été envoyé et sera publié après validation.
        </p>
      )}
    </form>
  );
}
