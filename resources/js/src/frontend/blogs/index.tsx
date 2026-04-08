import React, { useMemo, useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowRight, Calendar, Clock, Search, Sparkles, Tag } from 'lucide-react';
import { route } from 'ziggy-js';
import FrontLayout from '@/components/frontend/layouts/front-layout';
import { formatDate } from '@/lib/utils';
import { PostResponse, SinglePostResponse } from '@/types/post';

interface Props {
    posts: PostResponse;
    categories: any[];
    tags: string[];
    featuredPost: SinglePostResponse;
}

const resolveImage = (image: any): string => {
    if (!image) return '/assets/images/coaching-session.jpg';
    if (typeof image === 'string') return image;
    return image?.large || image?.medium || image?.original || image?.thumbnail || '/assets/images/coaching-session.jpg';
};

const BlogPage = ({ posts, categories, tags, featuredPost }: Props) => {
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedTag, setSelectedTag] = useState<string | null>(null);

    const allPosts = posts?.data ?? [];
    const currentPage = posts?.meta?.current_page ?? 1;
    const lastPage = posts?.meta?.last_page ?? 1;
    const featured = (featuredPost?.data?.id ? featuredPost.data : null) ?? allPosts?.[0] ?? null;
    const allCategories = categories ?? [];
    const uniqueTags = useMemo(() => Array.from(new Set((tags || []).filter(Boolean))).slice(0, 12), [tags]);

    const filteredPosts = useMemo(() => {
        return allPosts.filter((post: any) => {
            const term = search.toLowerCase();
            const title = post?.title?.toLowerCase?.() || '';
            const excerpt = post?.excerpt?.toLowerCase?.() || '';
            const postTags = Array.isArray(post?.tags) ? post.tags : [];
            const categoryName = post?.category || post?.categories?.[0]?.name || null;

            const matchesSearch = !search.trim() || title.includes(term) || excerpt.includes(term) || postTags.join(' ').toLowerCase().includes(term);
            const matchesCategory = !selectedCategory || categoryName === selectedCategory;
            const matchesTag = !selectedTag || postTags.includes(selectedTag);

            return matchesSearch && matchesCategory && matchesTag;
        });
    }, [allPosts, search, selectedCategory, selectedTag]);

    return (
        <FrontLayout>
            <Head title="Blogs" />

            <main className="relative min-h-screen overflow-hidden bg-[#f7f6f2] pt-28 pb-20 dark:bg-slate-950">
                <div className="pointer-events-none absolute -top-20 -left-16 h-72 w-72 rounded-full bg-[#da2e29]/15 blur-3xl" />
                <div className="pointer-events-none absolute bottom-0 right-0 h-80 w-80 rounded-full bg-[#0f766e]/10 blur-3xl" />

                <section className="mx-auto max-w-[1320px] px-6 md:px-8">
                    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                        <span className="inline-flex items-center gap-2 rounded-full border border-[#da2e29]/30 bg-white/80 px-4 py-1 text-xs uppercase tracking-wide text-[#da2e29] dark:bg-slate-900/70">
                            <Sparkles className="h-3.5 w-3.5" />
                            Blog
                        </span>
                        <h1 className="mt-5 max-w-4xl text-4xl font-semibold leading-tight text-slate-900 md:text-6xl dark:text-white">
                            Des idees fortes, du concret, et des contenus utiles pour votre croissance
                        </h1>
                        <p className="mt-5 max-w-2xl text-lg text-slate-600 dark:text-slate-300">
                            Parcourez nos analyses, conseils et retours d'experience pour progresser avec clarte et constance.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.55, delay: 0.1 }}
                        className="mt-8"
                    >
                        <div className="relative w-full md:max-w-xl">
                            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Rechercher un article"
                                className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm outline-none transition focus:border-[#da2e29] dark:border-slate-700 dark:bg-slate-900"
                            />
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                            <button
                                type="button"
                                onClick={() => setSelectedCategory(null)}
                                className={`rounded-full px-3 py-1 text-xs font-medium ${
                                    selectedCategory === null
                                        ? 'bg-[#da2e29] text-white'
                                        : 'bg-white text-slate-700 ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-700'
                                }`}
                            >
                                Toutes les categories
                            </button>

                            {allCategories.map((category: any) => (
                                <button
                                    key={category.id}
                                    type="button"
                                    onClick={() => setSelectedCategory(category.name)}
                                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                                        selectedCategory === category.name
                                            ? 'bg-[#da2e29] text-white'
                                            : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-700 dark:hover:bg-slate-800'
                                    }`}
                                >
                                    {category.name}
                                </button>
                            ))}
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                            <button
                                type="button"
                                onClick={() => setSelectedTag(null)}
                                className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${
                                    selectedTag === null
                                        ? 'bg-[#0f766e] text-white'
                                        : 'bg-white text-slate-700 ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-700'
                                }`}
                            >
                                <Tag className="h-3.5 w-3.5" />
                                Tous les tags
                            </button>

                            {uniqueTags.map((tag) => (
                                <button
                                    key={tag}
                                    type="button"
                                    onClick={() => setSelectedTag(tag)}
                                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                                        selectedTag === tag
                                            ? 'bg-[#0f766e] text-white'
                                            : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-700 dark:hover:bg-slate-800'
                                    }`}
                                >
                                    #{tag}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                </section>

                {featured && (
                    <section className="mx-auto mt-14 max-w-[1320px] px-6 md:px-8">
                        <motion.div
                            initial={{ opacity: 0, y: 18 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.2 }}
                            transition={{ duration: 0.55 }}
                            className="relative overflow-hidden rounded-3xl"
                        >
                            <img src={resolveImage(featured?.coverImage)} alt={featured?.title} className="h-[420px] w-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/30 to-black/10" />

                            <div className="absolute inset-0 z-10 p-8 md:p-12">
                                <span className="inline-flex items-center rounded-full bg-[#da2e29] px-3 py-1 text-xs font-medium text-white">Article a la une</span>
                                <h2 className="mt-5 max-w-3xl text-3xl font-semibold text-white md:text-5xl">{featured?.title}</h2>
                                <p className="mt-4 max-w-2xl text-white/85 line-clamp-3">{featured?.excerpt}</p>

                                <div className="mt-7 flex flex-wrap items-center gap-4 text-sm text-white/90">
                                    <span className="inline-flex items-center gap-2"><Calendar className="h-4 w-4" />{formatDate(featured?.publishedAt)}</span>
                                    <span className="inline-flex items-center gap-2"><Clock className="h-4 w-4" />{featured?.readTime}</span>
                                </div>

                                <Link
                                    href={route('blogs.details', featured?.slug)}
                                    className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-medium text-[#da2e29] hover:bg-slate-100"
                                >
                                    Lire l'article
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </div>
                        </motion.div>
                    </section>
                )}

                <section className="mx-auto mt-16 max-w-[1320px] px-6 md:px-8">
                    <div className="mb-8 flex items-end justify-between gap-4">
                        <h2 className="text-2xl font-semibold text-slate-900 md:text-3xl dark:text-white">Articles recents</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{filteredPosts.length} resultat(s)</p>
                    </div>

                    {filteredPosts.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500 dark:border-slate-700 dark:bg-slate-900">
                            Aucun article ne correspond a votre recherche.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                            {filteredPosts.map((post: any) => (
                                <article key={post.id} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-slate-700 dark:bg-slate-900">
                                    <Link href={route('blogs.details', post.slug)}>
                                        <img src={resolveImage(post.coverImage)} alt={post.title} className="h-52 w-full object-cover transition duration-500 group-hover:scale-105" />
                                    </Link>

                                    <div className="p-6">
                                        <p className="text-xs font-medium uppercase tracking-wide text-[#da2e29]">{post.category || post?.categories?.[0]?.name || 'Article'}</p>
                                        <h3 className="mt-2 line-clamp-2 text-xl font-semibold text-slate-900 dark:text-white">
                                            <Link href={route('blogs.details', post.slug)}>{post.title}</Link>
                                        </h3>
                                        <p className="mt-3 line-clamp-3 text-sm text-slate-600 dark:text-slate-300">{post.excerpt}</p>

                                        <div className="mt-4 flex flex-wrap gap-2">
                                            {(post.tags || []).slice(0, 3).map((tag: string) => (
                                                <button
                                                    key={`${post.id}-${tag}`}
                                                    type="button"
                                                    onClick={() => setSelectedTag(tag)}
                                                    className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                                                >
                                                    #{tag}
                                                </button>
                                            ))}
                                        </div>

                                        <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
                                            <span>{post?.author?.name}</span>
                                            <span>{formatDate(post?.publishedAt)}</span>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}

                    {lastPage > 1 && (
                        <div className="mt-10 flex items-center justify-center gap-3">
                            <Link
                                href={route('blogs', { page: currentPage - 1 })}
                                className={`rounded-lg px-4 py-2 text-sm font-medium ${currentPage <= 1 ? 'pointer-events-none bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-500' : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-700'}`}
                            >
                                Precedent
                            </Link>
                            <span className="text-sm text-slate-500 dark:text-slate-400">Page {currentPage} / {lastPage}</span>
                            <Link
                                href={route('blogs', { page: currentPage + 1 })}
                                className={`rounded-lg px-4 py-2 text-sm font-medium ${currentPage >= lastPage ? 'pointer-events-none bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-500' : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-700'}`}
                            >
                                Suivant
                            </Link>
                        </div>
                    )}
                </section>
            </main>
        </FrontLayout>
    );
};

export default BlogPage;
