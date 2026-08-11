import React, { useMemo, useRef } from 'react';
import { Head, Link } from '@inertiajs/react';
import { Calendar, ChevronLeft, Clock, Eye, Share2 } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { route } from 'ziggy-js';
import DOMPurify from 'dompurify';
import FrontLayout from '@/components/frontend/layouts/front-layout';
import { PostResponse, SinglePostResponse } from '@/types/post';
import { formatDate } from '@/lib/utils';

interface Props {
  post: SinglePostResponse;
  relatedPosts: PostResponse;
}

const resolveImage = (image: any): string => {
  if (!image) return '/assets/images/coaching-session.jpg';
  if (typeof image === 'string') return image;

  return (
    image?.large ||
    image?.medium ||
    image?.original ||
    image?.thumbnail ||
    '/assets/images/coaching-session.jpg'
  );
};

const BlogPostDetail = ({ post, relatedPosts }: Props) => {
  const postData = post?.data;
  const related = relatedPosts?.data || [];

  const safeContent = useMemo(
    () => DOMPurify.sanitize(postData?.content || ''),
    [postData?.content]
  );

  const articleRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: articleRef,
    offset: ['start start', 'end end'],
  });

  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);

  const onShare = async () => {
    try {
      const url = window.location.href;

      if (navigator.share) {
        await navigator.share({
          title: postData?.title,
          text: postData?.excerpt,
          url,
        });
        return;
      }

      await navigator.clipboard.writeText(url);
    } catch {
      return;
    }
  };

  return (
    <FrontLayout>
      <Head title={postData?.title || 'Blog'} />

      <motion.div
        className="fixed top-0 left-0 right-0 z-50 h-1 origin-left bg-[#da2e29]"
        style={{ scaleX }}
      />

      <main ref={articleRef} className="min-h-screen bg-white pt-24 pb-20 dark:bg-slate-950">
        <section className="mx-auto max-w-[980px] px-6">
          <Link
            href={route('blogs')}
            className="mb-10 inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-[#da2e29] dark:text-slate-400"
          >
            <ChevronLeft className="h-4 w-4" />
            Retour au blog
          </Link>

          <header className="mb-10">
            {postData?.category && (
              <span className="inline-flex rounded-full bg-[#da2e29] px-4 py-1 text-xs font-semibold uppercase tracking-wider text-white">
                {postData.category}
              </span>
            )}

            <h1 className="mt-6 max-w-4xl text-4xl font-bold leading-tight text-slate-950 md:text-6xl dark:text-white">
              {postData?.title}
            </h1>

            {postData?.excerpt && (
              <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600 md:text-xl dark:text-slate-300">
                {postData.excerpt}
              </p>
            )}
          </header>

          <div className="mb-10 overflow-hidden rounded-3xl shadow-xl">
            <img
              src={resolveImage(postData?.coverImage)}
              alt={postData?.title || 'Image de couverture'}
              loading="eager"
              decoding="async"
              className="w-full object-contain"
            />
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm md:p-10 dark:border-slate-800 dark:bg-slate-900/80">
            <div className="mb-10 flex flex-wrap items-center justify-between gap-6 rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/60">
              <div className="flex items-center gap-3">
                <img
                  src={postData?.author?.avatar || '/assets/images/avatar.jpg'}
                  alt={postData?.author?.name || 'Auteur'}
                  className="h-12 w-12 rounded-full object-cover"
                />

                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {postData?.author?.name || 'Redeemer Holding'}
                  </p>

                  <div className="mt-1 flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="h-4 w-4" />
                      {formatDate(postData?.publishedAt)}
                    </span>

                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="h-4 w-4" />
                      {postData?.readTime}
                    </span>

                    <span className="inline-flex items-center gap-1.5">
                      <Eye className="h-4 w-4" />
                      {postData?.views || 0} vues
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={onShare}
                type="button"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <Share2 className="h-4 w-4" />
                Partager
              </button>
            </div>

            <article
              className="
    max-w-none
    text-[16px]
    leading-[1.45]
    text-slate-700
    dark:text-slate-100

    [&_p]:mb-1
    [&_p]:text-[16px]
    [&_p]:leading-[1.45]

    [&_h1]:mb-2
    [&_h1]:text-[24px]
    [&_h1]:font-bold
    [&_h1]:leading-tight

    [&_h2]:mt-6
    [&_h2]:mb-2
    [&_h2]:text-[22px]
    [&_h2]:font-semibold
    [&_h2]:leading-tight

    [&_h3]:mt-5
    [&_h3]:mb-2
    [&_h3]:text-[18px]
    [&_h3]:font-semibold

    [&_ul]:my-1
    [&_ul]:ml-6
    [&_ul]:list-disc

    [&_li]:my-0
    [&_li]:pl-1
    [&_li]:leading-[1.45]

    [&_strong]:font-bold
    [&_strong]:text-slate-900
    dark:[&_strong]:text-white
  "
              dangerouslySetInnerHTML={{ __html: safeContent }}
            />
          </div>

          {Array.isArray(postData?.tags) && postData.tags.length > 0 && (
            <div className="mx-auto mt-14 flex flex-wrap gap-3">
              {postData.tags.map((tag: string) => (
                <span
                  key={tag}
                  className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </section>

        {related.length > 0 && (
          <section className="mx-auto mt-24 max-w-7xl px-6">
            <h2 className="mb-10 text-3xl font-bold text-slate-950 dark:text-white">
              Articles similaires
            </h2>

            <div className="grid gap-8 md:grid-cols-3">
              {related.map((item: any) => (
                <article
                  key={item.id}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-2 hover:shadow-xl dark:border-slate-700 dark:bg-slate-900"
                >
                  <Link href={route('blogs.details', item.slug)}>
                    <img
                      src={resolveImage(item.coverImage)}
                      alt={item.title}
                      className="h-56 w-full object-cover"
                    />
                  </Link>

                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-slate-950 dark:text-white">
                      <Link href={route('blogs.details', item.slug)}>{item.title}</Link>
                    </h3>
                    <p className="mt-4 line-clamp-3 text-slate-600 dark:text-slate-300">
                      {item.excerpt}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </main>
    </FrontLayout>
  );
};

export default BlogPostDetail;
