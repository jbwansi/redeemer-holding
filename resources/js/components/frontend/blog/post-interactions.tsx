import React, { useCallback, useEffect, useRef, useState } from 'react';
import { usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { blogError, blogRequest } from '@/lib/blog-interactions';
import type {
  BlogCommentsPage,
  BlogFormSession,
  BlogInteractionSummary,
} from '@/types/blog-interactions';
import PostLikeButton from './post-like-button';
import PostRating from './post-rating';
import PostCommentForm from './post-comment-form';
import PostComments from './post-comments';

export default function PostInteractions({ slug }: { slug: string }) {
  const { auth } = usePage<{ auth?: { user?: { id: number } | null } }>().props;
  return <InteractionPanel key={`${slug}:${auth?.user?.id ?? 'guest'}`} slug={slug} />;
}

function InteractionPanel({ slug }: { slug: string }) {
  const [summary, setSummary] = useState<BlogInteractionSummary | null>(null);
  const [summaryError, setSummaryError] = useState('');
  const [summaryBusy, setSummaryBusy] = useState(true);
  const [mutation, setMutation] = useState<'like' | 'rating' | null>(null);
  const [comments, setComments] = useState<BlogCommentsPage | null>(null);
  const [commentsBusy, setCommentsBusy] = useState(true);
  const [commentsError, setCommentsError] = useState('');
  const initialization = useRef<Promise<BlogFormSession> | null>(null);
  const savedSession = useRef<BlogFormSession | null>(null);
  const locked = useRef(false);
  const mounted = useRef(true);
  const commentsSequence = useRef(0);
  const summarySequence = useRef(0);

  const initialize = useCallback(
    (fresh = false): Promise<BlogFormSession> => {
      if (initialization.current) return initialization.current;
      if (!fresh && savedSession.current && Date.now() - savedSession.current.receivedAt < 3540000)
        return Promise.resolve(savedSession.current);
      const pending = blogRequest<{ comment_form_token: string }>(
        'blogs.interaction-session',
        slug,
        'post'
      )
        .then((data) => {
          const session = { token: data.comment_form_token, receivedAt: Date.now() };
          savedSession.current = session;
          return session;
        })
        .finally(() => {
          initialization.current = null;
        });
      initialization.current = pending;
      return pending;
    },
    [slug]
  );

  const loadSummary = useCallback(
    async (signal?: AbortSignal) => {
      const sequence = ++summarySequence.current;
      setSummaryBusy(true);
      setSummaryError('');
      try {
        const data = await blogRequest<BlogInteractionSummary>(
          'blogs.interactions',
          slug,
          'get',
          undefined,
          { signal }
        );
        if (mounted.current && !signal?.aborted && sequence === summarySequence.current)
          setSummary(data);
      } catch (failure) {
        if (mounted.current && !signal?.aborted && sequence === summarySequence.current)
          setSummaryError(blogError(failure).message);
      } finally {
        if (mounted.current && !signal?.aborted && sequence === summarySequence.current)
          setSummaryBusy(false);
      }
    },
    [slug]
  );

  const loadComments = useCallback(
    async (page = 1, signal?: AbortSignal) => {
      const sequence = ++commentsSequence.current;
      setCommentsBusy(true);
      setCommentsError('');
      try {
        const data = await blogRequest<BlogCommentsPage>(
          'blogs.comments.index',
          slug,
          'get',
          undefined,
          { page, signal }
        );
        if (mounted.current && !signal?.aborted && sequence === commentsSequence.current)
          setComments(data);
      } catch (failure) {
        if (mounted.current && !signal?.aborted && sequence === commentsSequence.current)
          setCommentsError(blogError(failure).message);
      } finally {
        if (mounted.current && !signal?.aborted && sequence === commentsSequence.current)
          setCommentsBusy(false);
      }
    },
    [slug]
  );

  useEffect(() => {
    mounted.current = true;
    const abort = new AbortController();
    void loadSummary(abort.signal);
    void loadComments(1, abort.signal);
    return () => {
      mounted.current = false;
      abort.abort();
    };
  }, [loadSummary, loadComments]);

  const mutate = async (kind: 'like' | 'rating', value: boolean | number | null) => {
    if (locked.current || !summary || summaryBusy) return;
    locked.current = true;
    setMutation(kind);
    setSummaryError('');
    try {
      await initialize();
      if (!mounted.current) return;
      const remove = value === false || value === null;
      const name =
        kind === 'like'
          ? remove
            ? 'blogs.likes.destroy'
            : 'blogs.likes.store'
          : remove
            ? 'blogs.ratings.destroy'
            : 'blogs.ratings.store';
      const data = await blogRequest<BlogInteractionSummary>(
        name,
        slug,
        remove ? 'delete' : 'put',
        kind === 'rating' && !remove ? { rating: value } : undefined
      );
      if (mounted.current) setSummary(data);
    } catch (failure) {
      if (mounted.current) setSummaryError(blogError(failure).message);
    } finally {
      locked.current = false;
      if (mounted.current) setMutation(null);
    }
  };

  return (
    <section
      aria-label="Réagir à cet article"
      className="mt-14 space-y-8 rounded-3xl border border-slate-200 bg-white p-5 text-slate-900 shadow-sm sm:p-8 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-100"
    >
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Votre avis compte</h2>
        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          Cet article vous a été utile ? Partagez votre appréciation.
        </p>
      </div>
      {summaryBusy && (
        <p role="status" className="text-sm">
          Chargement des réactions…
        </p>
      )}
      {summaryError && (
        <div role="alert" className="space-y-2 text-sm text-red-600 dark:text-red-400">
          <p>{summaryError}</p>
          <Button
            variant="outline"
            disabled={summaryBusy || mutation !== null}
            onClick={() => {
              void loadSummary();
            }}
          >
            Actualiser les réactions
          </Button>
        </div>
      )}
      {summary && (
        <div className="flex flex-col gap-6 rounded-2xl bg-slate-50 p-4 sm:flex-row sm:items-start sm:gap-8 sm:p-6 dark:bg-slate-800/50">
          <div className="space-y-3 sm:pt-9">
            <PostLikeButton
              count={summary.likes_count}
              liked={summary.liked}
              busy={mutation === 'like'}
              disabled={summaryBusy || mutation !== null}
              onToggle={() => {
                void mutate('like', !summary.liked);
              }}
            />
          </div>
          <PostRating
            average={summary.rating_average}
            count={summary.ratings_count}
            personal={summary.my_rating}
            busy={mutation === 'rating'}
            disabled={summaryBusy || mutation !== null}
            onRate={(value) => {
              void mutate('rating', value);
            }}
          />
        </div>
      )}
      <div className="border-t border-slate-200 pt-8 dark:border-slate-700">
        <PostComments
          page={comments}
          busy={commentsBusy}
          error={commentsError}
          onPage={(page) => {
            void loadComments(page);
          }}
        />
      </div>
      <div className="border-t border-slate-200 pt-8 dark:border-slate-700">
        <PostCommentForm
          slug={slug}
          initialize={initialize}
          invalidate={() => {
            savedSession.current = null;
          }}
        />
      </div>
    </section>
  );
}
