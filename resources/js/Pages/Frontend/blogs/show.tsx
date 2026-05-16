import React, { useMemo, useRef } from 'react';
import { Head, Link } from '@inertiajs/react';
import { ArrowRight, Calendar, ChevronLeft, Clock, Eye, Share2 } from 'lucide-react';
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
  const { scrollYProgress } = useScroll({ target: articleRef, offset: ['start start', 'end end'] });
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);

  const onShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: postData?.title, text: postData?.excerpt, url });
      return;
    }
    await navigator.clipboard.writeText(url);
  };

  return (
    <FrontLayout>
      <Head title={postData?.title || 'Blog'} />

      {/* Barre de progression de lecture */}
      <motion.div
        className="fixed top-0 left-0 right-0 z-50 h-1 bg-[#da2e29] origin-left"
        style={{ scaleX }}
      />

      <main
        ref={articleRef}
        className="relative min-h-screen overflow-hidden bg-[#f7f6f2] pt-24 pb-20 dark:bg-slate-950"
      >
        <div className="pointer-events-none absolute -top-20 -left-16 h-72 w-72 rounded-full bg-[#da2e29]/15 blur-3xl" />

        <section className="mx-auto max-w-[1100px] px-6 md:px-8">
          <Link
            href={route('blogs')}
            className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-[#da2e29] dark:text-slate-300"
          >
            <ChevronLeft className="h-4 w-4" />
            Retour au blog
          </Link>

          <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <div className="relative">
              <img
                src={resolveImage(postData?.coverImage)}
                alt={postData?.title}
                loading="eager"
                decoding="async"
                fetchpriority="high"
                className="h-[380px] w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/25 to-transparent" />

              <div className="absolute bottom-0 left-0 z-10 w-full p-7 md:p-10">
                {postData?.category && (
                  <span className="inline-flex rounded-full bg-[#da2e29] px-3 py-1 text-xs font-medium text-white">
                    {postData.category}
                  </span>
                )}
                <h1 className="mt-4 max-w-3xl text-3xl font-semibold text-white md:text-5xl">
                  {postData?.title}
                </h1>
                <p className="mt-3 max-w-2xl text-white/85">{postData?.excerpt}</p>

                <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-white/85">
                  <span className="inline-flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {formatDate(postData?.publishedAt)}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {postData?.readTime}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    {postData?.views || 0} vues
                  </span>
                </div>
              </div>
            </div>

            <div className="p-7 md:p-10">
              <div className="mb-6 flex items-center justify-between gap-4 rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/60">
                <div className="flex items-center gap-3">
                  <img
                    src={postData?.author?.avatar || '/assets/images/avatar.jpg'}
                    alt={postData?.author?.name || 'Auteur'}
                    loading="lazy"
                    decoding="async"
                    className="h-11 w-11 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {postData?.author?.name || 'Anonyme'}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {postData?.author?.bio || 'Auteur de cet article'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={onShare}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
                >
                  <Share2 className="h-4 w-4" />
                  Partager
                </button>
              </div>

              <article
                className="prose max-w-none text-slate-700 dark:prose-invert dark:text-slate-300"
                dangerouslySetInnerHTML={{ __html: safeContent }}
              />

              {Array.isArray(postData?.tags) && postData.tags.length > 0 && (
                <div className="mt-8 flex flex-wrap gap-2">
                  {postData.tags.map((tag: string) => (
                    <span
                      key={tag}
                      className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {related.length > 0 && (
          <section className="mx-auto mt-14 max-w-[1320px] px-6 md:px-8">
            <div className="mb-8 flex items-end justify-between gap-4">
              <h2 className="text-2xl font-semibold text-slate-900 md:text-3xl dark:text-white">
                Articles similaires
              </h2>
              <Link href={route('blogs')} className="text-sm text-[#da2e29] hover:underline">
                Voir tout
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {related.map((item: any) => (
                <article
                  key={item.id}
                  className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-slate-700 dark:bg-slate-900"
                >
                  <Link href={route('blogs.details', item.slug)}>
                    <img
                      src={resolveImage(item.coverImage)}
                      alt={item.title}
                      className="h-52 w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  </Link>

                  <div className="p-6">
                    <p className="text-xs font-medium uppercase tracking-wide text-[#da2e29]">
                      {item.category || 'Article'}
                    </p>
                    <h3 className="mt-2 line-clamp-2 text-xl font-semibold text-slate-900 dark:text-white">
                      <Link href={route('blogs.details', item.slug)}>{item.title}</Link>
                    </h3>
                    <p className="mt-3 line-clamp-3 text-sm text-slate-600 dark:text-slate-300">
                      {item.excerpt}
                    </p>
                    <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
                      <span>{item?.author?.name}</span>
                      <span>{formatDate(item?.publishedAt)}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        <section className="mx-auto mt-12 max-w-[1320px] px-6 md:px-8">
          <div className="rounded-3xl bg-gradient-to-r from-[#da2e29] to-[#c62823] p-10 text-white md:p-12">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div>
                <p className="text-sm text-white/80">Vous voulez aller plus loin ?</p>
                <h3 className="mt-3 text-3xl font-semibold">
                  Parlons de vos objectifs et de votre strategie
                </h3>
              </div>
              <Link
                href={route('contact')}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-medium text-[#da2e29]"
              >
                Nous contacter
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>
    </FrontLayout>
  );
};

export default BlogPostDetail;
